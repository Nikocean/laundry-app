import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: UserRole;
  };

  const result = await authService.register({
    name: name ?? "",
    email: email ?? "",
    password: password ?? "",
    phone,
    role,
  });

  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const result = await authService.login({
    email: email ?? "",
    password: password ?? "",
  });
  res.json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  const result = await authService.refresh(refreshToken ?? "");
  res.json(result);
});
