import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { asyncHandler } from "../utils/asyncHandler";

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.handleMidtransWebhook(req.body);
  res.json(result);
});
