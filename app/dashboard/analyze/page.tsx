'use client';

import { useState } from "react";
import type { AnalysisReport } from "@/lib/analysis";

const statuses = [
  "Fetching website content...",
  "Running SEO analysis...",
  "Checking GEO readiness...",
  "Generating recommendations...",
];

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(statuses[0]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [competitor, setCompetitor] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(target: string) {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: target }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analyze failed");
    return data.report as AnalysisReport;
  }

  async function analyze() {
    setLoading(true);
    setError(null);
    setStatus(statuses[0]);
    const timer = setInterval(() => {
      setStatus((s) => statuses[(statuses.indexOf(s) + 1) % statuses.length]);
    }, 1100);
    try {
      const mine = await run(url);
      setReport(mine);
      if (competitorUrl) setCompetitor(await run(competitorUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze website.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Website Authority Analyzer</h1>
      <p className="text-slate-600">Analyze any website for SEO and AI citation readiness</p>
      <div className="rounded-xl border border-electric/10 bg-white p-5">
        <input className="w-full rounded border border-electric/20 px-3 py-3" placeholder="https://yourwebsite.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        <input className="mt-3 w-full rounded border border-electric/20 px-3 py-3" placeholder="Compare against competitor (optional)" value={competitorUrl} onChange={(e) => setCompetitorUrl(e.target.value)} />
        <button className="mt-3 rounded-lg bg-cyan px-5 py-2.5 font-semibold text-charcoal" onClick={() => void analyze()} disabled={loading || !url}>
          Analyze Now →
        </button>
        {loading ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
      {report ? (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-electric/10 bg-white p-4 text-center"><p>SEO Score</p><p className="font-display text-4xl text-electric">{report.scores.seoTotal}</p></div>
            <div className="rounded-xl border border-electric/10 bg-white p-4 text-center"><p>GEO Score</p><p className="font-display text-4xl text-cyan">{report.scores.geoTotal * 5}</p></div>
            <div className="rounded-xl border border-electric/10 bg-charcoal p-4 text-center text-white"><p>Authority</p><p className="font-display text-4xl text-cyan">{report.scores.total}</p></div>
          </div>
          {competitor ? <div className="rounded-xl border border-electric/10 bg-white p-4 text-sm">Your Site vs Competitor: {report.scores.total} vs {competitor.scores.total}</div> : null}
          <div className="rounded-xl bg-charcoal p-5 text-white">
            <h2 className="font-display text-xl">Executive Summary</h2>
            <p className="mt-2 text-white/90">{report.executiveSummary}</p>
            <div className="mt-3 rounded-lg bg-cyan/20 p-3 text-cyan">{report.aiVisibilityAssessment}</div>
          </div>
          {[
            ["On-Page SEO", report.scores.onPage, report.sections.onPage],
            ["Content Quality", report.scores.content, report.sections.content],
            ["Technical SEO", report.scores.technical, report.sections.technical],
            ["Authority & Trust", report.scores.authority, report.sections.authority],
            ["GEO / AI Readiness", report.scores.geo, report.sections.geo],
          ].map(([name, score, section]) => (
            <details key={String(name)} className="rounded-xl border border-electric/10 bg-white p-4" open>
              <summary className="cursor-pointer font-semibold">{String(name)} ({String(score)}/20)</summary>
              <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                <div><p className="font-semibold text-emerald-700">✅ What&apos;s working</p>{(section as AnalysisReport["sections"]["onPage"]).found.map((x) => <p key={x}>{x}</p>)}</div>
                <div><p className="font-semibold text-red-700">❌ What&apos;s missing</p>{(section as AnalysisReport["sections"]["onPage"]).missing.map((x) => <p key={x}>{x}</p>)}</div>
                <div><p className="font-semibold text-cyan">💡 Recommendations</p>{(section as AnalysisReport["sections"]["onPage"]).recommendations.map((x, i) => <p key={`${x.text}-${i}`}>[{x.priority}] {x.text}</p>)}</div>
              </div>
            </details>
          ))}
        </>
      ) : null}
    </div>
  );
}
