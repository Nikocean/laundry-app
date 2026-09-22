/**
 * Realtime emit hooks (REQ-ORDER-03 / REQ-RT-*).
 * Socket.io gateway registers listeners in initSocketServer.
 * Services call emit* only AFTER DB transaction commit.
 */

export type OrderStatusChangedPayload = {
  orderId: string;
  status: string;
  customerId: string;
  courierId: string | null;
};

export type OrderAssignedPayload = {
  orderId: string;
  status: string;
  courierId: string;
  customerId: string;
};

type StatusListener = (payload: OrderStatusChangedPayload) => void;
type AssignedListener = (payload: OrderAssignedPayload) => void;

const statusListeners: StatusListener[] = [];
const assignedListeners: AssignedListener[] = [];

export function onOrderStatusChanged(listener: StatusListener): void {
  statusListeners.push(listener);
}

export function onOrderAssigned(listener: AssignedListener): void {
  assignedListeners.push(listener);
}

export function emitOrderStatusChanged(payload: OrderStatusChangedPayload): void {
  for (const listener of statusListeners) {
    try {
      listener(payload);
    } catch (err) {
      console.error("realtime status listener error:", err);
    }
  }
}

export function emitOrderAssigned(payload: OrderAssignedPayload): void {
  for (const listener of assignedListeners) {
    try {
      listener(payload);
    } catch (err) {
      console.error("realtime assigned listener error:", err);
    }
  }
}
