"use client";

import { useState } from "react";

const tabs = ["Authority Reports", "PR Reports", "Competitor Reports"] as const;

export default function ReportsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Authority Reports");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");

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
        <p className="text-sm text-slate-600">Report name / Client / Date / Score / Actions</p>
        <div className="mt-3 flex gap-2 text-xs">
          <button className="rounded border px-2 py-1">View</button>
          <button className="rounded border px-2 py-1">Download PDF</button>
          <button className="rounded border px-2 py-1">Delete</button>
          <button className="rounded border px-2 py-1">Compare</button>
        </div>
      </div>
      <div className="rounded-xl border border-electric/10 bg-white p-4">
        <h3 className="font-display text-xl">Compare view</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Before report id" value={before} onChange={(e) => setBefore(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="After report id" value={after} onChange={(e) => setAfter(e.target.value)} />
        </div>
        <p className="mt-2 text-sm text-slate-600">Delta indicators (↑ improved ↓ declined)</p>
      </div>
      <button className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Generate Report</button>
    </div>
  );
}
