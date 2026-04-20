import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.releaseId || !Array.isArray(body.sites)) {
    return NextResponse.json({ error: "releaseId and sites are required" }, { status: 400 });
  }
  const release = await prisma.pressRelease.findFirst({ where: { id: body.releaseId, userId: user.id } });
  if (!release) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const distribution = await prisma.distribution.create({
    data: { releaseId: release.id, sites: JSON.stringify(body.sites) },
  });
  return NextResponse.json({ distribution });
}
