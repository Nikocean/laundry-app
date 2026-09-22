import { jwtVerify, type JWTPayload } from "jose";

export type AccessTokenClaims = {
  sub: string;
  role: "customer" | "courier" | "admin";
  type: "access";
};

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_ACCESS_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      algorithms: ["HS256"],
    });
    if (!isAccessTokenClaims(payload)) {
      return null;
    }
    return {
      sub: payload.sub,
      role: payload.role,
      type: "access",
    };
  } catch {
    return null;
  }
}

function isAccessTokenClaims(
  payload: JWTPayload
): payload is JWTPayload & AccessTokenClaims {
  return (
    typeof payload.sub === "string" &&
    payload.type === "access" &&
    (payload.role === "customer" ||
      payload.role === "courier" ||
      payload.role === "admin")
  );
}
