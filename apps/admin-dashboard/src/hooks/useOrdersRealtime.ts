"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Order, OrderStatusChangedEvent } from "@/lib/orders/types";

async function fetchSocketToken(): Promise<string | null> {
  let res = await fetch("/api/auth/socket-token", { cache: "no-store" });
  if (res.status === 401) {
    await fetch("/api/auth/refresh", { method: "POST" });
    res = await fetch("/api/auth/socket-token", { cache: "no-store" });
  }
  if (!res.ok) return null;
  const body = (await res.json()) as { token?: string };
  return body.token ?? null;
}

function applyStatusEvent(
  prev: Order[],
  event: OrderStatusChangedEvent
): Order[] {
  const index = prev.findIndex((o) => o.id === event.orderId);
  if (index === -1) {
    // New order not in list yet (no create event in API) — ignore until refresh
    return prev;
  }
  const current = prev[index];
  const next: Order = {
    ...current,
    status: event.status,
    ...(event.customerId !== undefined ? { customerId: event.customerId } : {}),
    ...(event.courierId !== undefined ? { courierId: event.courierId } : {}),
    updatedAt: new Date().toISOString(),
  };
  const copy = prev.slice();
  copy[index] = next;
  return copy;
}

export function useOrdersRealtime(initialOrders: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [socketState, setSocketState] = useState<
    "connecting" | "connected" | "error" | "idle"
  >("idle");
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const patchFromEvent = useCallback((event: OrderStatusChangedEvent) => {
    if (!event?.orderId || !event?.status) return;
    setOrders((prev) => applyStatusEvent(prev, event));
  }, []);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!socketUrl) {
      setSocketState("error");
      setSocketError("NEXT_PUBLIC_SOCKET_URL is not configured");
      return;
    }

    let cancelled = false;

    async function connect() {
      setSocketState("connecting");
      setSocketError(null);

      const token = await fetchSocketToken();
      if (cancelled) return;
      if (!token) {
        setSocketState("error");
        setSocketError("Could not get socket auth token");
        return;
      }

      const socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket"],
        autoConnect: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        if (cancelled) return;
        setSocketState("connected");
        socket.emit(
          "join",
          "orders:all",
          (ack: { ok?: boolean; error?: string }) => {
            if (cancelled) return;
            if (!ack?.ok) {
              setSocketState("error");
              setSocketError(ack?.error ?? "Failed to join orders:all");
            }
          }
        );
      });

      socket.on("connect_error", (err) => {
        if (cancelled) return;
        setSocketState("error");
        setSocketError(err.message || "Socket connection failed");
      });

      socket.on("order:status_changed", (payload: OrderStatusChangedEvent) => {
        patchFromEvent(payload);
      });

      // Same room also receives assign events (status/courier fields) — keep row in sync
      socket.on(
        "order:assigned",
        (payload: {
          orderId: string;
          status: OrderStatusChangedEvent["status"];
          courierId: string;
        }) => {
          patchFromEvent({
            orderId: payload.orderId,
            status: payload.status,
            courierId: payload.courierId,
          });
        }
      );
    }

    void connect();

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.emit("leave", "orders:all");
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [patchFromEvent]);

  return { orders, setOrders, socketState, socketError };
}
