import { Request, Response } from "express";
import * as courierService from "../services/courier.service";
import { asyncHandler } from "../utils/asyncHandler";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const availableOnly = String(req.query.available) === "true";
  const couriers = await courierService.listCouriers(availableOnly);
  res.json(couriers);
});
