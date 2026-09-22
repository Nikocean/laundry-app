import { prisma } from "../config/prisma";

export async function listCouriers(availableOnly: boolean) {
  return prisma.courier.findMany({
    where: availableOnly ? { isAvailable: true } : undefined,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { lastActiveAt: "desc" },
  });
}
