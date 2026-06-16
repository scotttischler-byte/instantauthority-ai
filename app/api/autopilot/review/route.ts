import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth-user";

const requestSchema = z.object({
  headline: z.string().min(3, "headline is required"),
  content: z.string().min(80, "content must include a draft to review"),
  clientName: z.string().optional(),
  audience: z.string().optional(),
  channels: z.array(z.string()).optional(),
  reviewerMode: z.enum(["release", "autopilot"]).optional(),
});

const reviewSchema = z.object({
  overallScore: z.number().min(0).max(100),
  readiness: z.enum(["needs_work", "ready_for_human", "approved_with_minor_edits"]),
  riskLevel: z.enum(["low", "medium", "high"]),
  humanReviewRequired: z.boolean(),
  executiveSummary: z.string(),
  mustFix: z.array(z.string()),
  coachingNotes: z.array(z.string()),
  factCheckQuestions: z.array(z.string()),
  complianceRisks: z.array(z.string()),
  franchiseeInstructions: z.array(z.string()),
  clientApprovalChecklist: z.array(z.string()),
  channelAssets: z.object({
    pressWire: z.string(),
    linkedIn: z.string(),
    instagram: z.string(),
    emailPitch: z.string(),
  }),
  revisedRelease: z.string(),
  nextBestActions: z.array(z.string()),
});

type ReviewRequest = z.infer<typeof requestSchema>;
type ReviewResult = z.infer<typeof reviewSchema>;

const SYSTEM_PROMPT = `You are InstantAuthority.ai's senior PR editor, brand-safety reviewer, and franchisee coach.

Your job is to make authority publishing as autonomous as possible while requiring a human approval gate before any public distribution.

Review every draft for:
- press-release newsworthiness and structure
- factual specificity and missing proof
- SEO/GEO citation readiness
- local/entity clarity
- legal/compliance/claim risk
- franchisee/client handoff quality
- channel-specific adaptation opportunities

Return ONLY valid JSON. Do not wrap it in markdown.`;

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function heuristicReview(body: ReviewRequest, reason?: string): ReviewResult & { aiAvailable: false; warning?: string } {
  const lower = body.content.toLowerCase();
  const hasFacts = /\d/.test(body.content);
  const hasKeyFacts = lower.includes("key facts");
  const hasQuote = body.content.includes('"') || lower.includes("said ");
  const hasContact = lower.includes("media contact");
  const hasAbout = lower.includes("about ");
  const score = 48 + [hasFacts, hasKeyFacts, hasQuote, hasContact, hasAbout].filter(Boolean).length * 9;

  return {
    aiAvailable: false,
    warning: reason,
    overallScore: Math.min(88, score),
    readiness: score >= 75 ? "ready_for_human" : "needs_work",
    riskLevel: hasFacts ? "medium" : "high",
    humanReviewRequired: true,
    executiveSummary: "Heuristic review completed because the AI reviewer could not run. Use this as a safety checklist, then run AI review before publishing.",
    mustFix: [
      ...(hasFacts ? [] : ["Add specific numbers, dates, names, locations, or measurable proof points."]),
      ...(hasQuote ? [] : ["Add an attributed quote from an approved spokesperson."]),
      ...(hasContact ? [] : ["Add a complete media contact block."]),
    ],
    coachingNotes: [
      "Ask the client or franchisee for proof behind every numeric claim.",
      "Keep the opening paragraph entity-rich: who, what, where, when, and why it matters.",
      "Do not distribute until a human confirms claims, names, links, and approvals.",
    ],
    factCheckQuestions: [
      "Which claims need source documents or client confirmation?",
      "Are all dates, titles, locations, and company descriptions current?",
      "Has the client approved every quote and boilerplate statement?",
    ],
    complianceRisks: [
      "Unverified superlatives or performance claims can create brand and legal risk.",
      "Regulated industries may require additional client/legal review before publication.",
    ],
    franchiseeInstructions: [
      "Collect the client proof pack: approved quote, logo, media contact, business description, and offer details.",
      "Run AI review after the draft is updated, then route the checklist to a human reviewer.",
      "Publish only after the client approval checklist is complete.",
    ],
    clientApprovalChecklist: [
      "Headline and company description approved.",
      "All factual claims verified.",
      "Spokesperson quote approved.",
      "Distribution channels approved.",
    ],
    channelAssets: {
      pressWire: body.content,
      linkedIn: `${body.headline}\n\n${body.content.split("\n").filter(Boolean).slice(0, 3).join("\n\n")}`,
      instagram: `${body.headline}\n\n${body.content.split("\n").filter(Boolean).slice(0, 2).join(" ")}\n\n#InstantAuthority #BusinessNews`,
      emailPitch: `Subject: Story idea: ${body.headline}\n\nHi [Name],\n\nI wanted to share a timely update from ${body.clientName || "our client"} that may be relevant to your audience.\n\n${body.content.split("\n").find((line) => line.trim().length > 80) || body.headline}\n\nWould this be useful for coverage?`,
    },
    revisedRelease: body.content,
    nextBestActions: [
      "Fill the must-fix gaps.",
      "Run the AI double-check again.",
      "Send the client approval checklist to a human reviewer.",
    ],
  };
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      review: heuristicReview(parsed.data, "ANTHROPIC_API_KEY missing; AI review was not available."),
    });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const channels = parsed.data.channels?.length ? parsed.data.channels.join(", ") : "PRwire, LinkedIn, Instagram, email pitch";
  const prompt = `Review this release and create an autonomous publishing handoff.

Context:
- Client/franchisee: ${parsed.data.clientName || "Not provided"}
- Intended audience: ${parsed.data.audience || "Local market, customers, journalists, and AI answer engines"}
- Requested channels: ${channels}
- Reviewer mode: ${parsed.data.reviewerMode || "release"}

Draft:
HEADLINE: ${parsed.data.headline}

${parsed.data.content}

Return JSON matching exactly this TypeScript shape:
{
  "overallScore": number,
  "readiness": "needs_work" | "ready_for_human" | "approved_with_minor_edits",
  "riskLevel": "low" | "medium" | "high",
  "humanReviewRequired": boolean,
  "executiveSummary": string,
  "mustFix": string[],
  "coachingNotes": string[],
  "factCheckQuestions": string[],
  "complianceRisks": string[],
  "franchiseeInstructions": string[],
  "clientApprovalChecklist": string[],
  "channelAssets": {
    "pressWire": string,
    "linkedIn": string,
    "instagram": string,
    "emailPitch": string
  },
  "revisedRelease": string,
  "nextBestActions": string[]
}

Rules:
- humanReviewRequired must be true unless the draft is purely internal.
- Keep Instagram as a caption only. Do not claim it has been posted.
- Add specific coaching for franchisees who need to collect missing client details.
- revisedRelease should improve structure, factual clarity, and compliance risk without inventing facts.
- If a claim is unsupported, ask a fact-check question instead of making up evidence.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content.find((x) => x.type === "text");
  const text = block && block.type === "text" ? block.text : "";
  const json = extractJson(text);

  if (!json) {
    return NextResponse.json({
      review: heuristicReview(parsed.data, "AI reviewer returned an unreadable response; heuristic review shown."),
    });
  }

  try {
    return NextResponse.json({ review: { aiAvailable: true, ...reviewSchema.parse(JSON.parse(json)) } });
  } catch {
    return NextResponse.json({
      review: heuristicReview(parsed.data, "AI reviewer returned invalid JSON; heuristic review shown."),
    });
  }
}
