'use client';

import { useState } from "react";

const channelOptions = ["PRwire", "EIN Presswire", "LinkedIn", "Instagram", "Email pitch", "Client portal"];

const workflow = [
  {
    title: "1. Client intake",
    body: "AI coaches the franchisee through missing proof, quotes, offers, locations, approvals, and media contact details.",
  },
  {
    title: "2. Draft creation",
    body: "Authority Engine creates the release and supporting assets from approved inputs instead of a blank prompt.",
  },
  {
    title: "3. AI double-check",
    body: "A second AI reviewer scores newsworthiness, GEO readiness, factual risk, compliance risk, and distribution fit.",
  },
  {
    title: "4. Human review gate",
    body: "A person signs off on claims, quotes, client approvals, and channel readiness before anything is published.",
  },
  {
    title: "5. Distribution assistant",
    body: "The system prepares PRwire copy, social captions, email pitch copy, and a submission checklist for tracking.",
  },
  {
    title: "6. Authority follow-up",
    body: "AI recommends the next release, backlink/citation checks, portal updates, and client coaching notes.",
  },
];

type AutopilotReview = {
  aiAvailable: boolean;
  warning?: string;
  overallScore: number;
  readiness: "needs_work" | "ready_for_human" | "approved_with_minor_edits";
  riskLevel: "low" | "medium" | "high";
  humanReviewRequired: boolean;
  executiveSummary: string;
  mustFix: string[];
  coachingNotes: string[];
  factCheckQuestions: string[];
  complianceRisks: string[];
  franchiseeInstructions: string[];
  clientApprovalChecklist: string[];
  channelAssets: {
    pressWire: string;
    linkedIn: string;
    instagram: string;
    emailPitch: string;
  };
  revisedRelease: string;
  nextBestActions: string[];
};

export default function AutopilotPage() {
  const [clientName, setClientName] = useState("");
  const [audience, setAudience] = useState("Local customers, journalists, and AI answer engines");
  const [headline, setHeadline] = useState("");
  const [draft, setDraft] = useState("");
  const [channels, setChannels] = useState<string[]>(["PRwire", "LinkedIn", "Instagram", "Email pitch"]);
  const [review, setReview] = useState<AutopilotReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAutopilot() {
    setError(null);
    setReview(null);
    if (!headline.trim() || !draft.trim()) {
      setError("Add a headline and draft before launching Autopilot review.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/autopilot/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          content: draft,
          clientName,
          audience,
          channels,
          reviewerMode: "autopilot",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to run Autopilot review.");
      setReview(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while launching Autopilot.");
    } finally {
      setLoading(false);
    }
  }

  function toggleChannel(channel: string) {
    setChannels((current) => (current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan/30 bg-charcoal p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">AI Autopilot</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="font-display text-3xl">Automate authority publishing with AI checks and human approval.</h2>
            <p className="mt-3 max-w-3xl text-white/75">
              Built for the core team, franchisees, and clients: AI coaches intake, drafts assets, double-checks quality, and hands a clean approval checklist to a human reviewer before distribution.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm text-white/70">Operating rule</p>
            <p className="mt-1 font-display text-xl">Autonomous until approval. Human before publish.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflow.map((step) => (
          <div key={step.title} className="rounded-xl border border-electric/10 bg-white p-5">
            <h3 className="font-display text-lg text-charcoal">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-5">
          <div>
            <h2 className="font-display text-xl">Coach and double-check a release</h2>
            <p className="mt-1 text-sm text-slate-600">Paste a draft or handoff from a franchisee/client. Autopilot returns the fix list, coaching notes, channel copy, and human approval checklist.</p>
          </div>
          <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Client or franchisee name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Release headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {channelOptions.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => toggleChannel(channel)}
                className={`rounded-full border px-3 py-1 text-xs ${channels.includes(channel) ? "border-cyan bg-cyan/20" : "border-electric/20"}`}
              >
                {channel}
              </button>
            ))}
          </div>
          <textarea className="min-h-72 w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Paste release draft, client notes, or franchisee handoff here" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button disabled={loading} onClick={() => void runAutopilot()} className="w-full rounded-lg bg-cyan px-4 py-3 font-semibold text-charcoal disabled:opacity-60">
            {loading ? "Running AI coach..." : "Run AI Autopilot Review"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-5">
          <h2 className="font-display text-xl">Autopilot output</h2>
          {!review ? (
            <div className="rounded-lg border border-dashed border-electric/20 bg-surface p-6 text-sm text-slate-600">
              Run a review to generate the release score, AI coaching plan, approval checklist, channel assets, and next best actions.
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Score" value={String(review.overallScore)} />
                <Metric label="Readiness" value={review.readiness.replaceAll("_", " ")} />
                <Metric label="Risk" value={review.riskLevel} />
                <Metric label="Human gate" value={review.humanReviewRequired ? "Required" : "Optional"} />
              </div>
              <div className="rounded-lg bg-surface p-3 text-slate-700">{review.executiveSummary}</div>
              {review.warning ? <p className="rounded bg-amber-50 p-2 text-amber-700">{review.warning}</p> : null}
              <div className="grid gap-3 md:grid-cols-2">
                <ListBlock title="Must fix" items={review.mustFix} />
                <ListBlock title="Fact-check questions" items={review.factCheckQuestions} />
                <ListBlock title="Franchisee instructions" items={review.franchiseeInstructions} />
                <ListBlock title="Client approval" items={review.clientApprovalChecklist} />
                <ListBlock title="Compliance risks" items={review.complianceRisks} />
                <ListBlock title="Next best actions" items={review.nextBestActions} />
              </div>
              <div className="rounded-lg border border-electric/10 p-3">
                <p className="font-semibold">Copy-ready channel assets</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {[
                    ["PRwire", review.channelAssets.pressWire],
                    ["LinkedIn", review.channelAssets.linkedIn],
                    ["Instagram caption", review.channelAssets.instagram],
                    ["Email pitch", review.channelAssets.emailPitch],
                  ].map(([label, value]) => (
                    <button key={label} className="rounded border border-electric/10 p-2 text-left hover:bg-surface" onClick={() => void navigator.clipboard.writeText(value)}>
                      <span className="font-semibold">{label}</span>
                      <span className="mt-1 line-clamp-3 block text-xs text-slate-500">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-electric/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">AI revised release</p>
                  <button className="rounded border border-electric/20 px-2 py-1 text-xs" onClick={() => setDraft(review.revisedRelease)}>Use revision</button>
                </div>
                <div className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-surface p-3 text-xs text-slate-600">{review.revisedRelease}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold capitalize text-charcoal">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 space-y-1 text-slate-600">
        {items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>Nothing flagged.</li>}
      </ul>
    </div>
  );
}
