import Link from "next/link";
import { BarChart3, FileText, Globe2, Search, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-surface text-charcoal">
      <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="font-display text-xl font-semibold text-charcoal">
            InstantAuthority<span className="text-cyan">.ai</span>
          </p>
          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">Blog</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-charcoal">
              Sign In
            </Link>
            <Link href="/sign-up" className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-electric">
              The #1 GEO & SEO Authority Platform
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-tight">
              Build Instant Authority.
              <br />
              <span className="text-cyan">Get Cited By AI.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              The only platform that combines AI-powered press releases, website analysis, and GEO optimization to
              make your brand the most trusted source in your industry — in 30 days.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/sign-up" className="rounded-lg bg-cyan px-6 py-3 font-semibold text-charcoal">
                Start Building Authority →
              </Link>
              <a href="#how" className="rounded-lg border border-charcoal/20 px-6 py-3 font-semibold text-charcoal">
                Watch Demo
              </a>
            </div>
          </div>
          <div className="relative rounded-2xl border border-charcoal/10 bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold text-electric">Authority Dashboard Preview</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-surface p-3 text-center"><p className="text-xs">SEO</p><p className="text-2xl font-bold text-cyan">88</p></div>
              <div className="rounded-xl bg-surface p-3 text-center"><p className="text-xs">GEO</p><p className="text-2xl font-bold text-cyan">91</p></div>
              <div className="rounded-xl bg-surface p-3 text-center"><p className="text-xs">Authority</p><p className="text-2xl font-bold text-electric">94</p></div>
            </div>
            <div className="mt-4 rounded-xl bg-charcoal p-4 text-sm text-white">AI Citations trend + release velocity</div>
            <div className="absolute -left-6 top-8 rounded-xl bg-white p-3 text-sm shadow-md">94 Authority Score</div>
            <div className="absolute -right-6 top-28 rounded-xl bg-white p-3 text-sm shadow-md">47 AI Citations</div>
            <div className="absolute -bottom-5 left-20 rounded-xl bg-white p-3 text-sm shadow-md">Page 1 Rankings: 23</div>
          </div>
        </section>

        <section className="border-y border-charcoal/10 bg-white py-8 text-center">
          <p className="text-sm text-slate-600">Trusted by 1,000+ agencies and B2B brands</p>
          <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span>Northstar Agency</span><span>GrowthForge</span><span>LegalOps Media</span><span>SaaSScale</span>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-display text-2xl">The Old Way</h2>
              <ul className="mt-3 space-y-2 text-sm text-red-700"><li>× SEO takes 12 months</li><li>× PR agencies charge $10,000/month</li><li>× No one optimizes for AI search</li><li>× Clients can&apos;t see ROI</li></ul>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="font-display text-2xl">The InstantAuthority Way</h2>
              <ul className="mt-3 space-y-2 text-sm text-emerald-700"><li>✓ Authority in 30 days</li><li>✓ Fraction of agency cost</li><li>✓ Built for ChatGPT, Perplexity, Google AI</li><li>✓ Real-time reporting clients love</li></ul>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { label: "Authority Engine", icon: Zap },
              { label: "Website Analyzer", icon: Search },
              { label: "GEO Optimizer", icon: Globe2 },
              { label: "White Label Reports", icon: FileText },
              { label: "Client Portal", icon: ShieldCheck },
              { label: "Authority Calendar", icon: BarChart3 },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-cyan" />
                <h3 className="mt-3 font-display text-xl">{label}</h3>
                <p className="mt-2 text-sm text-slate-600">Data-forward authority workflows for agencies and B2B teams.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="bg-white py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl">How It Works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-charcoal/10 bg-surface p-5"><p className="text-cyan">1</p><h3 className="font-display text-xl">Analyze</h3><p className="text-sm text-slate-600">Enter your website, get instant authority score.</p></div>
              <div className="rounded-xl border border-charcoal/10 bg-surface p-5"><p className="text-cyan">2</p><h3 className="font-display text-xl">Optimize</h3><p className="text-sm text-slate-600">AI generates SEO+GEO press releases daily.</p></div>
              <div className="rounded-xl border border-charcoal/10 bg-surface p-5"><p className="text-cyan">3</p><h3 className="font-display text-xl">Dominate</h3><p className="text-sm text-slate-600">Watch brand authority grow week over week.</p></div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Starter", "$297/mo", ["1 client", "8 press releases/month", "Website analyzer", "Basic PDF reports", "Email support"]],
              ["Growth", "$697/mo", ["5 clients", "20 press releases/month", "White label reports", "Client portals", "Authority calendar"]],
              ["Agency", "$1,497/mo", ["Unlimited clients", "Unlimited press releases", "Full white label", "VA workspace", "API access"]],
            ].map(([name, price, features]) => (
              <div key={String(name)} className={`rounded-xl border p-6 ${name === "Growth" ? "border-cyan bg-charcoal text-white" : "border-charcoal/10 bg-white"}`}>
                {name === "Growth" ? <p className="mb-2 inline-block rounded-full bg-cyan px-2 py-0.5 text-xs font-semibold text-charcoal">MOST POPULAR</p> : null}
                <h3 className="font-display text-2xl">{name}</h3>
                <p className="mt-2 text-3xl font-bold text-cyan">{price}</p>
                <ul className="mt-4 space-y-2 text-sm">{(features as string[]).map((f) => <li key={f}>• {f}</li>)}</ul>
                <button className="mt-5 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Start Free Trial</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <h2 className="font-display text-3xl">Testimonials</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["JH - Apex Legal", "KM - SaaS Foundry", "RT - Growthcraft"].map((name) => (
              <div key={name} className="rounded-xl border border-charcoal/10 bg-white p-5">
                <p className="text-sm text-slate-600">“We doubled authority scores and client trust in weeks.”</p>
                <p className="mt-4 text-sm font-semibold text-charcoal">{name}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-3xl">FAQ</h2>
          <div className="mt-6 space-y-3">
            {["What is GEO?", "How fast are results?", "Do you support white labeling?", "Can agencies manage many clients?", "Does this integrate with PRwire?", "Is there a free trial?"].map((q) => (
              <details key={q} className="rounded-lg border border-charcoal/10 bg-white p-4"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-sm text-slate-600">Yes — this platform is designed for modern AI and traditional search authority growth.</p></details>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-charcoal/10 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-600 sm:px-6">
          <p>InstantAuthority.ai — Build trust at scale.</p>
          <div className="flex gap-4"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">Blog</a><a href="#">Privacy</a><a href="#">Terms</a></div>
          <span className="rounded-full bg-cyan/20 px-2 py-1 text-xs font-semibold text-electric">Powered by Claude AI</span>
        </div>
      </footer>
    </div>
  );
}
