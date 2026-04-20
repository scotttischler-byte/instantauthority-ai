"use client";

import { useMemo, useState } from "react";

const tones = ["Professional", "Authoritative", "Exciting", "Concise", "Technical"];
const words = [400, 700, 1000, 1500];

export default function GeneratePage() {
  const [headline, setHeadline] = useState("");
  const [talkingPoints, setTalkingPoints] = useState("");
  const [primaryKw, setPrimaryKw] = useState("");
  const [secondaryKws, setSecondaryKws] = useState("");
  const [location, setLocation] = useState("");
  const [targetQuestion, setTargetQuestion] = useState("");
  const [stats, setStats] = useState("");
  const [competitorDiff, setCompetitorDiff] = useState("");
  const [tone, setTone] = useState("Professional");
  const [wordCountTarget, setWordCountTarget] = useState(700);
  const [quoteName, setQuoteName] = useState("");
  const [quoteTitle, setQuoteTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refineText, setRefineText] = useState("");

  const geoChecks = useMemo(() => {
    const checks = [
      /\d/.test(output),
      output.toLowerCase().includes("is a"),
      output.toLowerCase().includes("according to"),
      output.toLowerCase().includes("key facts"),
      output.toLowerCase().includes(location.toLowerCase()),
      output.toLowerCase().includes(primaryKw.toLowerCase()),
    ];
    return checks.filter(Boolean).length;
  }, [output, location, primaryKw]);

  async function generate(mode: "generate" | "refine") {
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        headline,
        talkingPoints,
        primaryKw,
        secondaryKws,
        location,
        targetQuestion,
        stats,
        competitorDiff,
        tone,
        wordCountTarget,
        quoteName,
        quoteTitle,
        audience,
        ctaUrl,
        previousContent: output,
        refineInstruction: refineText,
      }),
    });
    const data = await res.json();
    if (res.ok) setOutput(data.content ?? "");
    setLoading(false);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-5">
        <h2 className="font-display text-xl">Authority Engine</h2>
        <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Headline (required)" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        <textarea className="w-full rounded border border-electric/20 px-3 py-2 text-sm" rows={3} placeholder="Key talking points" value={talkingPoints} onChange={(e) => setTalkingPoints(e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Primary keyword" value={primaryKw} onChange={(e) => setPrimaryKw(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Secondary keywords" value={secondaryKws} onChange={(e) => setSecondaryKws(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Business location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Target audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Quote name" value={quoteName} onChange={(e) => setQuoteName(e.target.value)} />
          <input className="rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Quote title" value={quoteTitle} onChange={(e) => setQuoteTitle(e.target.value)} />
        </div>
        <textarea className="w-full rounded border border-electric/20 px-3 py-2 text-sm" rows={2} placeholder="Target AI question" value={targetQuestion} onChange={(e) => setTargetQuestion(e.target.value)} />
        <textarea className="w-full rounded border border-electric/20 px-3 py-2 text-sm" rows={2} placeholder="Real numbers to include" value={stats} onChange={(e) => setStats(e.target.value)} />
        <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Competitor differentiator" value={competitorDiff} onChange={(e) => setCompetitorDiff(e.target.value)} />
        <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="CTA URL" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
        <div className="flex flex-wrap gap-2">{tones.map((t) => <button type="button" key={t} onClick={() => setTone(t)} className={`rounded-full border px-3 py-1 text-xs ${tone === t ? "border-cyan bg-cyan/20" : "border-electric/20"}`}>{t}</button>)}</div>
        <div className="flex flex-wrap gap-2">{words.map((w) => <button type="button" key={w} onClick={() => setWordCountTarget(w)} className={`rounded-full border px-3 py-1 text-xs ${wordCountTarget === w ? "border-cyan bg-cyan/20" : "border-electric/20"}`}>{w}</button>)}</div>
        <button disabled={loading || !headline} onClick={() => void generate("generate")} className="w-full rounded-lg bg-cyan px-4 py-3 font-semibold text-charcoal disabled:opacity-60">{loading ? "Generating..." : "Generate →"}</button>
      </div>
      <div className="space-y-4 rounded-xl border border-electric/10 bg-white p-5">
        <h2 className="font-display text-xl">Output</h2>
        <div className="min-h-64 whitespace-pre-wrap rounded border border-electric/10 bg-surface p-4 text-sm text-slate-700">{output || "Your press release will appear here"}</div>
        <div className="rounded-lg border border-electric/10 bg-surface p-3">
          <p className="text-sm font-semibold">AI Citation Readiness: {geoChecks}/6</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded border border-electric/20 px-3 py-1.5" onClick={() => void navigator.clipboard.writeText(output)}>Copy</button>
          <button className="rounded border border-electric/20 px-3 py-1.5">Save Draft</button>
          <button className="rounded border border-electric/20 px-3 py-1.5">Save to Queue</button>
        </div>
        <input className="w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="What would you like to change?" value={refineText} onChange={(e) => setRefineText(e.target.value)} />
        <button onClick={() => void generate("refine")} className="rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-white">Regenerate</button>
      </div>
    </div>
  );
}
