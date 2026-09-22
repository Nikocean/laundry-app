import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";

/** No JWT — Midtrans signature only (REQ-AUTH-03 exception / REQ-PAY-*). */
export const paymentRouter = Router();

paymentRouter.post("/webhook", paymentController.webhook);
