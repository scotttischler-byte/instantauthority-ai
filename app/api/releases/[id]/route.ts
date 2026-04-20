import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await prisma.pressRelease.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const release = await prisma.pressRelease.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.content !== undefined ? { content: body.content, wordCount: body.content.trim().split(/\s+/).length } : {}),
      ...(body.headline !== undefined ? { headline: body.headline } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.scheduledDate !== undefined ? { scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null } : {}),
    },
  });
  return NextResponse.json({ release });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await prisma.pressRelease.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.pressRelease.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
