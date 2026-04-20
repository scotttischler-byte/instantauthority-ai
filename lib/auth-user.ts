import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateDbUser() {
  if (!process.env.DATABASE_URL) return null;
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecret = process.env.CLERK_SECRET_KEY || "";
  const hasClerkKeys = /^pk_(test|live)_/.test(clerkKey) && /^sk_(test|live)_/.test(clerkSecret);
  if (!hasClerkKeys) return null;

  try {
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
  } catch {
    return null;
  }
}
