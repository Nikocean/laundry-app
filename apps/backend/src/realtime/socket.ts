import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/prisma";
import { onOrderAssigned, onOrderStatusChanged } from "./emitter";
import { sendPushToUser } from "../services/fcm.service";

type SocketUser = {
  id: string;
  role: UserRole;
};

declare module "socket.io" {
  interface SocketData {
    user: SocketUser;
  }
}

let io: Server | null = null;

function extractToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }
  const header = socket.handshake.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return null;
}

async function canJoinOrderRoom(
  user: SocketUser,
  orderId: string
): Promise<boolean> {
  if (user.role === UserRole.admin) return true;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { customerId: true, courierId: true },
  });
  if (!order) return false;
  return order.customerId === user.id || order.courierId === user.id;
}

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }
      const payload = verifyAccessToken(token);
      socket.data.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    socket.on("join", async (room: unknown, ack?: (result: unknown) => void) => {
      try {
        if (typeof room !== "string" || !room.trim()) {
          ack?.({ ok: false, error: "Invalid room" });
          return;
        }

        if (room === "orders:all") {
          if (user.role !== UserRole.admin) {
            ack?.({ ok: false, error: "Forbidden" });
            return;
          }
          await socket.join(room);
          ack?.({ ok: true, room });
          return;
        }

        if (room.startsWith("order:")) {
          const orderId = room.slice("order:".length);
          const allowed = await canJoinOrderRoom(user, orderId);
          if (!allowed) {
            ack?.({ ok: false, error: "Forbidden" });
            return;
          }
          await socket.join(room);
          ack?.({ ok: true, room });
          return;
        }

        if (room.startsWith("courier:")) {
          const courierId = room.slice("courier:".length);
          if (user.role !== UserRole.admin && user.id !== courierId) {
            ack?.({ ok: false, error: "Forbidden" });
            return;
          }
          await socket.join(room);
          ack?.({ ok: true, room });
          return;
        }

        ack?.({ ok: false, error: "Unknown room" });
      } catch (err) {
        console.error("socket join error:", err);
        ack?.({ ok: false, error: "Join failed" });
      }
    });

    socket.on("leave", async (room: unknown, ack?: (result: unknown) => void) => {
      if (typeof room === "string" && room.trim()) {
        await socket.leave(room);
        ack?.({ ok: true, room });
        return;
      }
      ack?.({ ok: false, error: "Invalid room" });
    });
  });

  // REQ-RT-02: listeners run after service layer commits + calls emit*
  onOrderStatusChanged((payload) => {
    if (!io) return;
    const eventPayload = {
      orderId: payload.orderId,
      status: payload.status,
      customerId: payload.customerId,
      courierId: payload.courierId,
    };

    io.to(`order:${payload.orderId}`).emit("order:status_changed", eventPayload);
    io.to("orders:all").emit("order:status_changed", eventPayload);

    // REQ-RT-03: FCM fallback (stub until FCM wired)
    void sendPushToUser(payload.customerId, {
      title: "Order status updated",
      body: `Your order is now ${payload.status}.`,
      data: { orderId: payload.orderId, status: payload.status },
    });
  });

  onOrderAssigned((payload) => {
    if (!io) return;
    io.to(`courier:${payload.courierId}`).emit("order:assigned", {
      orderId: payload.orderId,
      status: payload.status,
      courierId: payload.courierId,
    });
    io.to("orders:all").emit("order:assigned", {
      orderId: payload.orderId,
      status: payload.status,
      courierId: payload.courierId,
    });
  });

  return io;
}

export function getIo(): Server | null {
  return io;
}
