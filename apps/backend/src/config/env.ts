function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  bcryptCost: Math.max(10, Number(process.env.BCRYPT_COST) || 10),
  accessTokenTtl: "15m" as const,
  refreshTokenTtlDays: 7,
  /** Midtrans server key for webhook SHA-512 (REQ-PAY-01). */
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY ?? "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  /** Firebase Admin (FCM only). Private key may contain escaped newlines. */
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: normalizeFirebasePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY ?? ""
  ),
};

/** Accepts full PEM or raw base64 body (with optional \n), wraps headers if needed. */
function normalizeFirebasePrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n").trim();
  if (!key) return "";
  if (key.includes("BEGIN PRIVATE KEY") || key.includes("BEGIN RSA PRIVATE KEY")) {
    return key;
  }
  // JSON sometimes stores only the PKCS#8 body without PEM fences.
  return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
}
