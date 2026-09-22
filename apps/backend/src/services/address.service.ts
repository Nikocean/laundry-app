import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });
}

export async function createAddress(
  userId: string,
  input: {
    label: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
  }
) {
  const label = input.label?.trim();
  const fullAddress = input.fullAddress?.trim();
  if (!label || !fullAddress) {
    throw new AppError(400, "label and fullAddress are required");
  }
  if (typeof input.latitude !== "number" || typeof input.longitude !== "number") {
    throw new AppError(400, "latitude and longitude must be numbers");
  }

  const isDefault = Boolean(input.isDefault);

  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        label,
        fullAddress,
        latitude: input.latitude,
        longitude: input.longitude,
        isDefault,
      },
    });
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: {
    label?: string;
    fullAddress?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }
) {
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    throw new AppError(404, "Address not found");
  }

  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        label: input.label?.trim(),
        fullAddress: input.fullAddress?.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        isDefault: input.isDefault,
      },
    });
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    throw new AppError(404, "Address not found");
  }
  await prisma.address.delete({ where: { id: addressId } });
}
