import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SEC,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SEC,
} from "./constants";

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

const accessCookieOptions = {
  httpOnly: true as const,
  secure: cookieSecure(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
};

const refreshCookieOptions = {
  httpOnly: true as const,
  secure: cookieSecure(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
};

const clearOptions = {
  httpOnly: true as const,
  secure: cookieSecure(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export function applyAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessCookieOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
  return response;
}

export function applyClearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", clearOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", clearOptions);
  return response;
}

export function getAccessTokenFromCookies(): string | undefined {
  return cookies().get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getRefreshTokenFromCookies(): string | undefined {
  return cookies().get(REFRESH_TOKEN_COOKIE)?.value;
}
