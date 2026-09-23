import type { AuthTokenResponse } from "./constants";

function backendBaseUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("Missing BACKEND_URL");
  }
  return url.replace(/\/$/, "");
}

export async function backendLogin(
  email: string,
  password: string
): Promise<{ ok: true; data: AuthTokenResponse } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${backendBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = (await res.json().catch(() => ({}))) as Partial<AuthTokenResponse> & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: body.message ?? body.error ?? "Login failed",
    };
  }

  if (!body.accessToken || !body.refreshToken || !body.user) {
    return { ok: false, status: 502, message: "Invalid login response from backend" };
  }

  return {
    ok: true,
    data: {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      user: body.user,
    },
  };
}

export async function backendRefresh(
  refreshToken: string
): Promise<{ ok: true; data: AuthTokenResponse } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${backendBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const body = (await res.json().catch(() => ({}))) as Partial<AuthTokenResponse> & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: body.message ?? body.error ?? "Refresh failed",
    };
  }

  if (!body.accessToken || !body.refreshToken || !body.user) {
    return { ok: false, status: 502, message: "Invalid refresh response from backend" };
  }

  return {
    ok: true,
    data: {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      user: body.user,
    },
  };
}
