import { Router } from "express";
import { UserRole } from "@prisma/client";
import * as courierController from "../controllers/courier.controller";
import { requireAuth, requireRole } from "../middleware/auth";

export const courierRouter = Router();

courierRouter.use(requireAuth);
// Assignable courier list is an admin workflow (REQ-AUTH-04 / assign flow).
courierRouter.get("/", requireRole(UserRole.admin), courierController.list);
