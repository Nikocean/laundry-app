import { NextResponse } from "next/server";
import {
  backendBaseUrl,
  errorMessage,
  getBearerOrNull,
} from "@/lib/api/backend";

export async function GET() {
  const accessToken = getBearerOrNull();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${backendBaseUrl()}/api/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: errorMessage(body, "Failed to load orders") },
      { status: res.status }
    );
  }

  return NextResponse.json(body);
}
