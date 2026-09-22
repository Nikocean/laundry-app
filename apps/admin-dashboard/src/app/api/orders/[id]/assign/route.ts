import { NextResponse } from "next/server";
import {
  backendBaseUrl,
  errorMessage,
  getBearerOrNull,
} from "@/lib/api/backend";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: Request, context: RouteContext) {
  const accessToken = getBearerOrNull();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const orderId = context.params.id;
  if (!orderId) {
    return NextResponse.json({ message: "Order id required" }, { status: 400 });
  }

  let courierId = "";
  try {
    const body = (await request.json()) as { courierId?: string };
    courierId = body.courierId?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!courierId) {
    return NextResponse.json(
      { message: "courierId is required" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${backendBaseUrl()}/api/orders/${encodeURIComponent(orderId)}/assign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ courierId }),
      cache: "no-store",
    }
  );

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: errorMessage(body, "Failed to assign courier") },
      { status: res.status }
    );
  }

  return NextResponse.json(body);
}
