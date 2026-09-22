import bcrypt from "bcryptjs";
import { User, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import {
  hashToken,
  newTokenId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
};

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function issueTokenPair(user: User) {
  const jti = newTokenId();
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, jti);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenTtlDays);

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;

  if (!name || !email || !password) {
    throw new AppError(400, "name, email, and password are required");
  }
  if (password.length < 8) {
    throw new AppError(400, "password must be at least 8 characters");
  }

  const role = input.role ?? UserRole.customer;
  if (role === UserRole.admin) {
    throw new AppError(400, "Cannot self-register as admin");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptCost);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: input.phone?.trim() || null,
        role,
      },
    });

    if (role === UserRole.courier) {
      await tx.courier.create({
        data: { userId: created.id, isAvailable: false },
      });
    }

    return created;
  });

  return issueTokenPair(user);
}

export async function login(input: { email: string; password: string }) {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw new AppError(400, "email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "Invalid email or password");
  }

  return issueTokenPair(user);
}

export async function refresh(refreshToken: string) {
  if (!refreshToken) {
    throw new AppError(401, "refreshToken is required");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
  });

  if (!stored || stored.userId !== payload.sub) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  if (stored.revokedAt) {
    throw new AppError(401, "Refresh token has been revoked");
  }
  if (stored.expiresAt.getTime() <= Date.now()) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  if (stored.tokenHash !== hashToken(refreshToken)) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokenPair(user);
}
