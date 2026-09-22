import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get("/me", userController.getMe);
userRouter.patch("/me", userController.updateMe);
