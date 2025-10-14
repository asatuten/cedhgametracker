import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export const getActiveUserId = async () => {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  const guest = await prisma.user.upsert({
    where: { email: "guest@cedh.local" },
    update: {},
    create: {
      email: "guest@cedh.local",
      name: "Guest"
    }
  });

  return guest.id;
};
