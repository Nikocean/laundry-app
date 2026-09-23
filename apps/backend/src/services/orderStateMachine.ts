import { OrderStatus } from "@prisma/client";
import { AppError } from "../utils/errors";

/** Forward path per REQ-ORDER-01. cancelled only from pending | picked_up. */
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending: [OrderStatus.picked_up, OrderStatus.cancelled],
  picked_up: [OrderStatus.washing, OrderStatus.cancelled],
  washing: [OrderStatus.done],
  done: [OrderStatus.delivering],
  delivering: [OrderStatus.delivered],
  delivered: [],
  cancelled: [],
};

const PROOF_REQUIRED: OrderStatus[] = [
  OrderStatus.picked_up,
  OrderStatus.delivering,
  OrderStatus.delivered,
];

export function assertValidTransition(from: OrderStatus, to: OrderStatus): void {
  const allowed = ALLOWED[from] ?? [];
  if (!allowed.includes(to)) {
    throw new AppError(
      400,
      `Invalid status transition from '${from}' to '${to}'`
    );
  }
}

export function requiresProofPhoto(to: OrderStatus): boolean {
  return PROOF_REQUIRED.includes(to);
}
