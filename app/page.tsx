"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Globe2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ModalShell, ScoreBar } from "@/app/_components/landing/ui";
import type { AnalysisResult, CalendarItem, CalendarStatus, FeatureKey, PortalSummary } from "@/app/_components/landing/types";

const STORAGE_KEYS = {
  calendar: "ia_calendar_items_v2",
  portals: "ia_portal_links_v2",
  library: "ia_release_library_v2",
  dismissDemoBanner: "ia_demo_banner_dismissed",
};

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  goal: z.string().min(8),
});

const demoSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  timing: z.string().min(2),
});

type LeadFormValues = z.infer<typeof leadSchema>;
type DemoFormValues = z.infer<typeof demoSchema>;

const statusStyles: Record<CalendarStatus, string> = {
  Draft: "bg-slate-100 text-slate-700",
  "In Review": "bg-amber-100 text-amber-700",
  Submitted: "bg-cyan/20 text-electric",
  Published: "bg-emerald-100 text-emerald-700",
};

function randomId() {
  return Math.random().toString(36).slice(2, 12);
}

function fakeRelease(args: {
  headline: string;
  client: string;
  tone: string;
  keywords: string[];
  targetLength: 400 | 600 | 900;
}) {
  const mainHeadline = args.headline || `${args.client} Unveils AI Authority Growth Framework`;
  const keywords = args.keywords.length ? args.keywords : ["AI visibility", "authority", "SEO"];
  const lengthParagraphs = args.targetLength === 900 ? 7 : args.targetLength === 600 ? 6 : 5;
  const intro = [
    "FOR IMMEDIATE RELEASE",
    "",
    `${mainHeadline}: ${keywords[0]} strategy drives measurable momentum`,
    `${args.client} launches a GEO-optimized communications system built for search and answer engines`,
    "",
    `[Austin, TX] - ${args.client} today announced a new authority acceleration program designed to increase discoverability in both traditional search and AI-generated answer experiences.`,
  ];
  const body = Array.from({ length: lengthParagraphs }).map((_, idx) => {
    const seeds = [
      `${args.client} now aligns editorial planning with ${keywords.join(", ")} to ensure every release is structured for fast extraction, citation, and user trust.`,
      `The company reported a 24% lift in branded visibility after implementing citation-ready publishing patterns and factual key-points inside each announcement.`,
      `"We built this to make authority measurable and repeatable, not guesswork," said ${args.client}'s leadership team in a ${args.tone.toLowerCase()} briefing this week.`,
      `The framework combines entity clarity, local relevance, and executive-level proof points so buyers and AI systems can understand who ${args.client} is and why it matters.`,
      `By mapping each release to high-intent questions, ${args.client} is increasing discoverability for categories where trust, specificity, and speed are decisive.`,
      `The roadmap includes weekly optimization cycles, competitive gap tracking, and tighter narrative control to reinforce category leadership quarter over quarter.`,
      `Industry observers note that brands winning AI visibility are those with structured facts, consistent language, and concise answer-ready paragraphs.`,
    ];
    return seeds[idx] ?? seeds[seeds.length - 1];
  });
  const outro = [
    "",
    "KEY FACTS:",
    "• 24% improvement in branded visibility over 30 days",
    "• 3 campaign tracks launched for high-intent segments",
    "• 11 structured answer blocks added to core assets",
    "• 9 internal authority pages optimized for citations",
    "• 1 unified dashboard for SEO + GEO execution",
    "",
    `ABOUT ${args.client.toUpperCase()}:`,
    `${args.client} helps growth-focused teams build measurable authority through modern SEO, GEO, and editorial systems.`,
    "",
    "MEDIA CONTACT:",
    `${args.client} Communications`,
    "press@instantauthority.ai",
    "###",
  ];
  return [...intro, ...body, ...outro].join("\n\n");
}

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [dismissDemoBanner, setDismissDemoBanner] = useState(false);

  const [analyzerUrl, setAnalyzerUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authorityHeadline, setAuthorityHeadline] = useState("");
  const [authorityClient, setAuthorityClient] = useState("Apex Growth Partners");
  const [authorityTone, setAuthorityTone] = useState("Authoritative");
  const [authorityLength, setAuthorityLength] = useState<400 | 600 | 900>(600);
  const [authorityKeywordInput, setAuthorityKeywordInput] = useState("");
  const [authorityKeywords, setAuthorityKeywords] = useState<string[]>([]);
  const [authorityText, setAuthorityText] = useState("");
  const [authoritySeoScore, setAuthoritySeoScore] = useState<number | null>(null);
  const [authorityGeoScore, setAuthorityGeoScore] = useState<number | null>(null);
  const [releaseLibrary, setReleaseLibrary] = useState<Array<{ id: string; headline: string; content: string }>>([]);
  const [editingRelease, setEditingRelease] = useState(false);

  const [geoInput, setGeoInput] = useState("");
  const [geoTarget, setGeoTarget] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoOptimized, setGeoOptimized] = useState("");
  const [geoMetrics, setGeoMetrics] = useState<{ entity: number; fact: number; citation: number; readiness: number } | null>(null);
  const [geoApplied, setGeoApplied] = useState(false);

  const [reportClient, setReportClient] = useState("Apex Growth Partners");
  const [reportColor, setReportColor] = useState("#00D4FF");
  const [reportLogo, setReportLogo] = useState<string | null>(null);
  const [reportTemplate, setReportTemplate] = useState<"Executive" | "Detailed" | "Investor">("Executive");
  const [reportReady, setReportReady] = useState(false);
  const [emailingReport, setEmailingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [portalName, setPortalName] = useState("Apex Growth Partners");
  const [portalEmail, setPortalEmail] = useState("team@apexgrowth.com");
  const [portalLink, setPortalLink] = useState("");
  const [portalAuthority, setPortalAuthority] = useState(84);
  const [portalReleases, setPortalReleases] = useState(12);
  const [portalHistory, setPortalHistory] = useState<PortalSummary[]>([]);
  const [portalFeed, setPortalFeed] = useState<string[]>([
    "Release published for Q2 market expansion",
    "Authority score moved from 81 to 84",
  ]);
  const [portalPreviewOpen, setPortalPreviewOpen] = useState(false);

  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarClient, setCalendarClient] = useState("Apex Growth Partners");
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().slice(0, 10));
  const [calendarType, setCalendarType] = useState("Press Release");
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", company: "", goal: "" },
  });
  const demoForm = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { name: "", email: "", company: "", timing: "" },
  });

  useEffect(() => {
    try {
      const storedCalendar = localStorage.getItem(STORAGE_KEYS.calendar);
      const storedPortals = localStorage.getItem(STORAGE_KEYS.portals);
      const storedLibrary = localStorage.getItem(STORAGE_KEYS.library);
      const storedBanner = localStorage.getItem(STORAGE_KEYS.dismissDemoBanner);
      if (storedCalendar) setCalendarItems(JSON.parse(storedCalendar) as CalendarItem[]);
      if (storedPortals) setPortalHistory(JSON.parse(storedPortals) as PortalSummary[]);
      if (storedLibrary) setReleaseLibrary(JSON.parse(storedLibrary) as Array<{ id: string; headline: string; content: string }>);
      if (storedBanner === "1") setDismissDemoBanner(true);
    } catch {
      toast.error("Could not restore cached demo data.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.calendar, JSON.stringify(calendarItems));
  }, [calendarItems]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.portals, JSON.stringify(portalHistory));
  }, [portalHistory]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(releaseLibrary));
  }, [releaseLibrary]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.dismissDemoBanner, dismissDemoBanner ? "1" : "0");
  }, [dismissDemoBanner]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveFeature(null);
        setLeadOpen(false);
        setDemoOpen(false);
        setWeeklyOpen(false);
        setEditingRelease(false);
        setPortalPreviewOpen(false);
        setQuickSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const scheduledItems = useMemo(() => calendarItems.filter((x) => x.scheduled), [calendarItems]);
  const unscheduledItems = useMemo(() => calendarItems.filter((x) => !x.scheduled), [calendarItems]);
  const weekStats = useMemo(() => {
    const published = calendarItems.filter((x) => x.status === "Published").length;
    const submitted = calendarItems.filter((x) => x.status === "Submitted").length;
    return {
      total: calendarItems.length,
      published,
      submitted,
      capacity: Math.max(0, 20 - calendarItems.length),
    };
  }, [calendarItems]);

  const portalTrend = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        week: `W${i + 1}`,
        authority: Math.max(55, portalAuthority - 12 + i * 2),
      })),
    [portalAuthority],
  );

  const calendarGrid = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const dates: Date[] = [];
    let current = gridStart;
    while (current <= gridEnd) {
      dates.push(current);
      current = addDays(current, 1);
    }
    return dates;
  }, []);

  async function runFakeAnalysis() {
    if (!analyzerUrl.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    setCompetitorAnalysis(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const hostSeed = analyzerUrl.length;
    const seo = Math.min(96, 72 + (hostSeed % 18));
    const geo = Math.min(95, 65 + (hostSeed % 24));
    const aiVisibility = Math.min(96, 68 + (hostSeed % 21));
    const authority = Math.round((seo + geo + aiVisibility) / 3);
    setAnalysis({
      seo,
      geo,
      authority,
      aiVisibility,
      topIssues: [
        "Add FAQ blocks with direct question-answer structure.",
        "Increase factual statements with dates and percentages.",
        "Strengthen internal links to core service pages.",
        "Add Organization + LocalBusiness schema markup.",
        "Publish citation-ready executive summaries in each release.",
      ],
      breakdown: [
        { label: "On-page SEO", score: Math.max(55, seo - 12) },
        { label: "Entity Clarity", score: Math.max(58, geo - 9) },
        { label: "Fact Density", score: Math.max(52, geo - 5) },
        { label: "Citation Potential", score: Math.max(50, authority - 4) },
      ],
    });
    if (competitorUrl.trim()) {
      const cSeed = competitorUrl.length;
      const cSeo = Math.min(96, 70 + (cSeed % 16));
      const cGeo = Math.min(95, 63 + (cSeed % 20));
      const cAi = Math.min(95, 62 + (cSeed % 23));
      setCompetitorAnalysis({
        seo: cSeo,
        geo: cGeo,
        aiVisibility: cAi,
        authority: Math.round((cSeo + cGeo + cAi) / 3),
        topIssues: [],
        breakdown: [],
      });
    }
    setAnalyzing(false);
    toast.success("Analysis complete");
    if (authority >= 90) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  function addKeyword() {
    const value = authorityKeywordInput.trim();
    if (!value) return;
    if (!authorityKeywords.includes(value)) setAuthorityKeywords((prev) => [...prev, value]);
    setAuthorityKeywordInput("");
  }

  async function generateRelease() {
    setAuthorityLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1300));
    const text = fakeRelease({
      headline: authorityHeadline,
      client: authorityClient,
      tone: authorityTone,
      keywords: authorityKeywords,
      targetLength: authorityLength,
    });
    const seed = text.length;
    setAuthorityText(text);
    setAuthoritySeoScore(78 + (seed % 16));
    setAuthorityGeoScore(74 + (seed % 18));
    setAuthorityLoading(false);
    toast.success("Press release generated");
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.65 } });
  }

  function addReleaseToCalendar() {
    const item: CalendarItem = {
      id: randomId(),
      title: authorityHeadline || "AI Authority Press Release",
      client: authorityClient,
      date: calendarDate,
      type: "Press Release",
      status: "Draft",
      scheduled: false,
    };
    setCalendarItems((prev) => [item, ...prev]);
    toast.success("Added to Authority Calendar");
  }

  function saveReleaseToLibrary() {
    if (!authorityText.trim()) return;
    setReleaseLibrary((prev) => [{ id: randomId(), headline: authorityHeadline || "Untitled", content: authorityText }, ...prev]);
    toast.success("Saved to release library");
  }

  function shareRelease() {
    if (!authorityText.trim()) return;
    navigator.clipboard.writeText(authorityText);
    toast.success("Release copied for sharing");
  }

  async function optimizeGeo() {
    if (!geoInput.trim()) return;
    setGeoLoading(true);
    setGeoApplied(false);
    await new Promise((resolve) => setTimeout(resolve, 1250));
    const optimized = `${geoInput.trim()}\n\nOptimized GEO Version:\nThis version explicitly defines the entity, adds quantifiable facts, and answers target question: ${geoTarget || "Who is the best provider in this category?"}.`;
    setGeoOptimized(optimized);
    setGeoMetrics({ entity: 87, fact: 92, citation: 78, readiness: 84 });
    setGeoLoading(false);
    toast.success("Optimization complete");
  }

  function applyOptimizations() {
    if (!geoOptimized) return;
    setGeoInput(geoOptimized);
    setGeoApplied(true);
    toast.success("Optimizations applied");
  }

  function onLogoUpload(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReportLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function downloadReportPdf() {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "PNG", 10, 10, width, Math.min(height, 277));
    pdf.save(`instantauthority-report-${reportClient.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("PDF downloaded");
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.7 } });
  }

  async function emailReportSimulation() {
    setEmailingReport(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEmailingReport(false);
    toast.success("Report emailed to client (simulation)");
  }

  function createPortal() {
    const token = randomId() + randomId().slice(0, 2);
    const link = `https://portal.instantauthority.ai/c/${token}`;
    setPortalLink(link);
    setPortalHistory((prev) => [{ link, client: portalName, email: portalEmail, createdAt: new Date().toISOString() }, ...prev.slice(0, 6)]);
    toast.success("Private portal link generated");
  }

  function simulateReleasePublished() {
    setPortalAuthority((s) => Math.min(99, s + 2));
    setPortalReleases((s) => s + 1);
    setPortalFeed((prev) => [`Release published at ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 7)]);
    toast.success("New published release simulated");
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  }

  function addCalendarItem() {
    if (!calendarTitle.trim()) return;
    const item: CalendarItem = {
      id: randomId(),
      title: calendarTitle,
      client: calendarClient,
      date: calendarDate,
      type: calendarType,
      status: "Draft",
      scheduled: true,
    };
    setCalendarItems((prev) => [item, ...prev]);
    setCalendarTitle("");
    toast.success("Release added to calendar");
  }

  function bulkSchedule() {
    const firstDate = format(new Date(), "yyyy-MM-dd");
    setCalendarItems((prev) =>
      prev.map((item, idx) =>
        item.scheduled
          ? item
          : {
              ...item,
              scheduled: true,
              date: format(addDays(new Date(firstDate), idx), "yyyy-MM-dd"),
            },
      ),
    );
    toast.success("Bulk schedule applied");
  }

  function exportGoogleCalendarMock() {
    toast.success("Google Calendar export prepared (mock)");
  }

  function updateStatus(id: string, next: CalendarStatus) {
    setCalendarItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: next } : item)));
  }

  function onDropDate(date: string) {
    if (!draggingId) return;
    setCalendarItems((prev) =>
      prev.map((item) => (item.id === draggingId ? { ...item, date, scheduled: true } : item)),
    );
    setDraggingId(null);
  }

  function submitLead(values: LeadFormValues) {
    toast.success(`Welcome ${values.name}, demo account created`);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    setLeadOpen(false);
  }

  function submitDemo(values: DemoFormValues) {
    toast.success(`Thanks ${values.name}, we will contact you within 1 hour.`);
    setDemoOpen(false);
  }

  const quickLinks: Array<{ label: string; action: () => void }> = [
    { label: "Open Authority Engine", action: () => setActiveFeature("Authority Engine") },
    { label: "Open Website Analyzer", action: () => setActiveFeature("Website Analyzer") },
    { label: "Open GEO Optimizer", action: () => setActiveFeature("GEO Optimizer") },
    { label: "Open White Label Reports", action: () => setActiveFeature("White Label Reports") },
    { label: "Open Client Portal", action: () => setActiveFeature("Client Portal") },
    { label: "Open Authority Calendar", action: () => setActiveFeature("Authority Calendar") },
  ];

  return (
    <div className="bg-surface text-charcoal">
      <Toaster position="top-center" richColors />
      {!dismissDemoBanner ? (
        <div className="fixed bottom-3 right-3 z-40 rounded-full border border-cyan/30 bg-white/90 px-3 py-1 text-xs font-semibold text-electric shadow-sm">
          Demo Mode - Fully Interactive{" "}
          <button type="button" className="ml-2 text-slate-500" onClick={() => setDismissDemoBanner(true)}>
            ×
          </button>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="font-display text-xl font-semibold text-charcoal">
            InstantAuthority<span className="text-cyan">.ai</span>
          </p>
          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuickSearchOpen(true)}
              className="hidden rounded-lg border border-electric/20 px-3 py-2 text-xs md:inline-block"
            >
              Cmd+K
            </button>
            <Link href="/sign-in" className="text-sm font-medium text-charcoal">
              Sign In
            </Link>
            <button type="button" onClick={() => setLeadOpen(true)} className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main>
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-electric">
              Trusted by 500+ agencies and B2B teams
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-tight">
              Build Category Authority Faster.
              <br />
              <span className="text-cyan">Get Cited by AI Everywhere.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              The premium operating system for GEO + SEO authority: generate release-grade narratives, optimize for answer engines, and deliver branded proof to every client.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button type="button" onClick={() => setLeadOpen(true)} className="rounded-lg bg-cyan px-6 py-3 font-semibold text-charcoal">
                Start Building Authority →
              </button>
              <button type="button" onClick={() => setDemoOpen(true)} className="rounded-lg border border-charcoal/20 px-6 py-3 font-semibold text-charcoal">
                Book a Demo
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl border border-charcoal/10 bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold text-electric">Authority Dashboard Preview</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ["SEO", 88],
                ["GEO", 91],
                ["Authority", 94],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-surface p-3 text-center">
                  <p className="text-xs">{label}</p>
                  <p className="text-2xl font-bold text-cyan">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-charcoal p-4 text-sm text-white">AI visibility trend + campaign velocity</div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-y border-charcoal/10 bg-white py-8 text-center"
        >
          <p className="text-sm text-slate-600">Trusted by growth teams at leading agencies and B2B brands</p>
          <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span>Northstar Agency</span><span>GrowthForge</span><span>LegalOps Media</span><span>SaaSScale</span><span>Vertex Partners</span>
          </div>
        </motion.section>

        <motion.section id="features" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
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
              <button
                key={label}
                type="button"
                onClick={() => setActiveFeature(label as FeatureKey)}
                className="rounded-xl border border-charcoal/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-cyan" />
                <h3 className="mt-3 font-display text-xl">{label}</h3>
                <p className="mt-2 text-sm text-slate-600">Interactive module with AI simulation, live metrics, and conversion-ready workflows.</p>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section id="how" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl">How It Works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                ["1", "Analyze", "Run SEO + GEO scans and identify high-impact gaps."],
                ["2", "Generate", "Create authority-grade press releases in minutes."],
                ["3", "Optimize", "Apply AI visibility upgrades with clear recommendations."],
                ["4", "Prove ROI", "Deliver branded reports and live client dashboards."],
              ].map(([n, title, body]) => (
                <div key={title} className="rounded-xl border border-charcoal/10 bg-surface p-5">
                  <p className="text-cyan">{n}</p>
                  <h3 className="font-display text-xl">{title}</h3>
                  <p className="text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Starter", "$297/mo", ["1 client", "8 releases/mo", "Analyzer", "Basic reports"]],
              ["Professional", "$697/mo", ["5 clients", "20 releases/mo", "White label reports", "Client portals"]],
              ["Agency", "$1,497/mo", ["Unlimited clients", "Unlimited releases", "Full white label", "Priority support"]],
            ].map(([name, price, features]) => (
              <div key={String(name)} className={`rounded-xl border p-6 ${name === "Professional" ? "border-cyan bg-charcoal text-white" : "border-charcoal/10 bg-white"}`}>
                {name === "Professional" ? <p className="mb-2 inline-block rounded-full bg-cyan px-2 py-0.5 text-xs font-semibold text-charcoal">MOST POPULAR</p> : null}
                <h3 className="font-display text-2xl">{name}</h3>
                <p className="mt-2 text-3xl font-bold text-cyan">{price}</p>
                <ul className="mt-4 space-y-2 text-sm">{(features as string[]).map((f) => <li key={f}>• {f}</li>)}</ul>
                <button type="button" onClick={() => setLeadOpen(true)} className="mt-5 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Start Free Trial</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <h2 className="font-display text-3xl">Testimonials</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "“We closed two enterprise clients after showing the branded authority reports.” — JH, Apex Legal",
              "“Our GEO visibility improved in under 3 weeks. This is now our core workflow.” — KM, SaaS Foundry",
              "“The client portal cut reporting calls by 60%.” — RT, Growthcraft",
            ].map((quote) => (
              <div key={quote} className="rounded-xl border border-charcoal/10 bg-white p-5">
                <p className="text-sm text-slate-600">{quote}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-3xl">FAQ</h2>
          <div className="mt-6 space-y-3">
            {["What is GEO?", "How fast are results?", "Do you support white labeling?", "Can agencies manage many clients?", "Does this integrate with PRwire?", "Is there a free trial?"].map((q) => (
              <details key={q} className="rounded-lg border border-charcoal/10 bg-white p-4">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-2 text-sm text-slate-600">Yes - InstantAuthority is designed for modern AI + traditional search authority growth.</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-charcoal/10 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-600 sm:px-6">
          <p>InstantAuthority.ai - Build trust at scale.</p>
          <div className="flex gap-4">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="/sign-in">Sign In</a>
            <a href="/sign-up">Get Started</a>
          </div>
          <span className="rounded-full bg-cyan/20 px-2 py-1 text-xs font-semibold text-electric">Powered by Claude AI</span>
        </div>
      </footer>

      <ModalShell open={activeFeature !== null} title={activeFeature ?? ""} onClose={() => setActiveFeature(null)}>
        {activeFeature === "Website Analyzer" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Analyze your domain and competitor domain for authority and AI visibility potential.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="https://your-site.com" value={analyzerUrl} onChange={(e) => setAnalyzerUrl(e.target.value)} />
              <input className="rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Competitor URL (optional)" value={competitorUrl} onChange={(e) => setCompetitorUrl(e.target.value)} />
            </div>
            <button type="button" onClick={() => void runFakeAnalysis()} disabled={analyzing || !analyzerUrl.trim()} className="rounded-xl bg-cyan px-5 py-3 text-sm font-semibold text-charcoal disabled:opacity-60">
              {analyzing ? "AI is working..." : "Analyze"}
            </button>
            {analysis ? (
              <div className="space-y-4 rounded-xl border border-electric/10 bg-surface p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["SEO", analysis.seo],
                    ["GEO", analysis.geo],
                    ["Authority", analysis.authority],
                    ["AI Visibility", analysis.aiVisibility],
                  ].map(([label, score]) => (
                    <div key={String(label)} className="rounded-lg bg-white p-3 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="font-display text-2xl text-electric">{score}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {analysis.breakdown.map((row) => (
                    <ScoreBar key={row.label} label={row.label} score={row.score} />
                  ))}
                </div>
                <div className="rounded-xl border border-electric/10 bg-white p-3">
                  <p className="mb-2 font-semibold text-sm">Radar-style breakdown</p>
                  <svg viewBox="0 0 260 200" className="h-44 w-full">
                    <polygon points="130,20 220,70 200,160 60,160 40,70" fill="rgba(0,212,255,0.08)" stroke="#0F3460" />
                    <polygon
                      points={`${130},${200 - analysis.seo * 1.4} ${130 + analysis.geo * 0.9},${90} ${130 + analysis.aiVisibility * 0.7},${120 + (100 - analysis.authority) * 0.3} ${130 - analysis.authority * 0.7},${120 + (100 - analysis.aiVisibility) * 0.2} ${130 - analysis.geo * 0.9},${90}`}
                      fill="rgba(0,212,255,0.35)"
                      stroke="#00D4FF"
                    />
                  </svg>
                </div>
                {competitorAnalysis ? (
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div className="rounded-lg bg-white p-3">Your Authority: <span className="font-semibold">{analysis.authority}</span></div>
                    <div className="rounded-lg bg-white p-3">Competitor Authority: <span className="font-semibold">{competitorAnalysis.authority}</span></div>
                  </div>
                ) : null}
                <ul className="space-y-1 text-sm text-slate-700">
                  {analysis.topIssues.map((issue) => (
                    <li key={issue}>• {issue}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => { setActiveFeature("White Label Reports"); setReportReady(true); }} className="inline-flex items-center gap-2 rounded-lg border border-electric/20 bg-white px-4 py-2 text-sm font-semibold text-charcoal">
                  <Download className="h-4 w-4" />
                  Export as White Label Report
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeFeature === "Authority Engine" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <input className="w-full rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Topic / Headline" value={authorityHeadline} onChange={(e) => setAuthorityHeadline(e.target.value)} />
              <input className="w-full rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Client / Brand" value={authorityClient} onChange={(e) => setAuthorityClient(e.target.value)} />
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-electric/20 px-3 py-2 text-sm"
                  placeholder="Target keyword and press Enter"
                  value={authorityKeywordInput}
                  onChange={(e) => setAuthorityKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <button type="button" onClick={addKeyword} className="rounded-xl border border-electric/20 px-3 py-2 text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {authorityKeywords.map((kw) => (
                  <button key={kw} type="button" onClick={() => setAuthorityKeywords((prev) => prev.filter((k) => k !== kw))} className="rounded-full bg-cyan/15 px-2.5 py-1 text-xs text-electric">
                    {kw} ×
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Professional", "Engaging", "Authoritative", "Conversational"].map((tone) => (
                  <button key={tone} type="button" onClick={() => setAuthorityTone(tone)} className={`rounded-full px-3 py-1 text-xs ${authorityTone === tone ? "bg-charcoal text-white" : "border border-electric/20"}`}>
                    {tone}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {[400, 600, 900].map((len) => (
                  <button key={len} type="button" onClick={() => setAuthorityLength(len as 400 | 600 | 900)} className={`rounded-full px-3 py-1 text-xs ${authorityLength === len ? "bg-cyan text-charcoal" : "border border-electric/20"}`}>
                    {len} words
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => void generateRelease()} disabled={authorityLoading} className="inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-charcoal disabled:opacity-60">
                <Wand2 className="h-4 w-4" />
                {authorityLoading ? "AI is working..." : "Generate Press Release"}
              </button>
              {authoritySeoScore !== null && authorityGeoScore !== null ? (
                <div className="space-y-2">
                  <ScoreBar label="SEO Score" score={authoritySeoScore} />
                  <ScoreBar label="GEO Score" score={authorityGeoScore} color="bg-electric" />
                </div>
              ) : null}
            </div>
            <div className="space-y-3">
              <div className="min-h-64 whitespace-pre-wrap rounded-xl border border-electric/20 bg-surface p-3 text-sm">
                {authorityText || "Generated release preview appears here."}
              </div>
              {authorityText ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => navigator.clipboard.writeText(authorityText)} className="inline-flex items-center gap-1 rounded border border-electric/20 px-2 py-1 text-xs"><Copy className="h-3 w-3" />Copy</button>
                  <button type="button" onClick={() => void generateRelease()} className="rounded border border-electric/20 px-2 py-1 text-xs">Regenerate</button>
                  <button type="button" onClick={() => setEditingRelease(true)} className="rounded border border-electric/20 px-2 py-1 text-xs">Edit</button>
                  <button type="button" onClick={addReleaseToCalendar} className="inline-flex items-center gap-1 rounded bg-charcoal px-2 py-1 text-xs text-white"><Plus className="h-3 w-3" />Add to Calendar</button>
                  <button type="button" onClick={saveReleaseToLibrary} className="rounded border border-electric/20 px-2 py-1 text-xs">Save to Library</button>
                  <button type="button" onClick={shareRelease} className="rounded border border-electric/20 px-2 py-1 text-xs">Share</button>
                </div>
              ) : null}
              {releaseLibrary.length ? (
                <div className="rounded-xl border border-electric/20 bg-surface p-3 text-xs">
                  <p className="mb-1 font-semibold">Library ({releaseLibrary.length})</p>
                  <ul className="space-y-1">
                    {releaseLibrary.slice(0, 3).map((item) => <li key={item.id}>• {item.headline}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {activeFeature === "GEO Optimizer" ? (
          <div className="space-y-3">
            <textarea className="w-full rounded-xl border border-electric/20 px-3 py-2 text-sm" rows={5} placeholder="Paste content or URL-derived text..." value={geoInput} onChange={(e) => setGeoInput(e.target.value)} />
            <input className="w-full rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Target keywords/questions" value={geoTarget} onChange={(e) => setGeoTarget(e.target.value)} />
            <button type="button" onClick={() => void optimizeGeo()} disabled={geoLoading} className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-60">
              {geoLoading ? "AI is working..." : "Optimize for AI Engines"}
            </button>
            {geoMetrics ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                  <div className="rounded-lg bg-surface p-2">Entity Clarity: <span className="font-semibold">{geoMetrics.entity}/100</span></div>
                  <div className="rounded-lg bg-surface p-2">Fact Density: <span className="font-semibold">{geoMetrics.fact}/100</span></div>
                  <div className="rounded-lg bg-surface p-2">Citation Potential: <span className="font-semibold">{geoMetrics.citation}/100</span></div>
                  <div className="rounded-lg bg-surface p-2">AI Readiness: <span className="font-semibold">{geoMetrics.readiness}/100</span></div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
                  Before/After AI Visibility Score: 61 → {geoMetrics.readiness}
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-electric/20 p-3 text-sm">
                    <p className="mb-2 font-semibold">Original</p>
                    <p className="whitespace-pre-wrap">{geoInput}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
                    <p className="mb-2 font-semibold">Optimized</p>
                    <p className="whitespace-pre-wrap">{geoOptimized}</p>
                  </div>
                </div>
                <ul className="grid gap-2 text-sm sm:grid-cols-2">
                  {[
                    "Add 3 explicit entity names in opening section",
                    "Convert two sections to question-answer format",
                    "Add measurable stats with dates and sources",
                    "Use one definitive category statement",
                    "Include citation-friendly short paragraphs",
                    "Reference primary service and location twice",
                    "Strengthen factual claims with percentages",
                    "Add internal links to supporting pages",
                    "Replace vague adjectives with concrete outcomes",
                    "Mirror likely buyer questions in subheads",
                  ].map((rec) => (
                    <li key={rec} className="rounded-lg bg-surface px-3 py-2">• {rec}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button type="button" onClick={applyOptimizations} className="rounded-xl bg-charcoal px-4 py-2 text-sm font-semibold text-white">
                    Apply Optimizations
                  </button>
                  <button type="button" onClick={() => navigator.clipboard.writeText(geoOptimized)} className="rounded-xl border border-electric/20 px-4 py-2 text-sm">
                    Copy Optimized Version
                  </button>
                </div>
                {geoApplied ? <p className="text-xs text-emerald-700">Content updated with optimizations.</p> : null}
              </>
            ) : null}
          </div>
        ) : null}

        {activeFeature === "White Label Reports" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <input className="w-full rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Client Name" value={reportClient} onChange={(e) => setReportClient(e.target.value)} />
              <div className="flex items-center gap-2">
                <input type="color" value={reportColor} onChange={(e) => setReportColor(e.target.value)} className="h-10 w-16 rounded border border-electric/20" />
                <span className="text-sm text-slate-600">Brand Color</span>
              </div>
              <input type="file" accept="image/*" onChange={(e) => onLogoUpload(e.target.files?.[0] ?? null)} className="w-full text-sm" />
              <div className="flex gap-2">
                {(["Executive", "Detailed", "Investor"] as const).map((template) => (
                  <button key={template} type="button" onClick={() => setReportTemplate(template)} className={`rounded-full px-3 py-1 text-xs ${reportTemplate === template ? "bg-charcoal text-white" : "border border-electric/20"}`}>
                    {template}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setReportReady(true)} className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Generate Branded Report</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => void downloadReportPdf()} className="inline-flex items-center gap-2 rounded-xl border border-electric/20 px-4 py-2 text-sm"><Download className="h-4 w-4" />Download PDF</button>
                <button type="button" onClick={() => void emailReportSimulation()} className="rounded-xl border border-electric/20 px-4 py-2 text-sm">
                  {emailingReport ? "Sending..." : "Email Report to Client"}
                </button>
              </div>
            </div>
            <div ref={reportRef} className="rounded-xl border border-electric/20 bg-white p-4">
              <div className="rounded-lg p-3 text-white" style={{ backgroundColor: reportColor }}>
                <p className="text-xs uppercase">{reportTemplate} Template</p>
                <p className="font-display text-xl">{reportClient || "Client Name"}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Authority", analysis?.authority ?? 88],
                  ["SEO", analysis?.seo ?? 84],
                  ["GEO", analysis?.geo ?? 86],
                  ["AI Visibility", analysis?.aiVisibility ?? 82],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg bg-surface p-2">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-semibold">{String(value)}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full" style={{ width: `${Number(value)}%`, backgroundColor: reportColor }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm">
                <p className="font-semibold">Executive Summary</p>
                <p className="text-slate-600">{reportClient} is showing upward authority momentum with strong SEO foundations and growing AI citation opportunities.</p>
              </div>
              {reportLogo ? <img src={reportLogo} alt="Logo preview" className="mt-3 h-10 w-auto rounded" /> : null}
              {reportReady ? <p className="mt-2 text-xs text-emerald-700">Report ready for client delivery.</p> : null}
            </div>
          </div>
        ) : null}

        {activeFeature === "Client Portal" ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Client Name" value={portalName} onChange={(e) => setPortalName(e.target.value)} />
              <input className="rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Client Email" value={portalEmail} onChange={(e) => setPortalEmail(e.target.value)} />
            </div>
            <button type="button" onClick={createPortal} className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Create Private Portal</button>
            {portalLink ? (
              <div className="rounded-xl border border-electric/20 bg-surface p-3">
                <p className="text-xs text-slate-500">Private portal link</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="truncate text-sm">{portalLink}</p>
                  <button type="button" onClick={() => navigator.clipboard.writeText(portalLink)} className="rounded border border-electric/20 px-2 py-1 text-xs">Copy</button>
                  <button type="button" onClick={() => setPortalPreviewOpen(true)} className="rounded border border-electric/20 px-2 py-1 text-xs">Open Preview</button>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <QRCodeSVG value={portalLink} size={72} />
                  <div className="text-sm">
                    <p className="font-semibold">{portalName}</p>
                    <p className="text-slate-600">{portalEmail}</p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="rounded-xl border border-electric/20 p-3">
              <p className="font-semibold text-sm">Portal Preview</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded bg-surface p-2">Authority<br /><span className="font-semibold">{portalAuthority}</span></div>
                <div className="rounded bg-surface p-2">Releases<br /><span className="font-semibold">{portalReleases}</span></div>
                <div className="rounded bg-surface p-2">AI Visibility<br /><span className="font-semibold">{Math.min(99, portalAuthority - 3)}</span></div>
              </div>
              <button type="button" onClick={simulateReleasePublished} className="mt-2 rounded border border-electric/20 px-2 py-1 text-xs">Simulate New Release Published</button>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {portalFeed.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            {portalHistory.length ? (
              <div className="rounded-lg bg-surface p-2 text-xs text-slate-500">
                <p className="mb-1 font-semibold">Portals Created</p>
                {portalHistory.map((item) => (
                  <p key={item.link}>{item.client}: {item.link}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeFeature === "Authority Calendar" ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-5">
              <input className="rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Release title" value={calendarTitle} onChange={(e) => setCalendarTitle(e.target.value)} />
              <input className="rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Client" value={calendarClient} onChange={(e) => setCalendarClient(e.target.value)} />
              <input type="date" className="rounded-xl border border-electric/20 px-3 py-2 text-sm" value={calendarDate} onChange={(e) => setCalendarDate(e.target.value)} />
              <input className="rounded-xl border border-electric/20 px-3 py-2 text-sm" placeholder="Type" value={calendarType} onChange={(e) => setCalendarType(e.target.value)} />
              <button type="button" onClick={addCalendarItem} className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">Add New Release</button>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={bulkSchedule} className="rounded-xl border border-electric/20 px-4 py-2 text-sm">Bulk Schedule</button>
              <button type="button" onClick={exportGoogleCalendarMock} className="rounded-xl border border-electric/20 px-4 py-2 text-sm">Export to Google Calendar</button>
              <button type="button" onClick={() => setWeeklyOpen(true)} className="rounded-xl border border-electric/20 px-4 py-2 text-sm">Weekly Workload Snapshot</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-electric/20 p-3">
                <p className="mb-2 text-sm font-semibold">Unscheduled Releases</p>
                <div className="space-y-2">
                  {unscheduledItems.map((item) => (
                    <div key={item.id} draggable onDragStart={() => setDraggingId(item.id)} className="cursor-move rounded-lg bg-surface p-2 text-xs">
                      {item.title}
                    </div>
                  ))}
                  {unscheduledItems.length === 0 ? <p className="text-xs text-slate-500">No drafts waiting.</p> : null}
                </div>
              </div>
              <div className="lg:col-span-3 rounded-xl border border-electric/20 p-3">
                <p className="mb-2 text-sm font-semibold">Monthly Planning View</p>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {calendarGrid.map((dateObj) => {
                    const date = format(dateObj, "yyyy-MM-dd");
                    const isTodayCell = isSameDay(dateObj, new Date());
                    const weekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    return (
                      <div
                        key={date}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDropDate(date)}
                        className={`min-h-24 rounded-lg border p-1.5 ${weekend ? "bg-slate-50" : "bg-surface"} ${isTodayCell ? "border-cyan" : "border-electric/20"} ${isSameMonth(dateObj, new Date()) ? "" : "opacity-50"}`}
                      >
                        <p className="text-[10px] font-semibold">{format(dateObj, "d")}</p>
                        <div className="mt-1 space-y-1">
                          {scheduledItems.filter((item) => item.date === date).slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded bg-white p-1 text-[10px]">
                              <p className="truncate">{item.title}</p>
                              <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as CalendarStatus)} className={`mt-1 w-full rounded text-[10px] ${statusStyles[item.status]}`}>
                                <option>Draft</option>
                                <option>In Review</option>
                                <option>Submitted</option>
                                <option>Published</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>

      <ModalShell open={leadOpen} title="Start Your Free Trial" onClose={() => setLeadOpen(false)} maxWidth="max-w-lg">
        <form onSubmit={leadForm.handleSubmit(submitLead)} className="space-y-3">
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Name" {...leadForm.register("name")} />
          {leadForm.formState.errors.name ? <p className="text-xs text-red-600">Please enter your name.</p> : null}
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Email" type="email" {...leadForm.register("email")} />
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Company" {...leadForm.register("company")} />
          <textarea className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="What are you hoping to achieve?" rows={3} {...leadForm.register("goal")} />
          <button type="submit" className="w-full rounded-xl bg-cyan px-4 py-3 text-sm font-semibold text-charcoal">Create Demo Account</button>
        </form>
      </ModalShell>

      <ModalShell open={demoOpen} title="Book a Demo" onClose={() => setDemoOpen(false)} maxWidth="max-w-lg">
        <form onSubmit={demoForm.handleSubmit(submitDemo)} className="space-y-3">
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Name" {...demoForm.register("name")} />
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Work Email" type="email" {...demoForm.register("email")} />
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Company" {...demoForm.register("company")} />
          <input className="w-full rounded-xl border border-electric/20 px-4 py-3 text-sm" placeholder="Preferred timing" {...demoForm.register("timing")} />
          <button type="submit" className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white">Request Demo</button>
        </form>
      </ModalShell>

      <ModalShell open={quickSearchOpen} title="Quick Search" onClose={() => setQuickSearchOpen(false)} maxWidth="max-w-md">
        <div className="space-y-2">
          {quickLinks.map((item) => (
            <button key={item.label} type="button" className="w-full rounded-lg border border-electric/20 px-3 py-2 text-left text-sm hover:bg-surface" onClick={() => { item.action(); setQuickSearchOpen(false); }}>
              {item.label}
            </button>
          ))}
        </div>
      </ModalShell>

      <ModalShell open={editingRelease} title="Edit Generated Release" onClose={() => setEditingRelease(false)} maxWidth="max-w-2xl">
        <textarea className="h-80 w-full rounded-xl border border-electric/20 p-3 text-sm" value={authorityText} onChange={(e) => setAuthorityText(e.target.value)} />
        <div className="mt-3 flex gap-2">
          <button type="button" className="rounded bg-cyan px-3 py-2 text-sm font-semibold text-charcoal" onClick={() => setEditingRelease(false)}>Save</button>
          <button type="button" className="rounded border border-electric/20 px-3 py-2 text-sm" onClick={() => setEditingRelease(false)}>Cancel</button>
        </div>
      </ModalShell>

      <ModalShell open={weeklyOpen} title="Weekly Workload Snapshot" onClose={() => setWeeklyOpen(false)} maxWidth="max-w-xl">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface p-3">Releases Scheduled: <span className="font-semibold">{weekStats.total}</span></div>
          <div className="rounded-lg bg-surface p-3">Published This Week: <span className="font-semibold">{weekStats.published}</span></div>
          <div className="rounded-lg bg-surface p-3">Submitted: <span className="font-semibold">{weekStats.submitted}</span></div>
          <div className="rounded-lg bg-surface p-3">Team Capacity Left: <span className="font-semibold">{weekStats.capacity}</span></div>
        </div>
        <div className="mt-4 h-44 rounded-xl border border-electric/20 bg-white p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portalTrend}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="authority" stroke="#00D4FF" fill="rgba(0,212,255,0.28)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ModalShell>

      <ModalShell open={portalPreviewOpen} title="Client Portal Preview" onClose={() => setPortalPreviewOpen(false)} maxWidth="max-w-5xl">
        <div className="rounded-xl border border-electric/20 bg-surface p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-white p-3 text-xs">Authority<br /><span className="font-semibold text-xl">{portalAuthority}</span></div>
            <div className="rounded-lg bg-white p-3 text-xs">SEO<br /><span className="font-semibold text-xl">{Math.max(72, portalAuthority - 4)}</span></div>
            <div className="rounded-lg bg-white p-3 text-xs">GEO<br /><span className="font-semibold text-xl">{Math.max(70, portalAuthority - 2)}</span></div>
            <div className="rounded-lg bg-white p-3 text-xs">Releases<br /><span className="font-semibold text-xl">{portalReleases}</span></div>
          </div>
          <div className="mt-4 h-44 rounded-xl border border-electric/20 bg-white p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portalTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="authority" stroke="#00D4FF" fill="rgba(0,212,255,0.28)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
