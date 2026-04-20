import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const analyses = await prisma.websiteAnalysis.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ analyses });
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const analysis = await prisma.websiteAnalysis.create({
    data: {
      userId: user.id,
      clientId: body.clientId || null,
      url: body.url,
      seoScore: body.seoScore,
      geoScore: body.geoScore,
      totalScore: body.totalScore,
      reportData: body.reportData,
    },
  });
  return NextResponse.json({ analysis });
}
