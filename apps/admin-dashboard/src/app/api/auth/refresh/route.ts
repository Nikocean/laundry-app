import { NextResponse } from "next/server";
import { backendRefresh } from "@/lib/auth/backend";
import {
  applyAuthCookies,
  applyClearAuthCookies,
  getRefreshTokenFromCookies,
} from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = getRefreshTokenFromCookies();
  if (!refreshToken) {
    return applyClearAuthCookies(
      NextResponse.json({ message: "Missing refresh token" }, { status: 401 })
    );
  }

  const result = await backendRefresh(refreshToken);
  if (!result.ok) {
    return applyClearAuthCookies(
      NextResponse.json({ message: result.message }, { status: result.status })
    );
  }

  if (result.data.user.role !== "admin") {
    return applyClearAuthCookies(
      NextResponse.json({ message: "Admin role required" }, { status: 403 })
    );
  }

  return applyAuthCookies(
    NextResponse.json({ user: result.data.user }),
    result.data.accessToken,
    result.data.refreshToken
  );
}
