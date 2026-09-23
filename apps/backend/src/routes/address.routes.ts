import { Router } from "express";
import * as addressController from "../controllers/address.controller";
import { requireAuth } from "../middleware/auth";

export const addressRouter = Router();

addressRouter.use(requireAuth);
addressRouter.get("/", addressController.list);
addressRouter.post("/", addressController.create);
addressRouter.patch("/:id", addressController.update);
addressRouter.delete("/:id", addressController.remove);
