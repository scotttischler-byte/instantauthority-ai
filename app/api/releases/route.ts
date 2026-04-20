import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

const words = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const releases = await prisma.pressRelease.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ releases });
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.headline || !body.type || !body.content) {
    return NextResponse.json({ error: "headline, type, and content are required" }, { status: 400 });
  }
  const release = await prisma.pressRelease.create({
    data: {
      userId: user.id,
      clientId: body.clientId || null,
      headline: body.headline,
      type: body.type,
      content: body.content,
      wordCount: words(body.content),
      status: body.status || "DRAFT",
      geoScore: body.geoScore ?? null,
      primaryKw: body.primaryKw ?? null,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
    },
    include: { client: true },
  });
  return NextResponse.json({ release });
}
