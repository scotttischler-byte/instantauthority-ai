export type AnalysisSection = {
  found: string[];
  missing: string[];
  recommendations: Array<{ text: string; priority: string }>;
};

export type AnalysisReport = {
  scores: {
    onPage: number;
    content: number;
    technical: number;
    authority: number;
    geo: number;
    total: number;
    seoTotal: number;
    geoTotal: number;
  };
  sections: {
    onPage: AnalysisSection;
    content: AnalysisSection;
    technical: AnalysisSection;
    authority: AnalysisSection;
    geo: AnalysisSection;
  };
  quickWins: string[];
  strategicWins: string[];
  executiveSummary: string;
  aiVisibilityAssessment: string;
};

export const emptyReport: AnalysisReport = {
  scores: { onPage: 0, content: 0, technical: 0, authority: 0, geo: 0, total: 0, seoTotal: 0, geoTotal: 0 },
  sections: {
    onPage: { found: [], missing: [], recommendations: [] },
    content: { found: [], missing: [], recommendations: [] },
    technical: { found: [], missing: [], recommendations: [] },
    authority: { found: [], missing: [], recommendations: [] },
    geo: { found: [], missing: [], recommendations: [] },
  },
  quickWins: [],
  strategicWins: [],
  executiveSummary: "",
  aiVisibilityAssessment: "",
};

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => asString(item)).filter(Boolean) : [];
}

function normalizeSection(value: unknown): AnalysisSection {
  const section = asObject(value);
  return {
    found: asStringArray(section.found),
    missing: asStringArray(section.missing),
    recommendations: Array.isArray(section.recommendations)
      ? section.recommendations.map((rec) => {
          if (typeof rec === "string") return { text: rec, priority: "Medium" };
          const record = asObject(rec);
          return { text: asString(record.text), priority: asString(record.priority) || "Medium" };
        })
      : [],
  };
}

// Normalizes arbitrary model output to the full AnalysisReport shape so the UI never
// crashes on missing/renamed fields. Falls back to zeroed defaults for anything absent.
function normalizeReport(raw: unknown): AnalysisReport {
  const report = asObject(raw);
  const scores = asObject(report.scores);
  const sections = asObject(report.sections);
  return {
    scores: {
      onPage: asNumber(scores.onPage),
      content: asNumber(scores.content),
      technical: asNumber(scores.technical),
      authority: asNumber(scores.authority),
      geo: asNumber(scores.geo),
      total: asNumber(scores.total),
      seoTotal: asNumber(scores.seoTotal),
      geoTotal: asNumber(scores.geoTotal),
    },
    sections: {
      onPage: normalizeSection(sections.onPage),
      content: normalizeSection(sections.content),
      technical: normalizeSection(sections.technical),
      authority: normalizeSection(sections.authority),
      geo: normalizeSection(sections.geo),
    },
    quickWins: asStringArray(report.quickWins),
    strategicWins: asStringArray(report.strategicWins),
    executiveSummary: asString(report.executiveSummary),
    aiVisibilityAssessment: asString(report.aiVisibilityAssessment),
  };
}

export function parseReport(jsonText: string): AnalysisReport {
  const tryParse = (value: string): unknown => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };
  const direct = tryParse(jsonText);
  if (direct) return normalizeReport(direct);
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const maybe = tryParse(jsonText.slice(start, end + 1));
    if (maybe) return normalizeReport(maybe);
  }
  return emptyReport;
}
