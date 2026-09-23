import { cookies } from "next/headers";
import { OrdersTable } from "@/components/orders/orders-table";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import type { Order } from "@/lib/orders/types";

async function loadOrders(): Promise<{ orders: Order[]; error: string | null }> {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return { orders: [], error: "Not authenticated" };
  }

  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (!backendUrl) {
    return { orders: [], error: "Missing BACKEND_URL" };
  }

  try {
    const res = await fetch(`${backendUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        (body as { message?: string; error?: string }).message ??
        (body as { error?: string }).error ??
        `Failed to load orders (${res.status})`;
      return { orders: [], error: message };
    }
    return { orders: body as Order[], error: null };
  } catch {
    return { orders: [], error: "Unable to reach backend" };
  }
}

export default async function OrdersPage() {
  const { orders, error } = await loadOrders();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Live list via REST + Socket.io room <code>orders:all</code>.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
