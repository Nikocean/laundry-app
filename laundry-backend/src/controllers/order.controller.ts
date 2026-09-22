import { Request, Response } from "express";
import * as orderService from "../services/order.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const orders = await orderService.listOrders(req.user);
  res.json(orders);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const order = await orderService.getOrderById(req.user, req.params.id);
  res.json(order);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const order = await orderService.createOrder(req.user, req.body);
  res.status(201).json(order);
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const { status, proofPhotoUrl } = req.body as {
    status?: unknown;
    proofPhotoUrl?: string;
  };
  const order = await orderService.updateOrderStatus(req.user, req.params.id, {
    status,
    proofPhotoUrl,
  });
  res.json(order);
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const { courierId } = req.body as { courierId?: string };
  const order = await orderService.assignCourier(
    req.user,
    req.params.id,
    courierId ?? ""
  );
  res.json(order);
});

export const proofPhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const { proofPhotoUrl } = req.body as { proofPhotoUrl?: string };
  const order = await orderService.setProofPhoto(
    req.user,
    req.params.id,
    proofPhotoUrl ?? ""
  );
  res.json(order);
});
