import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (existing) return existing;
  const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? "";
  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: email || "unknown@instantauthority.local",
      defaultTone: "Professional",
    },
  });
}
