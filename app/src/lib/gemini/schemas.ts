export type EventCategory =
  | "funding"
  | "company"
  | "product"
  | "partnership"
  | "acquisition"
  | "regulatory"
  | "market"
  | "prestocks"
  | "other";

export interface ResearchEvent {
  title: string;
  summary: string;
  date?: string | null;
  category: EventCategory;
  sourceTitle: string;
  sourceUrl: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  domain: string;
}

export interface ScoutReport {
  symbol: string;
  companyName: string;
  overview: string;
  sector?: string;
  foundedYear?: number;
  headquarters?: string;
  businessModel?: string;
  notableFacts: string[];
  recentDevelopments: ResearchEvent[];
  sources: ResearchSource[];
  generatedAt: number;
}
