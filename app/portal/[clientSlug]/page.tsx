import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ clientSlug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ClientPortalPage({ params, searchParams }: Props) {
  if (!process.env.DATABASE_URL) notFound();
  const { clientSlug } = await params;
  const { token } = await searchParams;
  const client = await prisma.client.findFirst({ where: { portalSlug: clientSlug } });
  if (!client || !token || token !== client.portalToken) notFound();
  const releases = await prisma.pressRelease.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 5 });
  const analyses = await prisma.websiteAnalysis.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 10 });
  const latest = analyses[0];

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-xl bg-white p-6">
          <h1 className="font-display text-3xl">Your Authority Dashboard</h1>
          <p className="text-slate-600">{client.name}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-500">Authority Score</p><p className="font-display text-3xl text-cyan">{latest?.totalScore ?? 0}</p></div>
          <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-500">SEO Score</p><p className="font-display text-3xl text-electric">{latest?.seoScore ?? 0}</p></div>
          <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-500">GEO Score</p><p className="font-display text-3xl text-cyan">{latest?.geoScore ?? 0}</p></div>
          <div className="rounded-xl bg-white p-4"><p className="text-xs text-slate-500">Releases this month</p><p className="font-display text-3xl text-electric">{releases.length}</p></div>
        </div>
        <div className="rounded-xl bg-white p-5">
          <h2 className="font-display text-xl">Latest 5 press releases</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">{releases.map((r) => <li key={r.id}>{r.headline} — {new Date(r.createdAt).toLocaleDateString()} ({r.status})</li>)}</ul>
        </div>
        <footer className="text-center text-xs text-slate-500">Powered by InstantAuthority.ai</footer>
      </div>
    </div>
  );
}
