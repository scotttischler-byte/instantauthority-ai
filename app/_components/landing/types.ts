export type FeatureKey =
  | "Authority Engine"
  | "Website Analyzer"
  | "GEO Optimizer"
  | "White Label Reports"
  | "Client Portal"
  | "Authority Calendar";

export type CalendarStatus = "Draft" | "In Review" | "Submitted" | "Published";

export type CalendarItem = {
  id: string;
  title: string;
  client: string;
  date: string;
  type: string;
  status: CalendarStatus;
  scheduled: boolean;
};

export type AnalysisResult = {
  seo: number;
  geo: number;
  authority: number;
  aiVisibility: number;
  topIssues: string[];
  breakdown: Array<{ label: string; score: number }>;
};

export type PortalSummary = {
  link: string;
  client: string;
  email: string;
  createdAt: string;
};
