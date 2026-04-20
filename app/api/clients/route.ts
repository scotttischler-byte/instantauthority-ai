import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    include: { _count: { select: { releases: true, analyses: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name: body.name,
      industry: body.industry,
      website: body.website || null,
      spokesperson: body.spokesperson || null,
      title: body.title || null,
      boilerplate: body.boilerplate || null,
      tone: body.tone || "Professional",
      notes: body.notes || null,
      color: body.color || "#00D4FF",
      portalSlug: body.portalSlug || `${body.name}`.toLowerCase().replace(/\s+/g, "-"),
      portalToken: body.portalToken || crypto.randomUUID(),
    },
  });
  return NextResponse.json({ client });
}
