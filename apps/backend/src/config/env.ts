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
};
