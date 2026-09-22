import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      fcmToken: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
}

export async function updateMe(
  userId: string,
  input: { name?: string; phone?: string | null; fcmToken?: string | null }
) {
  const data: { name?: string; phone?: string | null; fcmToken?: string | null } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new AppError(400, "name cannot be empty");
    data.name = name;
  }
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.fcmToken !== undefined) data.fcmToken = input.fcmToken;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      fcmToken: true,
      createdAt: true,
    },
  });
  return user;
}
