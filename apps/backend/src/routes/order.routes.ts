import { Router } from "express";
import { UserRole } from "@prisma/client";
import * as orderController from "../controllers/order.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadProofPhotoFile } from "../middleware/upload";

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.get("/", orderController.list);
orderRouter.post("/", orderController.create);
orderRouter.get("/:id", orderController.getById);
orderRouter.patch("/:id/status", orderController.updateStatus);
orderRouter.post("/:id/assign", requireRole(UserRole.admin), orderController.assign);
orderRouter.post("/:id/proof-photo", uploadProofPhotoFile, orderController.proofPhoto);
