/**
 * Idempotent E2E fixtures for admin-dashboard Playwright suite.
 *
 * Usage (from repo root):
 *   npm run seed:e2e -w laundry-backend
 *
 * Override credentials with E2E_* env vars (see apps/admin-dashboard/.env.example).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { OrderStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../src/config/prisma";
import { env } from "../src/config/env";

/** Local-only fixture defaults. In CI every E2E_* value must be provided via env. */
function e2eEnv(name: string, localDefault: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.CI) {
    throw new Error(`Missing required env ${name} for seed:e2e in CI`);
  }
  return localDefault;
}

const fixtures = {
  admin: {
    email: e2eEnv("E2E_ADMIN_EMAIL", "e2e.admin@laundry.test").toLowerCase(),
    password: e2eEnv("E2E_ADMIN_PASSWORD", "E2eAdminPass123!"),
    name: "E2E Admin",
  },
  customer: {
    email: e2eEnv("E2E_CUSTOMER_EMAIL", "e2e.customer@laundry.test").toLowerCase(),
    password: e2eEnv("E2E_CUSTOMER_PASSWORD", "E2eCustomerPass123!"),
    name: "E2E Customer",
  },
  courier: {
    email: e2eEnv("E2E_COURIER_EMAIL", "e2e.courier@laundry.test").toLowerCase(),
    password: e2eEnv("E2E_COURIER_PASSWORD", "E2eCourierPass123!"),
    name: "E2E Courier",
  },
};

async function upsertUser(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(input.password, env.bcryptCost);
  const user = await prisma.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      phone: null,
    },
    update: {
      name: input.name,
      passwordHash,
      role: input.role,
    },
  });
  return user;
}

async function ensureAvailableCourier(userId: string) {
  return prisma.courier.upsert({
    where: { userId },
    create: {
      userId,
      isAvailable: true,
      lastActiveAt: new Date(),
    },
    update: {
      isAvailable: true,
      lastActiveAt: new Date(),
    },
  });
}

async function ensurePendingOrder(customerId: string) {
  const existing = await prisma.order.findFirst({
    where: {
      customerId,
      status: OrderStatus.pending,
      courierId: null,
      pickupAddress: { startsWith: "[E2E]" },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const weightKg = 2;
  const pricePerKg = 10000;
  const subtotal = weightKg * pricePerKg;

  return prisma.order.create({
    data: {
      customerId,
      status: OrderStatus.pending,
      pickupAddress: "[E2E] Pickup Jl. Testing 1",
      deliveryAddress: "[E2E] Delivery Jl. Testing 2",
      totalPrice: new Prisma.Decimal(subtotal.toFixed(2)),
      paymentStatus: "unpaid",
      items: {
        create: [
          {
            name: "E2E Kiloan",
            weightKg: new Prisma.Decimal(weightKg),
            pricePerKg: new Prisma.Decimal(pricePerKg),
            subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          },
        ],
      },
    },
  });
}

async function main() {
  const admin = await upsertUser({ ...fixtures.admin, role: UserRole.admin });
  const customer = await upsertUser({
    ...fixtures.customer,
    role: UserRole.customer,
  });
  const courierUser = await upsertUser({
    ...fixtures.courier,
    role: UserRole.courier,
  });
  const courier = await ensureAvailableCourier(courierUser.id);
  const pendingOrder = await ensurePendingOrder(customer.id);

  console.log("E2E seed complete:");
  console.log(
    JSON.stringify(
      {
        admin: { id: admin.id, email: fixtures.admin.email },
        customer: { id: customer.id, email: fixtures.customer.email },
        courier: {
          id: courier.id,
          userId: courierUser.id,
          email: fixtures.courier.email,
          isAvailable: courier.isAvailable,
        },
        pendingOrder: { id: pendingOrder.id, status: pendingOrder.status },
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
