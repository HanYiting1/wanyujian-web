export const COMPETITOR_MARKET = "德国" as const;
export const COMPETITOR_INDUSTRY = "护肤品" as const;
export const DEFAULT_COMPETITOR_PRODUCT = "Feuchtigkeitscreme";export const MAX_COMPETITOR_SELECTION = 5;
export const MAX_COMPETITOR_SOURCES = 5;
export const MAX_SEARCH_RESULTS = 10;
export const MAX_SOURCE_SNIPPET_LENGTH = 1200;

export const COMPETITOR_SEARCH_API_PATH = "/api/competitors";
export const COMPETITOR_ANALYZE_API_PATH = "/api/competitors/analyze";

export const COMPETITOR_ANALYSIS_DISCLAIMER =
  "本分析仅基于本次所选网页的标题与摘要，由 AI 生成，属于营销观察而非事实核验或法律意见。网页中的宣传宣称不自动视为真实事实；竞品做法不自动视为合法合规；涉及法规、功效、认证或数据的主张请人工核验原始来源。";

export const COMPETITOR_ANALYSIS_SECTIONS = [
  { id: "sellingPoints", title: "竞品核心营销卖点" },
  { id: "languageStyle", title: "目标市场语言特点" },
  { id: "consumerBenefits", title: "目标消费者利益诉求" },
  { id: "evidenceUsage", title: "竞品宣传依据的使用方式" },
  { id: "transferableStrategies", title: "可以借鉴的营销策略" },
  { id: "communicationRisks", title: "需要注意的宣传风险" },
  { id: "differentiation", title: "中国品牌进入目标市场的差异化建议" },
] as const;

export const COMPETITOR_ANALYSIS_SECTION_IDS = [
  "sellingPoints",
  "languageStyle",
  "consumerBenefits",
  "evidenceUsage",
  "transferableStrategies",
  "communicationRisks",
  "differentiation",
] as const;

export type CompetitorAnalysisSectionId =
  (typeof COMPETITOR_ANALYSIS_SECTION_IDS)[number];

export interface CompetitorSearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  score: number | null;
}

export interface CompetitorAnalyzeSource {
  title: string;
  url: string;
  snippet: string;
  score?: number | null;
}

export interface CompetitorAnalysisEvidence {
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  domain: string;
  quote: string | null;
  quoteVerified: boolean;
}

export interface CompetitorAnalysisSection {
  id: CompetitorAnalysisSectionId;
  title: string;
  content: string;
  needsHumanReview: boolean;
  evidence: CompetitorAnalysisEvidence[];
}

export interface CompetitorAnalysis {
  product: string;
  market: string;
  industry: string;
  model: string;
  generatedAt: string;
  reviewRequired: true;
  sourceCount: number;
  disclaimer: string;
  sections: CompetitorAnalysisSection[];
}

export interface CompetitorAnalyzeApiSuccess {
  analysis: CompetitorAnalysis;
}

export interface CompetitorAnalyzeApiError {
  error: string;
  code: string;
}
