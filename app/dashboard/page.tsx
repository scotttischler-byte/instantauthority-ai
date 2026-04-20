import Link from "next/link";
import { getOrCreateDbUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();
  const metrics = {
    authority: 0,
    releasesMonth: 0,
    clients: 0,
    citations: 0,
    avgGeo: 0,
  };
  let recent: Array<{ id: string; headline: string; createdAt: Date; status: string }> = [];
  let clients: Array<{ id: string; name: string; industry: string; _count: { releases: number } }> = [];
  if (user) {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const [releasesMonth, totalClients, analyses, releases, topClients] = await Promise.all([
      prisma.pressRelease.count({ where: { userId: user.id, createdAt: { gte: start } } }),
      prisma.client.count({ where: { userId: user.id } }),
      prisma.websiteAnalysis.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.pressRelease.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.client.findMany({ where: { userId: user.id }, include: { _count: { select: { releases: true } } }, take: 6 }),
    ]);
    metrics.releasesMonth = releasesMonth;
    metrics.clients = totalClients;
    metrics.avgGeo = analyses.length ? Math.round(analyses.reduce((a, b) => a + b.geoScore, 0) / analyses.length) : 0;
    metrics.authority = analyses[0]?.totalScore ?? 0;
    metrics.citations = releasesMonth * 2 + metrics.avgGeo;
    recent = releases;
    clients = topClients;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Authority Score", metrics.authority],
          ["Releases This Month", metrics.releasesMonth],
          ["Active Clients", metrics.clients],
          ["AI Citations Estimated", metrics.citations],
          ["Avg GEO Score", metrics.avgGeo],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-electric/10 bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 font-display text-3xl text-cyan">{String(value)}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-electric/10 bg-white p-5">
        <h2 className="font-display text-xl text-charcoal">Authority trend (30 days)</h2>
        <svg viewBox="0 0 400 120" className="mt-3 h-36 w-full">
          <polyline fill="none" stroke="#00D4FF" strokeWidth="3" points="0,100 50,95 100,80 150,82 200,70 250,65 300,52 350,46 400,40" />
        </svg>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-electric/10 bg-white p-5">
          <h2 className="font-display text-xl">Recent activity</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {recent.map((r) => (
              <li key={r.id}>Release generated: {r.headline} ({r.status.toLowerCase()})</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-electric/10 bg-white p-5">
          <h2 className="font-display text-xl">Quick actions</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-lg bg-cyan px-3 py-2 text-sm font-semibold text-charcoal" href="/dashboard/generate">Generate Release</Link>
            <Link className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm" href="/dashboard/analyze">Analyze Website</Link>
            <Link className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm" href="/dashboard/clients">Add Client</Link>
            <Link className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm" href="/dashboard/calendar">View Calendar</Link>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-electric/10 bg-white p-5">
        <h2 className="font-display text-xl">Top clients</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-slate-500"><tr><th>Client</th><th>Industry</th><th>Releases</th><th>Authority</th><th>Last Activity</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-electric/10"><td className="py-2">{c.name}</td><td>{c.industry}</td><td>{c._count.releases}</td><td>{Math.min(100, 60 + c._count.releases * 2)}</td><td>Recent</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
