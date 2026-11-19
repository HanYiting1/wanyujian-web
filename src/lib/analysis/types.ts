export type DocumentKind = "txt" | "docx" | "pdf";

export type RiskLevel = "high" | "medium" | "low";

export type MarketCode = string;

export interface MarketOption {
  code: MarketCode;
  name: string;
  englishName: string;
  status: "available" | "coming-soon";
  knowledgeSupported: boolean;
  dimensions: readonly string[];
}

export interface SelectedDocument {
  file: File;
  kind: DocumentKind;
}

export interface ParseApiSuccess {
  filename: string;
  text: string;
  charCount: number;
  warnings: string[];
}

export interface ParseApiError {
  error: string;
  code: string;
}

export type EvidenceStatus = "verified" | "unverified";

export type KnowledgeKind = "culture" | "advertising" | "fact";

export type KnowledgeReviewStatus = "pending" | "reviewed" | "unknown";

export interface RiskKnowledge {
  id: string;
  market: MarketCode;
  kind: KnowledgeKind;
  category: string;
  subcategory: string | null;
  riskLevel: RiskLevel | null;
  reviewStatus: KnowledgeReviewStatus;
  description: string;
  commonError: string | null;
  reviewNotes: string;
  sourceText: string | null;
  sourceUrl: string | null;
  timeSensitive: boolean;
}

export interface AnalysisRisk {
  quote: string;
  level: RiskLevel;
  category: string;
  reason: string;
  suggestion: string;
  evidenceStatus: EvidenceStatus;
  quoteVerified: boolean;
  ruleId: string | null;
  knowledge: RiskKnowledge | null;
}

export interface AnalyzeApiSuccess {
  summary: string;
  risks: AnalysisRisk[];
  rewrittenText: string;
  market: MarketCode;
  contentType: string;
  model: string;
  warnings: string[];
  analyzedAt: string;
}

export interface AnalyzeApiError {
  error: string;
  code: string;
}
