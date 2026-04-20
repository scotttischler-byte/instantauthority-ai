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

export function parseReport(jsonText: string): AnalysisReport {
  const tryParse = (value: string) => {
    try {
      return JSON.parse(value) as AnalysisReport;
    } catch {
      return null;
    }
  };
  const direct = tryParse(jsonText);
  if (direct) return direct;
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const maybe = tryParse(jsonText.slice(start, end + 1));
    if (maybe) return maybe;
  }
  return emptyReport;
}
