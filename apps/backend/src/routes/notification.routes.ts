import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", notificationController.list);
notificationRouter.patch("/:id/read", notificationController.markRead);
