import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export type AuthUser = {
  id: string;
  role: UserRole;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError(401, "Missing or invalid Authorization header"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new AppError(401, "Missing or invalid Authorization header"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "Unauthorized"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Forbidden"));
      return;
    }
    next();
  };
}
