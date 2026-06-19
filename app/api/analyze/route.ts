import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { parseReport } from "@/lib/analysis";

const system = `You are an expert SEO and GEO (Generative Engine Optimization) analyst.
Analyze the provided website and respond with ONLY a single strict JSON object (no markdown, no prose) matching exactly this schema:
{
  "scores": {
    "onPage": <0-20>, "content": <0-20>, "technical": <0-20>, "authority": <0-20>, "geo": <0-20>,
    "seoTotal": <0-100, sum of the four SEO categories scaled to 100>,
    "geoTotal": <0-20, the geo category score>,
    "total": <0-100, overall authority score>
  },
  "sections": {
    "onPage":    { "found": [string], "missing": [string], "recommendations": [{ "text": string, "priority": "High"|"Medium"|"Low" }] },
    "content":   { "found": [string], "missing": [string], "recommendations": [{ "text": string, "priority": "High"|"Medium"|"Low" }] },
    "technical": { "found": [string], "missing": [string], "recommendations": [{ "text": string, "priority": "High"|"Medium"|"Low" }] },
    "authority": { "found": [string], "missing": [string], "recommendations": [{ "text": string, "priority": "High"|"Medium"|"Low" }] },
    "geo":       { "found": [string], "missing": [string], "recommendations": [{ "text": string, "priority": "High"|"Medium"|"Low" }] }
  },
  "quickWins": [string],
  "strategicWins": [string],
  "executiveSummary": string,
  "aiVisibilityAssessment": string
}
All numeric fields are required. Do not wrap the JSON in code fences.`;

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
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: `Analyze URL ${url}\nHTML:\n${html.slice(0, 120000)}` }],
  });
  const text = resp.content.find((x) => x.type === "text");
  const report = parseReport(text && text.type === "text" ? text.text : "{}");
  return NextResponse.json({ report });
}
