'use client';

import { useEffect, useMemo, useState } from "react";

type Row = { id: string; headline: string; type: string; status: string; wordCount: number; geoScore: number | null; scheduledDate: string | null; client: { name: string } | null };
const tabs = ["All", "Draft", "Ready", "Submitted", "Scheduled"] as const;

export default function QueuePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [showDistribution, setShowDistribution] = useState<string | null>(null);
  const [sites, setSites] = useState<string[]>([]);
  const [customSite, setCustomSite] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadReleases() {
    const res = await fetch("/api/releases");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load release queue.");
    setRows(data.releases ?? []);
  }

  useEffect(() => {
    void loadReleases().catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load release queue.");
    });
  }, []);

  async function updateStatus(id: string, status: string) {
    setError(null);
    const res = await fetch(`/api/releases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to update release status.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.release.status } : r)));
  }

  async function removeRelease(id: string) {
    const ok = window.confirm("Delete this release?");
    if (!ok) return;
    setError(null);
    const res = await fetch(`/api/releases/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete release.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function saveDistribution() {
    if (!showDistribution) return;
    const allSites = [...sites, customSite.trim()].filter(Boolean);
    if (!allSites.length) {
      setError("Select at least one distribution site.");
      return;
    }
    setError(null);
    const res = await fetch("/api/distributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ releaseId: showDistribution, sites: allSites }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save distribution.");
      return;
    }
    await updateStatus(showDistribution, "SUBMITTED");
    setShowDistribution(null);
    setSites([]);
    setCustomSite("");
  }

  const filtered = useMemo(() => {
    if (tab === "All") return rows;
    if (tab === "Scheduled") return rows.filter((r) => !!r.scheduledDate);
    return rows.filter((r) => r.status.toLowerCase() === tab.toLowerCase());
  }, [rows, tab]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-cyan/40 bg-cyan/10 p-4 text-sm text-electric">
        Ready to submit? Copy your release → Log into PRwire → Paste → Submit. Takes under 2 minutes.
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-sm ${t === tab ? "bg-charcoal text-white" : "border border-electric/20"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-electric/10 bg-white">
        {error ? <p className="p-3 text-sm text-red-600">{error}</p> : null}
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-surface text-slate-500">
            <tr><th className="px-3 py-2"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? filtered.map((r) => r.id) : [])} /></th><th>Client</th><th>Headline</th><th>Type</th><th>GEO</th><th>Words</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-electric/10">
                <td className="px-3 py-2"><input type="checkbox" checked={selected.includes(r.id)} onChange={(e) => setSelected((s) => e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id))} /></td>
                <td>{r.client?.name ?? "—"}</td><td>{r.headline}</td><td>{r.type}</td><td>{r.geoScore ?? "—"}</td><td>{r.wordCount}</td><td>{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "—"}</td><td>{r.status}</td>
                <td className="space-x-1 py-2">
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => void navigator.clipboard.writeText(r.headline)}>Copy</button>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => void updateStatus(r.id, "READY")}>Ready</button>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => setShowDistribution(r.id)}>Submitted</button>
                  <button className="rounded border px-2 py-1 text-xs text-red-600" onClick={() => void removeRelease(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDistribution ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="font-display text-xl">Where did you submit this release?</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {["PRwire", "EIN Presswire", "PR.com", "IssueWire", "OpenPR", "PRLog", "24-7 Press Release", "Business Wire", "Globe Newswire"].map((site) => (
                <label key={site}><input type="checkbox" checked={sites.includes(site)} onChange={(e) => setSites((s) => e.target.checked ? [...s, site] : s.filter((x) => x !== site))} /> {site}</label>
              ))}
            </div>
            <input className="mt-3 w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Custom site" value={customSite} onChange={(e) => setCustomSite(e.target.value)} />
            <button className="mt-3 rounded bg-cyan px-3 py-2 text-sm font-semibold text-charcoal" onClick={() => void saveDistribution()}>Save Distribution</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
