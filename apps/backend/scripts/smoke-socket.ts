/**
 * One-off smoke script: JWT socket auth + order:status_changed after cancel.
 * Run with: npx ts-node --transpile-only scripts/smoke-socket.ts
 */
import { io as ioClient } from "socket.io-client";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function json(
  method: string,
  path: string,
  body?: unknown,
  token?: string
) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const suf = Date.now().toString(36);
  const reg = await json("POST", "/api/auth/register", {
    name: "Socket Smoke",
    email: `sock_${suf}@test.local`,
    password: "password123",
  });
  const token = reg.accessToken as string;

  const order = await json(
    "POST",
    "/api/orders",
    {
      pickupAddress: "A",
      deliveryAddress: "B",
      items: [{ name: "Cuci", weightKg: 1, pricePerKg: 8000 }],
    },
    token
  );
  const orderId = order.id as string;

  const unauth = ioClient(BASE, {
    autoConnect: false,
    transports: ["websocket"],
  });
  const unauthResult = await new Promise<string>((resolve) => {
    unauth.on("connect_error", (err) => {
      resolve(err.message);
      unauth.close();
    });
    unauth.connect();
    setTimeout(() => resolve("timeout"), 3000);
  });

  const socket = ioClient(BASE, {
    auth: { token },
    transports: ["websocket"],
  });

  await new Promise<void>((resolve, reject) => {
    socket.on("connect", () => resolve());
    socket.on("connect_error", (err) => reject(err));
    setTimeout(() => reject(new Error("connect timeout")), 5000);
  });

  const joinOk = await new Promise<boolean>((resolve) => {
    socket.emit("join", `order:${orderId}`, (ack: { ok?: boolean }) => {
      resolve(Boolean(ack?.ok));
    });
  });

  const eventPromise = new Promise<Record<string, unknown>>((resolve, reject) => {
    socket.on("order:status_changed", (payload) => resolve(payload));
    setTimeout(() => reject(new Error("event timeout")), 8000);
  });

  await json(
    "PATCH",
    `/api/orders/${orderId}/status`,
    { status: "cancelled" },
    token
  );

  const event = await eventPromise;
  socket.close();

  console.log(
    JSON.stringify({
      unauth: unauthResult,
      joinOk,
      eventStatus: event.status,
      eventOrderId: event.orderId,
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
