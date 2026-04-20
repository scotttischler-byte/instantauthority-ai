'use client';

import { useEffect, useMemo, useState } from "react";

const tabs = ["Authority Reports", "PR Reports", "Competitor Reports"] as const;
type Release = {
  id: string;
  headline: string;
  status: string;
  type: string;
  geoScore: number | null;
  wordCount: number;
  createdAt: string;
  content: string;
  client: { name: string } | null;
};

export default function ReportsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Authority Reports");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/releases");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load reports.");
        setReleases(data.releases ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error while loading reports.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "PR Reports") return releases;
    if (tab === "Authority Reports") return releases.filter((r) => r.geoScore !== null);
    return releases.filter((r) => r.type.toLowerCase().includes("competitor"));
  }, [releases, tab]);

  const beforeReport = filtered.find((r) => r.id === before);
  const afterReport = filtered.find((r) => r.id === after);
  const delta = beforeReport && afterReport && beforeReport.geoScore !== null && afterReport.geoScore !== null
    ? afterReport.geoScore - beforeReport.geoScore
    : null;

  async function removeReport(id: string) {
    const ok = window.confirm("Delete this report?");
    if (!ok) return;
    const res = await fetch(`/api/releases/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete report.");
      return;
    }
    setReleases((prev) => prev.filter((r) => r.id !== id));
  }

  function downloadTextReport(report: Release) {
    const body = `Headline: ${report.headline}\nClient: ${report.client?.name ?? "N/A"}\nStatus: ${report.status}\nDate: ${new Date(report.createdAt).toLocaleString()}\n\n${report.content}`;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.headline.slice(0, 50).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "report"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} className={`rounded-full px-3 py-1 text-sm ${tab === t ? "bg-charcoal text-white" : "border border-electric/20"}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-electric/10 bg-white p-4">
        {loading ? <p className="text-sm text-slate-600">Loading reports...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !filtered.length ? <p className="text-sm text-slate-600">No reports yet.</p> : null}
        <div className="space-y-2">
          {filtered.map((report) => (
            <div key={report.id} className="rounded border border-electric/10 p-3 text-sm">
              <p className="font-semibold text-charcoal">{report.headline}</p>
              <p className="text-xs text-slate-500">
                {report.client?.name ?? "No client"} | {new Date(report.createdAt).toLocaleDateString()} | GEO: {report.geoScore ?? "N/A"} | {report.status}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button className="rounded border px-2 py-1" onClick={() => window.alert(report.content)}>View</button>
                <button className="rounded border px-2 py-1" onClick={() => downloadTextReport(report)}>Download</button>
                <button className="rounded border px-2 py-1" onClick={() => setBefore(report.id)}>Set Before</button>
                <button className="rounded border px-2 py-1" onClick={() => setAfter(report.id)}>Set After</button>
                <button className="rounded border px-2 py-1 text-red-600" onClick={() => void removeReport(report.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-electric/10 bg-white p-4">
        <h3 className="font-display text-xl">Compare view</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Before report id" value={before} onChange={(e) => setBefore(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="After report id" value={after} onChange={(e) => setAfter(e.target.value)} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {delta === null ? "Select two reports with GEO scores to compare." : `Delta GEO score: ${delta > 0 ? "↑" : delta < 0 ? "↓" : "→"} ${Math.abs(delta)}`}
        </p>
      </div>
      <button className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal" onClick={() => window.print()}>Generate Report</button>
    </div>
  );
}
