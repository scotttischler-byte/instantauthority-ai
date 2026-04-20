'use client';

import { useEffect, useState } from "react";

type ClientPortal = {
  id: string;
  name: string;
  portalSlug: string | null;
  portalToken: string | null;
};

export default function PortalPage() {
  const [clients, setClients] = useState<ClientPortal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/clients");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load client portals.");
        setClients(data.clients ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error while loading portals.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function portalUrl(client: ClientPortal) {
    return `${window.location.origin}/portal/${client.portalSlug}?token=${client.portalToken}`;
  }

  return (
    <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-6">
      <h1 className="font-display text-2xl">Client Portal Links</h1>
      <p className="mt-2 text-sm text-slate-600">Generate and manage shareable token-protected links from the Clients page.</p>
      {loading ? <p className="text-sm text-slate-600">Loading client portals...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !clients.length ? <p className="text-sm text-slate-600">No clients yet. Add one in the Clients tab.</p> : null}
      <div className="space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="rounded-lg border border-electric/10 p-3">
            <p className="font-semibold text-charcoal">{client.name}</p>
            {!client.portalSlug || !client.portalToken ? (
              <p className="text-sm text-slate-500">Portal link unavailable for this client.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded border border-electric/20 px-3 py-1 text-sm" onClick={() => void navigator.clipboard.writeText(portalUrl(client))}>
                  Copy link
                </button>
                <a className="rounded border border-electric/20 px-3 py-1 text-sm" href={portalUrl(client)} target="_blank" rel="noreferrer">
                  Open portal
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
