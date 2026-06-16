'use client';

import { useMemo, useState } from "react";

const channels = ["PRwire", "HARO-style requests", "Qwoted", "Featured", "LinkedIn", "Instagram", "Local citations", "Partner backlinks"];

const resourceLinks = [
  { name: "HARO / Help a Reporter", type: "Journalist requests", url: "https://www.helpareporter.com/" },
  { name: "Qwoted", type: "Journalist requests", url: "https://www.qwoted.com/" },
  { name: "Featured", type: "Expert roundups", url: "https://www.featured.com/" },
  { name: "PRwire", type: "Wire submission", url: "https://www.prwire.com/" },
  { name: "Google Business Profile", type: "Local citation", url: "https://www.google.com/business/" },
  { name: "LinkedIn company page", type: "Social proof", url: "https://www.linkedin.com/company/" },
];

const defaultLinks = [
  {
    id: "approval",
    name: "Client approval packet",
    type: "approval",
    url: "",
    status: "needs_human",
    owner: "Account manager",
    notes: "Confirm claims, quote, logo, media contact, and target channels.",
  },
  {
    id: "haro",
    name: "HARO-style request monitoring",
    type: "journalist_request",
    url: "https://www.helpareporter.com/",
    status: "queued",
    owner: "AI coach",
    notes: "Check for matching source requests and draft pitches for human approval.",
  },
  {
    id: "qwoted",
    name: "Qwoted spokesperson profile",
    type: "journalist_request",
    url: "https://www.qwoted.com/",
    status: "queued",
    owner: "Franchisee",
    notes: "Create or update profile with approved bio, expertise, and quote topics.",
  },
  {
    id: "wire",
    name: "Wire service submission",
    type: "press_wire",
    url: "https://www.prwire.com/",
    status: "draft",
    owner: "PR manager",
    notes: "Paste approved copy, capture receipt/submitted URL, and track pickups.",
  },
  {
    id: "gbp",
    name: "Google Business Profile update",
    type: "local_citation",
    url: "https://www.google.com/business/",
    status: "draft",
    owner: "Franchisee",
    notes: "Repurpose approved release into a shorter local update.",
  },
  {
    id: "partners",
    name: "Partner backlink outreach",
    type: "partner",
    url: "",
    status: "draft",
    owner: "Account manager",
    notes: "Ask approved partners, suppliers, franchise locations, and associations to link to the hosted release.",
  },
];

type LinkStatus = "draft" | "queued" | "submitted" | "published" | "needs_human";

type TrackedLink = {
  id: string;
  name: string;
  type: string;
  url: string;
  status: LinkStatus;
  owner: string;
  notes: string;
};

type PlanTask = {
  title: string;
  owner: string;
  priority: "low" | "medium" | "high";
  status: "draft" | "needs_human" | "ready" | "scheduled";
  instructions: string;
};

type PrPlan = {
  aiAvailable: boolean;
  warning?: string;
  automationScore: number;
  humanApprovalRequired: boolean;
  summary: string;
  haroAngles: Array<{ query: string; pitch: string; proofNeeded: string }>;
  linkTargets: Array<{ name: string; type: string; url: string; action: string; expectedValue: string }>;
  distributionTasks: PlanTask[];
  followUpTasks: PlanTask[];
  trackingMetrics: string[];
  risks: string[];
  nextBestActions: string[];
};

export default function PrSystemPage() {
  const [clientName, setClientName] = useState("Apex Growth Partners");
  const [industry, setIndustry] = useState("AI visibility and authority marketing");
  const [market, setMarket] = useState("Austin, TX");
  const [releaseHeadline, setReleaseHeadline] = useState("");
  const [releaseSummary, setReleaseSummary] = useState("");
  const [goals, setGoals] = useState("Earn journalist mentions, backlinks, local citations, and AI citation-ready proof.");
  const [approvedChannels, setApprovedChannels] = useState<string[]>(["PRwire", "HARO-style requests", "LinkedIn", "Local citations", "Partner backlinks"]);
  const [trackedLinks, setTrackedLinks] = useState<TrackedLink[]>(() => {
    if (typeof window === "undefined") return defaultLinks as TrackedLink[];
    const stored = window.localStorage.getItem("ia_pr_system_links_v1");
    return stored ? (JSON.parse(stored) as TrackedLink[]) : (defaultLinks as TrackedLink[]);
  });
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customType, setCustomType] = useState("industry_blog");
  const [plan, setPlan] = useState<PrPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const submitted = trackedLinks.filter((link) => link.status === "submitted" || link.status === "published").length;
    const published = trackedLinks.filter((link) => link.status === "published").length;
    const pendingHuman = trackedLinks.filter((link) => link.status === "needs_human").length;
    const queued = trackedLinks.filter((link) => link.status === "queued").length;
    return { submitted, published, pendingHuman, queued };
  }, [trackedLinks]);

  function persistLinks(next: TrackedLink[]) {
    setTrackedLinks(next);
    if (typeof window !== "undefined") window.localStorage.setItem("ia_pr_system_links_v1", JSON.stringify(next));
  }

  function toggleChannel(channel: string) {
    setApprovedChannels((current) => (current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]));
  }

  function updateStatus(id: string, status: LinkStatus) {
    persistLinks(trackedLinks.map((link) => (link.id === id ? { ...link, status } : link)));
  }

  function addCustomLink() {
    if (!customName.trim()) return;
    persistLinks([
      {
        id: Math.random().toString(36).slice(2, 10),
        name: customName.trim(),
        type: customType,
        url: customUrl.trim(),
        status: "draft",
        owner: "Unassigned",
        notes: "Custom opportunity added from PR Command Center.",
      },
      ...trackedLinks,
    ]);
    setCustomName("");
    setCustomUrl("");
  }

  function addPlanTarget(target: PrPlan["linkTargets"][number]) {
    persistLinks([
      {
        id: Math.random().toString(36).slice(2, 10),
        name: target.name,
        type: target.type,
        url: target.url,
        status: "queued",
        owner: "AI suggested",
        notes: `${target.action} Expected value: ${target.expectedValue}`,
      },
      ...trackedLinks,
    ]);
  }

  async function generatePlan() {
    setError(null);
    setPlan(null);
    if (!releaseHeadline.trim() || !releaseSummary.trim()) {
      setError("Add a release headline and summary before generating a PR automation plan.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pr-system/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          industry,
          market,
          releaseHeadline,
          releaseSummary,
          goals,
          approvedChannels,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to generate PR automation plan.");
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while generating PR plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan/30 bg-charcoal p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">PR Command Center</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-3xl">Automate PR distribution, HARO-style pitching, links, and tracking.</h2>
            <p className="mt-3 max-w-3xl text-white/75">
              Build an AI-generated PR plan for your team, franchisees, and clients, then track approvals, wire submissions, journalist requests, backlinks, and published URLs in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MetricCard label="Queued" value={metrics.queued} />
            <MetricCard label="Needs human" value={metrics.pendingHuman} />
            <MetricCard label="Submitted" value={metrics.submitted} />
            <MetricCard label="Published links" value={metrics.published} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-5">
          <div>
            <h2 className="font-display text-xl">AI PR automation planner</h2>
            <p className="mt-1 text-sm text-slate-600">Generate the distribution plan, HARO-style angles, backlink targets, follow-up tasks, and dashboard metrics.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded border border-electric/20 px-3 py-2 text-sm" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client / franchisee" />
            <input className="rounded border border-electric/20 px-3 py-2 text-sm" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" />
            <input className="rounded border border-electric/20 px-3 py-2 text-sm" value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Market / location" />
            <input className="rounded border border-electric/20 px-3 py-2 text-sm" value={releaseHeadline} onChange={(e) => setReleaseHeadline(e.target.value)} placeholder="Release headline" />
          </div>
          <textarea className="min-h-28 w-full rounded border border-electric/20 px-3 py-2 text-sm" value={releaseSummary} onChange={(e) => setReleaseSummary(e.target.value)} placeholder="Release summary, proof points, offer, and news angle" />
          <textarea className="min-h-20 w-full rounded border border-electric/20 px-3 py-2 text-sm" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="PR goals" />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Approved automation channels</p>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`rounded-full border px-3 py-1 text-xs ${approvedChannels.includes(channel) ? "border-cyan bg-cyan/20" : "border-electric/20"}`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>
          <button disabled={loading} onClick={() => void generatePlan()} className="w-full rounded-lg bg-cyan px-4 py-3 font-semibold text-charcoal disabled:opacity-60">
            {loading ? "Building PR plan..." : "Generate PR Automation Plan"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-5">
          <h2 className="font-display text-xl">AI plan output</h2>
          {!plan ? (
            <div className="rounded-lg border border-dashed border-electric/20 bg-surface p-6 text-sm text-slate-600">
              Generate a plan to see HARO-style pitch angles, backlink targets, distribution tasks, follow-up tasks, and risks.
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <SmallStat label="Automation score" value={String(plan.automationScore)} />
                <SmallStat label="Human approval" value={plan.humanApprovalRequired ? "Required" : "Optional"} />
                <SmallStat label="AI status" value={plan.aiAvailable ? "AI generated" : "Fallback"} />
              </div>
              <p className="rounded-lg bg-surface p-3 text-slate-700">{plan.summary}</p>
              {plan.warning ? <p className="rounded bg-amber-50 p-2 text-amber-700">{plan.warning}</p> : null}
              <div className="grid gap-3 lg:grid-cols-2">
                <ListBlock title="HARO-style angles" items={plan.haroAngles.map((angle) => `${angle.query}: ${angle.pitch} Proof needed: ${angle.proofNeeded}`)} />
                <ListBlock title="Tracking metrics" items={plan.trackingMetrics} />
                <TaskBlock title="Distribution tasks" tasks={plan.distributionTasks} />
                <TaskBlock title="Follow-up tasks" tasks={plan.followUpTasks} />
                <ListBlock title="Risks" items={plan.risks} />
                <ListBlock title="Next best actions" items={plan.nextBestActions} />
              </div>
              <div className="rounded-lg border border-electric/10 p-3">
                <p className="font-semibold">Suggested links and targets</p>
                <div className="mt-2 grid gap-2">
                  {plan.linkTargets.map((target) => (
                    <div key={`${target.name}-${target.url}`} className="rounded-lg bg-surface p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{target.name}</p>
                          <p className="text-xs text-slate-500">{target.type} - {target.expectedValue}</p>
                        </div>
                        <button className="rounded border border-electric/20 px-2 py-1 text-xs" onClick={() => addPlanTarget(target)}>Add to tracker</button>
                      </div>
                      <p className="mt-2 text-slate-600">{target.action}</p>
                      {target.url ? <a className="mt-1 block text-xs text-electric underline" href={target.url} target="_blank" rel="noreferrer">{target.url}</a> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-electric/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">PR pipeline tracker</h2>
              <p className="mt-1 text-sm text-slate-600">Track every approval, journalist request, wire submission, link target, and published URL.</p>
            </div>
            <button className="rounded border border-electric/20 px-3 py-1.5 text-sm" onClick={() => persistLinks(defaultLinks as TrackedLink[])}>Reset defaults</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-3 py-2">Opportunity</th><th>Type</th><th>Owner</th><th>Status</th><th>Link</th><th>Notes</th><th>Update</th></tr>
              </thead>
              <tbody>
                {trackedLinks.map((link) => (
                  <tr key={link.id} className="border-t border-electric/10">
                    <td className="px-3 py-2 font-semibold">{link.name}</td>
                    <td>{link.type.replaceAll("_", " ")}</td>
                    <td>{link.owner}</td>
                    <td><StatusBadge status={link.status} /></td>
                    <td>{link.url ? <a className="text-electric underline" href={link.url} target="_blank" rel="noreferrer">Open</a> : "Add URL"}</td>
                    <td className="max-w-xs text-xs text-slate-500">{link.notes}</td>
                    <td>
                      <select className="rounded border border-electric/20 px-2 py-1 text-xs" value={link.status} onChange={(e) => updateStatus(link.id, e.target.value as LinkStatus)}>
                        <option value="draft">Draft</option>
                        <option value="queued">Queued</option>
                        <option value="needs_human">Needs human</option>
                        <option value="submitted">Submitted</option>
                        <option value="published">Published</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-electric/10 bg-white p-5">
            <h2 className="font-display text-xl">Add another link target</h2>
            <div className="mt-3 space-y-3">
              <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Target name" />
              <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="URL" />
              <select className="w-full rounded border border-electric/20 px-3 py-2 text-sm" value={customType} onChange={(e) => setCustomType(e.target.value)}>
                <option value="journalist_request">Journalist request</option>
                <option value="press_wire">Press wire</option>
                <option value="local_citation">Local citation</option>
                <option value="industry_blog">Industry blog</option>
                <option value="partner">Partner backlink</option>
                <option value="podcast">Podcast</option>
                <option value="directory">Directory</option>
              </select>
              <button className="w-full rounded bg-charcoal px-3 py-2 text-sm font-semibold text-white" onClick={addCustomLink}>Add to tracker</button>
            </div>
          </div>
          <div className="rounded-xl border border-electric/10 bg-white p-5">
            <h2 className="font-display text-xl">Quick resource links</h2>
            <div className="mt-3 grid gap-2">
              {resourceLinks.map((link) => (
                <a key={link.name} className="rounded-lg border border-electric/10 p-3 hover:bg-surface" href={link.url} target="_blank" rel="noreferrer">
                  <span className="block font-semibold">{link.name}</span>
                  <span className="text-xs text-slate-500">{link.type}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
      <p className="text-xs text-white/65">{label}</p>
      <p className="font-display text-2xl text-cyan">{value}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
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
        {items.length ? items.map((item) => <li key={item}>- {item}</li>) : <li>Nothing yet.</li>}
      </ul>
    </div>
  );
}

function TaskBlock({ title, tasks }: { title: string; tasks: PlanTask[] }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="font-semibold">{title}</p>
      <div className="mt-2 space-y-2">
        {tasks.map((task) => (
          <div key={`${task.title}-${task.owner}`} className="rounded bg-white p-2">
            <p className="font-semibold">{task.title}</p>
            <p className="text-xs text-slate-500">{task.owner} - {task.priority} - {task.status.replaceAll("_", " ")}</p>
            <p className="mt-1 text-slate-600">{task.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LinkStatus }) {
  const styles: Record<LinkStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    queued: "bg-cyan/20 text-electric",
    needs_human: "bg-amber-100 text-amber-700",
    submitted: "bg-blue-100 text-blue-700",
    published: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status.replaceAll("_", " ")}</span>;
}
