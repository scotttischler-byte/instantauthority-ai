'use client';

import { useEffect, useState } from "react";

type Client = { id: string; name: string; industry: string; website: string | null; spokesperson: string | null; color: string | null; portalSlug: string | null; portalToken: string | null; _count?: { releases: number; analyses: number } };
const colors = ["#00D4FF", "#0F3460", "#00C896", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "SaaS", website: "", spokesperson: "", title: "", boilerplate: "", tone: "Professional", notes: "", color: colors[0], portalSlug: "" });

  async function load() {
    const res = await fetch("/api/clients");
    const data = await res.json();
    if (res.ok) setClients(data.clients ?? []);
  }
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-4">
      <button className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal" onClick={() => setOpen(true)}>Add client</button>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => (
          <div key={c.id} className="rounded-xl border border-electric/10 bg-white p-4">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || colors[0] }} /><h3 className="font-display text-xl">{c.name}</h3></div>
            <p className="mt-1 text-xs text-slate-500">{c.industry}</p>
            {c.website ? <a className="mt-2 block text-sm text-cyan underline" href={c.website} target="_blank">{c.website}</a> : null}
            <p className="mt-2 text-sm text-slate-600">Spokesperson: {c.spokesperson || "—"}</p>
            <p className="text-sm text-slate-600">Releases: {c._count?.releases ?? 0}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button className="rounded border px-2 py-1">Analyze</button>
              <button className="rounded border px-2 py-1">Generate</button>
              <button className="rounded border px-2 py-1">Edit</button>
              <button className="rounded border px-2 py-1" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portal/${c.portalSlug}?token=${c.portalToken}`)}>Portal Link</button>
              <button className="rounded border px-2 py-1">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5">
            <h3 className="font-display text-xl">Add/Edit Client</h3>
            <input className="mt-3 w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Company name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="mt-2 w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Website URL" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            <div className="mt-2 flex gap-2">{colors.map((color) => <button key={color} className="h-6 w-6 rounded-full border" style={{ backgroundColor: color }} onClick={() => setForm((f) => ({ ...f, color }))} />)}</div>
            <div className="mt-4 flex gap-2"><button className="rounded bg-cyan px-3 py-2 text-sm font-semibold text-charcoal" onClick={() => setOpen(false)}>Save</button><button className="rounded border px-3 py-2 text-sm" onClick={() => setOpen(false)}>Cancel</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
