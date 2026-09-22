/** Cookie names — keep in sync with middleware + route handlers. */
export const ACCESS_TOKEN_COOKIE = "laundry_access_token";
export const REFRESH_TOKEN_COOKIE = "laundry_refresh_token";

/** Match backend access TTL (15m) and refresh TTL (7d). */
export const ACCESS_TOKEN_MAX_AGE_SEC = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "courier" | "admin";
  createdAt: string;
};

export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};
