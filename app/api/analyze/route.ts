import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { parseReport } from "@/lib/analysis";

const system = `You are an expert SEO and GEO analyst. Return strict JSON with category scores (0-20 each), sections (found/missing/recommendations), quickWins, strategicWins, executiveSummary, aiVisibilityAssessment.`;

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url } = (await req.json()) as { url?: string };
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 500 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let html = "";
  try {
    const page = await fetch(url, { signal: controller.signal, cache: "no-store" });
    html = await page.text();
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ error: "Failed to fetch URL content" }, { status: 400 });
  } finally {
    clearTimeout(timeout);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: `Analyze URL ${url}\nHTML:\n${html.slice(0, 120000)}` }],
  });
  const text = resp.content.find((x) => x.type === "text");
  const report = parseReport(text && text.type === "text" ? text.text : "{}");
  return NextResponse.json({ report });
}
