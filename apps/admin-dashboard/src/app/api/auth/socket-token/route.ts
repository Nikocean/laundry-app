import { NextResponse } from "next/server";
import { getAccessTokenFromCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";

/**
 * Returns the access JWT for Socket.io handshake only (REQ-RT-01).
 * Token stays httpOnly for REST; client may hold this in memory for the socket
 * connection — never written to localStorage.
 */
export async function GET() {
  const accessToken = getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const claims = await verifyAccessToken(accessToken);
  if (!claims || claims.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ token: accessToken });
}
