export const ORDER_STATUSES = [
  "pending",
  "picked_up",
  "washing",
  "done",
  "delivering",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  id: string;
  orderId: string;
  name: string;
  weightKg: string;
  pricePerKg: string;
  subtotal: string;
};

/** Shape returned by GET /api/orders (backend serializeOrder). */
export type Order = {
  id: string;
  customerId: string;
  courierId: string | null;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  totalPrice: string;
  paymentStatus: string;
  proofPhotoUrl: string | null;
  scheduledPickupAt: string | null;
  estimatedDoneAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};

/** Payload for Socket.io `order:status_changed` (and fields on `order:assigned`). */
export type OrderStatusChangedEvent = {
  orderId: string;
  status: OrderStatus;
  customerId?: string;
  courierId?: string | null;
};
