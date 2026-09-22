import { Request, Response } from "express";
import * as addressService from "../services/address.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const addresses = await addressService.listAddresses(req.user.id);
  res.json(addresses);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(201).json(address);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const address = await addressService.updateAddress(
    req.user.id,
    req.params.id,
    req.body
  );
  res.json(address);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  await addressService.deleteAddress(req.user.id, req.params.id);
  res.status(204).send();
});
