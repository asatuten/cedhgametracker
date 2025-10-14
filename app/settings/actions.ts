"use server";

import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";

export const updateProfile = async (formData: FormData) => {
  const userId = await getActiveUserId();
  const name = (formData.get("name") as string | null)?.trim();
  await prisma.user.update({
    where: { id: userId },
    data: { name: name || null }
  });
};
