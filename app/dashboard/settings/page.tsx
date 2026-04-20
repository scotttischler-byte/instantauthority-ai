"use client";

import { useState } from "react";

const tabs = ["Account", "Defaults", "White Label", "Billing", "Integrations"] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Account");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} className={`rounded-full px-3 py-1 text-sm ${tab === t ? "bg-charcoal text-white" : "border border-electric/20"}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-electric/10 bg-white p-5">
        {tab === "Account" ? <div><p className="text-sm text-slate-600">Name/email managed by Clerk.</p></div> : null}
        {tab === "Defaults" ? <div className="space-y-3"><textarea className="w-full rounded border border-electric/20 p-2 text-sm" rows={4} placeholder="Default boilerplate" /><textarea className="w-full rounded border border-electric/20 p-2 text-sm" rows={3} placeholder="Default media contact" /></div> : null}
        {tab === "White Label" ? <div className="space-y-3"><input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Agency name" /><input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Agency logo URL" /><input type="color" className="h-10 w-full rounded border border-electric/20" /><input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Agency website" /><input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Report footer text" /><button className="rounded bg-cyan px-3 py-2 text-sm font-semibold text-charcoal">Save White Label Settings</button></div> : null}
        {tab === "Billing" ? <div><p className="text-sm text-slate-600">Current plan + usage this month.</p><button className="mt-2 rounded bg-cyan px-3 py-2 text-sm font-semibold text-charcoal">Upgrade Plan</button></div> : null}
        {tab === "Integrations" ? <div className="space-y-2 text-sm text-slate-600"><p>PRwire: setup instructions</p><p>EIN Presswire: setup instructions</p><p>Zapier: Coming soon</p><p>Slack notifications: Coming soon</p></div> : null}
      </div>
    </div>
  );
}
