import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth-user";

const SYSTEM_PROMPT = `You are a world-class PR copywriter and SEO/GEO strategist for InstantAuthority.ai.

Your press releases serve two simultaneous goals:

GOAL 1 - TRADITIONAL SEO:
- Include business name + primary keyword in headline
- Use semantic keyword variations naturally
- Structure with clear H1, subheadline, paragraphs
- Include location signals for local businesses
- Add E-E-A-T signals: specific numbers, dates, credentials, expertise markers
- Use authoritative language Google associates with expertise

GOAL 2 - GEO (Generative Engine Optimization):
- Write in factual encyclopedic tone AI loves to cite
- Open with clear entity definition: who, what, where, when
- Use AI-extractable fact patterns
- Include specific data: percentages, dollar amounts, dates, quantities
- Add KEY FACTS section with 5 bullet points

REQUIRED STRUCTURE:
FOR IMMEDIATE RELEASE
[HEADLINE]
[SUBHEADLINE]
[CITY, State, Date] — opening entity-rich paragraph
Paragraphs with facts, quote, market context, impact, CTA.
KEY FACTS (5 bullets)
ABOUT COMPANY
MEDIA CONTACT
###
`;

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 500 });
  const body = await req.json();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Write a complete press release using:
Headline: ${body.headline}
Talking points: ${body.talkingPoints}
Primary keyword: ${body.primaryKw}
Secondary keywords: ${body.secondaryKws}
Location: ${body.location}
Target AI question: ${body.targetQuestion}
Statistics: ${body.stats}
Competitor differentiator: ${body.competitorDiff}
Quote: ${body.quoteName}, ${body.quoteTitle}
Target audience: ${body.audience}
CTA URL: ${body.ctaUrl}
Tone: ${body.tone}
Word target: ${body.wordCountTarget}
${body.mode === "refine" ? `Refine existing content:\n${body.previousContent}\nInstruction:${body.refineInstruction}` : ""}
`;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content.find((x) => x.type === "text");
  return NextResponse.json({ content: block && block.type === "text" ? block.text : "" });
}
