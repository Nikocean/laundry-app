import { NextResponse } from "next/server";
import {
  backendBaseUrl,
  errorMessage,
  getBearerOrNull,
} from "@/lib/api/backend";

export async function GET(request: Request) {
  const accessToken = getBearerOrNull();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const available = incoming.searchParams.get("available");
  const url = new URL(`${backendBaseUrl()}/api/couriers`);
  if (available !== null) {
    url.searchParams.set("available", available);
  }

  const res = await fetch(url, {
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
      { message: errorMessage(body, "Failed to load couriers") },
      { status: res.status }
    );
  }

  return NextResponse.json(body);
}
