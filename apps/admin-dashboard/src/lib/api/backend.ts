import { getAccessTokenFromCookies } from "@/lib/auth/cookies";

export function backendBaseUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("Missing BACKEND_URL");
  }
  return url.replace(/\/$/, "");
}

export function getBearerOrNull(): string | null {
  return getAccessTokenFromCookies() ?? null;
}

export function errorMessage(
  body: unknown,
  fallback: string
): string {
  if (body && typeof body === "object") {
    const record = body as { message?: string; error?: string };
    return record.message ?? record.error ?? fallback;
  }
  return fallback;
}
