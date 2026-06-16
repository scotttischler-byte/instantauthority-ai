import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateDbUser } from "@/lib/auth-user";

const requestSchema = z.object({
  clientName: z.string().min(2, "clientName is required"),
  industry: z.string().optional(),
  market: z.string().optional(),
  releaseHeadline: z.string().min(3, "releaseHeadline is required"),
  releaseSummary: z.string().min(40, "releaseSummary is required"),
  goals: z.string().optional(),
  approvedChannels: z.array(z.string()).optional(),
});

const taskSchema = z.object({
  title: z.string(),
  owner: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["draft", "needs_human", "ready", "scheduled"]),
  instructions: z.string(),
});

const planSchema = z.object({
  automationScore: z.number().min(0).max(100),
  humanApprovalRequired: z.boolean(),
  summary: z.string(),
  haroAngles: z.array(
    z.object({
      query: z.string(),
      pitch: z.string(),
      proofNeeded: z.string(),
    }),
  ),
  linkTargets: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["journalist_request", "press_wire", "local_citation", "industry_blog", "partner", "podcast", "social", "directory"]),
      url: z.string(),
      action: z.string(),
      expectedValue: z.string(),
    }),
  ),
  distributionTasks: z.array(taskSchema),
  followUpTasks: z.array(taskSchema),
  trackingMetrics: z.array(z.string()),
  risks: z.array(z.string()),
  nextBestActions: z.array(z.string()),
});

type PlanRequest = z.infer<typeof requestSchema>;
type PrPlan = z.infer<typeof planSchema>;

const SYSTEM_PROMPT = `You are InstantAuthority.ai's PR operations strategist.

Create a practical automation plan for press release distribution, HARO-style journalist requests, backlink acquisition, and follow-up tracking.

Important operating rule:
- The system may prepare drafts, links, checklists, and outreach.
- A human must approve before live submission, posting, or outreach.
- Do not claim any external platform has already received a submission.

Return ONLY valid JSON. Do not wrap it in markdown.`;

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function fallbackPlan(body: PlanRequest, warning?: string): PrPlan & { aiAvailable: false; warning?: string } {
  const industry = body.industry || "local business";
  const market = body.market || "target market";

  return {
    aiAvailable: false,
    warning,
    automationScore: 72,
    humanApprovalRequired: true,
    summary: "Starter PR automation plan generated from rules because the AI planner was unavailable. Review every claim and approve before submission.",
    haroAngles: [
      {
        query: `Expert commentary on ${industry} trends in ${market}`,
        pitch: `${body.clientName} can provide a practical quote tied to ${body.releaseHeadline}.`,
        proofNeeded: "Approved spokesperson, one data point, and a specific customer/result example.",
      },
      {
        query: `Local business story connected to ${market}`,
        pitch: `Position the release as a timely local authority story with a clear community/business impact.`,
        proofNeeded: "Local address/service area, launch date, quote, and supporting link.",
      },
      {
        query: `How companies are using AI/search/authority in ${industry}`,
        pitch: `Offer a concise expert take on discoverability, trust signals, and customer education.`,
        proofNeeded: "Named expert, credentials, and examples that do not reveal client-confidential details.",
      },
    ],
    linkTargets: [
      {
        name: "HARO / journalist request feed",
        type: "journalist_request",
        url: "https://www.helpareporter.com/",
        action: "Monitor daily for relevant source requests and paste matches into Autopilot for pitch drafting.",
        expectedValue: "Earned media mentions and authority-building quotes.",
      },
      {
        name: "Qwoted",
        type: "journalist_request",
        url: "https://www.qwoted.com/",
        action: "Create source profiles for approved spokespeople and respond to matching journalist requests.",
        expectedValue: "Journalist relationships and potential citations.",
      },
      {
        name: "Featured",
        type: "journalist_request",
        url: "https://www.featured.com/",
        action: "Answer expert roundups using the approved quote bank from this release.",
        expectedValue: "Expert roundup links and brand mentions.",
      },
      {
        name: "PRwire",
        type: "press_wire",
        url: "https://www.prwire.com/",
        action: "Use prepared wire copy after human approval and track the submitted URL.",
        expectedValue: "Syndicated release visibility.",
      },
      {
        name: "Google Business Profile update",
        type: "local_citation",
        url: "https://www.google.com/business/",
        action: "Repurpose the approved release into a concise business update.",
        expectedValue: "Local relevance and branded search trust.",
      },
      {
        name: "Industry partner backlinks",
        type: "partner",
        url: "https://",
        action: "Ask partners, associations, suppliers, and franchise locations to link to the hosted release.",
        expectedValue: "Relevant backlinks from real business relationships.",
      },
    ],
    distributionTasks: [
      {
        title: "Human approval gate",
        owner: "PR manager",
        priority: "high",
        status: "needs_human",
        instructions: "Confirm claims, quote permissions, client approval, and target channels before any submission.",
      },
      {
        title: "Prepare wire submission",
        owner: "Franchisee",
        priority: "high",
        status: "draft",
        instructions: "Copy the approved release into the selected wire service and save the draft URL or receipt.",
      },
      {
        title: "Queue HARO-style monitoring",
        owner: "AI coach",
        priority: "medium",
        status: "ready",
        instructions: "Check journalist request links daily and draft responses for matching queries.",
      },
    ],
    followUpTasks: [
      {
        title: "Capture published links",
        owner: "Operations",
        priority: "high",
        status: "draft",
        instructions: "Add every published URL, pickup, citation, and backlink to the tracking dashboard.",
      },
      {
        title: "Send client proof update",
        owner: "Account manager",
        priority: "medium",
        status: "draft",
        instructions: "Summarize submissions, pickups, pending responses, and next best actions.",
      },
    ],
    trackingMetrics: [
      "Approved releases",
      "Wire submissions",
      "HARO-style pitches drafted",
      "HARO-style pitches sent",
      "Published links captured",
      "Backlinks secured",
      "Client approvals pending",
    ],
    risks: [
      "External platforms still require account access and manual/human approval.",
      "Unsupported claims should not be sent to journalist request platforms.",
      "Directory or low-quality links should be filtered to protect authority quality.",
    ],
    nextBestActions: [
      "Approve the release and channel assets.",
      "Add the first five target links to the tracker.",
      "Assign the HARO-style monitoring owner.",
      "Capture submitted and published URLs as they happen.",
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
      plan: fallbackPlan(parsed.data, "ANTHROPIC_API_KEY missing; AI PR planner was not available."),
    });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const channels = parsed.data.approvedChannels?.length
    ? parsed.data.approvedChannels.join(", ")
    : "PRwire, HARO-style journalist requests, LinkedIn, Instagram caption, local citations, partner backlinks";
  const prompt = `Build a PR automation and tracking plan.

Client: ${parsed.data.clientName}
Industry: ${parsed.data.industry || "Not provided"}
Market/location: ${parsed.data.market || "Not provided"}
Release headline: ${parsed.data.releaseHeadline}
Release summary: ${parsed.data.releaseSummary}
Goals: ${parsed.data.goals || "Earn authority links, journalist quotes, local relevance, and AI citation readiness"}
Approved channels: ${channels}

Return JSON matching exactly:
{
  "automationScore": number,
  "humanApprovalRequired": boolean,
  "summary": string,
  "haroAngles": [{ "query": string, "pitch": string, "proofNeeded": string }],
  "linkTargets": [{ "name": string, "type": "journalist_request" | "press_wire" | "local_citation" | "industry_blog" | "partner" | "podcast" | "social" | "directory", "url": string, "action": string, "expectedValue": string }],
  "distributionTasks": [{ "title": string, "owner": string, "priority": "low" | "medium" | "high", "status": "draft" | "needs_human" | "ready" | "scheduled", "instructions": string }],
  "followUpTasks": [{ "title": string, "owner": string, "priority": "low" | "medium" | "high", "status": "draft" | "needs_human" | "ready" | "scheduled", "instructions": string }],
  "trackingMetrics": string[],
  "risks": string[],
  "nextBestActions": string[]
}

Rules:
- Include HARO-style / journalist request opportunities and practical links.
- Include link-building targets beyond wire services: local citations, partner links, industry blogs, podcasts, directories, social.
- Make instructions actionable for franchisees.
- Keep humanApprovalRequired true.
- Do not invent live submissions or published links.`;

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
      plan: fallbackPlan(parsed.data, "AI PR planner returned an unreadable response; fallback plan shown."),
    });
  }

  try {
    return NextResponse.json({ plan: { aiAvailable: true, ...planSchema.parse(JSON.parse(json)) } });
  } catch {
    return NextResponse.json({
      plan: fallbackPlan(parsed.data, "AI PR planner returned invalid JSON; fallback plan shown."),
    });
  }
}
