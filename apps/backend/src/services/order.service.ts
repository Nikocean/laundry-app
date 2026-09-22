import { OrderStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";
import type { AuthUser } from "../middleware/auth";
import { assertValidTransition, requiresProofPhoto } from "./orderStateMachine";
import {
  emitOrderAssigned,
  emitOrderStatusChanged,
} from "../realtime/emitter";
import { sendPushToUser } from "./fcm.service";

type OrderItemInput = {
  name: string;
  weightKg: number;
  pricePerKg: number;
};

function serializeOrder<T extends { totalPrice: Prisma.Decimal; items?: Array<{ weightKg: Prisma.Decimal; pricePerKg: Prisma.Decimal; subtotal: Prisma.Decimal }> }>(
  order: T
) {
  return {
    ...order,
    totalPrice: order.totalPrice.toString(),
    items: order.items?.map((item) => ({
      ...item,
      weightKg: item.weightKg.toString(),
      pricePerKg: item.pricePerKg.toString(),
      subtotal: item.subtotal.toString(),
    })),
  };
}

export async function listOrders(actor: AuthUser) {
  const where =
    actor.role === UserRole.admin
      ? {}
      : actor.role === UserRole.courier
        ? { courierId: actor.id }
        : { customerId: actor.id };

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
}

export async function getOrderById(actor: AuthUser, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const allowed =
    actor.role === UserRole.admin ||
    order.customerId === actor.id ||
    order.courierId === actor.id;

  if (!allowed) {
    throw new AppError(403, "Forbidden");
  }

  return serializeOrder(order);
}

export async function createOrder(
  actor: AuthUser,
  input: {
    pickupAddress: string;
    deliveryAddress: string;
    items: OrderItemInput[];
    scheduledPickupAt?: string;
  }
) {
  if (actor.role !== UserRole.customer && actor.role !== UserRole.admin) {
    throw new AppError(403, "Only customers can create orders");
  }

  const pickupAddress = input.pickupAddress?.trim();
  const deliveryAddress = input.deliveryAddress?.trim();
  if (!pickupAddress || !deliveryAddress) {
    throw new AppError(400, "pickupAddress and deliveryAddress are required");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new AppError(400, "items must be a non-empty array");
  }

  const itemsData = input.items.map((item) => {
    const name = item.name?.trim();
    if (!name) throw new AppError(400, "each item requires a name");
    if (typeof item.weightKg !== "number" || item.weightKg <= 0) {
      throw new AppError(400, "each item requires weightKg > 0");
    }
    if (typeof item.pricePerKg !== "number" || item.pricePerKg < 0) {
      throw new AppError(400, "each item requires pricePerKg >= 0");
    }
    const subtotal = Number((item.weightKg * item.pricePerKg).toFixed(2));
    return {
      name,
      weightKg: new Prisma.Decimal(item.weightKg),
      pricePerKg: new Prisma.Decimal(item.pricePerKg),
      subtotal: new Prisma.Decimal(subtotal),
    };
  });

  const totalPrice = itemsData.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );

  let scheduledPickupAt: Date | null = null;
  if (input.scheduledPickupAt) {
    scheduledPickupAt = new Date(input.scheduledPickupAt);
    if (Number.isNaN(scheduledPickupAt.getTime())) {
      throw new AppError(400, "scheduledPickupAt must be a valid ISO date");
    }
  }

  const order = await prisma.order.create({
    data: {
      customerId: actor.id,
      pickupAddress,
      deliveryAddress,
      totalPrice: new Prisma.Decimal(totalPrice.toFixed(2)),
      scheduledPickupAt,
      items: { create: itemsData },
    },
    include: { items: true },
  });

  return serializeOrder(order);
}

function parseStatus(value: unknown): OrderStatus {
  const statuses = Object.values(OrderStatus) as string[];
  if (typeof value !== "string" || !statuses.includes(value)) {
    throw new AppError(400, "Invalid status value");
  }
  return value as OrderStatus;
}

/**
 * PATCH /api/orders/:id/status
 * customer: cancel only; courier: assigned order; admin: all
 */
export async function updateOrderStatus(
  actor: AuthUser,
  orderId: string,
  input: { status: unknown; proofPhotoUrl?: string }
) {
  const nextStatus = parseStatus(input.status);
  const proofPhotoUrl = input.proofPhotoUrl?.trim();

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    throw new AppError(404, "Order not found");
  }

  if (actor.role === UserRole.customer) {
    if (existing.customerId !== actor.id) {
      throw new AppError(403, "Forbidden");
    }
    if (nextStatus !== OrderStatus.cancelled) {
      throw new AppError(403, "Customers may only cancel orders");
    }
  } else if (actor.role === UserRole.courier) {
    if (existing.courierId !== actor.id) {
      throw new AppError(403, "Courier is not assigned to this order");
    }
  } else if (actor.role !== UserRole.admin) {
    throw new AppError(403, "Forbidden");
  }

  assertValidTransition(existing.status, nextStatus);

  if (requiresProofPhoto(nextStatus) && !proofPhotoUrl && !existing.proofPhotoUrl) {
    throw new AppError(
      400,
      `proofPhotoUrl is required when transitioning to '${nextStatus}'`
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        ...(proofPhotoUrl ? { proofPhotoUrl } : {}),
      },
      include: { items: true },
    });

    await tx.notification.create({
      data: {
        userId: updated.customerId,
        title: "Order status updated",
        body: `Your order is now ${nextStatus}.`,
        type: "order_status_changed",
      },
    });

    return updated;
  });

  emitOrderStatusChanged({
    orderId: order.id,
    status: order.status,
    customerId: order.customerId,
    courierId: order.courierId,
  });

  return serializeOrder(order);
}

/**
 * POST /api/orders/:id/assign — admin only (also enforced at route).
 * courierId = users.id of the courier (orders.courier_id → users).
 */
export async function assignCourier(
  actor: AuthUser,
  orderId: string,
  courierUserId: string
) {
  if (actor.role !== UserRole.admin) {
    throw new AppError(403, "Forbidden");
  }
  if (!courierUserId?.trim()) {
    throw new AppError(400, "courierId is required");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const courierProfile = await prisma.courier.findUnique({
    where: { userId: courierUserId },
  });
  if (!courierProfile) {
    throw new AppError(404, "Courier profile not found");
  }
  if (!courierProfile.isAvailable) {
    throw new AppError(400, "Courier is not available");
  }

  const nextStatus =
    order.status === OrderStatus.pending
      ? OrderStatus.picked_up
      : order.status;

  if (nextStatus !== order.status) {
    assertValidTransition(order.status, nextStatus);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: orderId },
      data: {
        courierId: courierUserId,
        status: nextStatus,
      },
      include: { items: true },
    });

    if (nextStatus !== order.status) {
      await tx.notification.create({
        data: {
          userId: result.customerId,
          title: "Order status updated",
          body: `Your order is now ${nextStatus}.`,
          type: "order_status_changed",
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: courierUserId,
        title: "New order assigned",
        body: `You have been assigned to order ${orderId}.`,
        type: "order_assigned",
      },
    });

    return result;
  });

  if (nextStatus !== order.status) {
    emitOrderStatusChanged({
      orderId: updated.id,
      status: updated.status,
      customerId: updated.customerId,
      courierId: updated.courierId,
    });
  }

  emitOrderAssigned({
    orderId: updated.id,
    status: updated.status,
    courierId: courierUserId,
    customerId: updated.customerId,
  });

  await sendPushToUser(courierUserId, {
    title: "New order assigned",
    body: `You have been assigned to order ${orderId}.`,
    data: { orderId },
  });

  return serializeOrder(updated);
}

/** Sets proof photo URL (Cloudinary upload = later). */
export async function setProofPhoto(
  actor: AuthUser,
  orderId: string,
  proofPhotoUrl: string
) {
  const url = proofPhotoUrl?.trim();
  if (!url) {
    throw new AppError(400, "proofPhotoUrl is required");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const allowed =
    actor.role === UserRole.admin ||
    (actor.role === UserRole.courier && order.courierId === actor.id);

  if (!allowed) {
    throw new AppError(403, "Forbidden");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { proofPhotoUrl: url },
    include: { items: true },
  });

  return serializeOrder(updated);
}
