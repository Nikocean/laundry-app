import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await userService.getMe(req.user.id);
  res.json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const { name, phone, fcmToken } = req.body as {
    name?: string;
    phone?: string | null;
    fcmToken?: string | null;
  };
  const user = await userService.updateMe(req.user.id, { name, phone, fcmToken });
  res.json(user);
});
