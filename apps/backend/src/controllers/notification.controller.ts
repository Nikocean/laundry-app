import { Request, Response } from "express";
import * as notificationService from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const notifications = await notificationService.listNotifications(req.user.id);
  res.json(notifications);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const notification = await notificationService.markNotificationRead(
    req.user.id,
    req.params.id
  );
  res.json(notification);
});
