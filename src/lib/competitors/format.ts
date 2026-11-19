import type {
  CompetitorAnalysis,
  CompetitorAnalyzeSource,
  CompetitorSearchResult,
} from "@/lib/competitors/types";
import {
  MAX_SEARCH_RESULTS,
  MAX_SOURCE_SNIPPET_LENGTH,
} from "@/lib/competitors/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function getResultArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!isRecord(payload)) {
    return [];
  }

  const data = isRecord(payload.data) ? payload.data : null;
  const candidates: unknown[] = [
    payload.results,
    payload.items,
    payload.data,
    data?.results,
    data?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export function truncateText(value: string, maxLength = 280): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function formatScore(score: number | null): string | null {
  if (score === null || !Number.isFinite(score)) {
    return null;
  }
  if (score >= 0 && score <= 1) {
    return `${Math.round(score * 100)}%`;
  }
  return score.toFixed(1);
}

export function normalizeSearchResults(payload: unknown): CompetitorSearchResult[] {
  const rawResults = getResultArray(payload);
  const results: CompetitorSearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const rawResult of rawResults) {
    if (!isRecord(rawResult)) {
      continue;
    }

    const url = getString(rawResult, ["url", "link", "href"]);
    if (!url) {
      continue;
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        continue;
      }
    } catch {
      continue;
    }

    if (seenUrls.has(url)) {
      continue;
    }
    seenUrls.add(url);

    const domain = getDomain(url) || "未知来源";
    const title =
      getString(rawResult, ["title", "name", "headline"]) ||
      domain ||
      "未命名网页";
    const snippet = truncateText(
      getString(rawResult, [
        "snippet",
        "content",
        "description",
        "summary",
        "raw_content",
      ]),
      MAX_SOURCE_SNIPPET_LENGTH,
    );
    const numericScore =
      typeof rawResult.score === "number" && Number.isFinite(rawResult.score)
        ? rawResult.score
        : null;

    results.push({
      id: `result-${results.length + 1}`,
      title,
      url,
      domain,
      snippet,
      score: numericScore,
    });

    if (results.length >= MAX_SEARCH_RESULTS) {
      break;
    }
  }

  return results;
}

export function toAnalyzeSource(
  result: CompetitorSearchResult,
): CompetitorAnalyzeSource {
  const score =
    result.score !== null &&
    Number.isFinite(result.score) &&
    result.score >= 0 &&
    result.score <= 1
      ? result.score
      : undefined;

  return {
    title: result.title.slice(0, 300),
    url: result.url,
    snippet: result.snippet.slice(0, MAX_SOURCE_SNIPPET_LENGTH),
    ...(score === undefined ? {} : { score }),
  };
}

export function extractApiError(payload: unknown, fallback: string): string {
  if (isRecord(payload)) {
    const error = getString(payload, ["error", "message"]);
    if (error) {
      return truncateText(error, 260);
    }
  }
  return fallback;
}

export function parseAnalysisResponse(
  payload: unknown,
): CompetitorAnalysis | null {
  if (!isRecord(payload)) {
    return null;
  }

  const analysis = isRecord(payload.analysis) ? payload.analysis : payload;
  if (
    typeof analysis.product !== "string" ||
    !Array.isArray(analysis.sections) ||
    analysis.sections.length === 0
  ) {
    return null;
  }

  return analysis as unknown as CompetitorAnalysis;
}

export function formatGeneratedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "时间未知";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function buildAnalysisCopyText(analysis: CompetitorAnalysis): string {
  const lines: string[] = [
    "万语鉴 · 竞品营销雷达",
    `市场：${analysis.market} / 行业：${analysis.industry}`,
    `产品关键词：${analysis.product}`,
    `生成时间：${formatGeneratedAt(analysis.generatedAt)}`,
    `模型：${analysis.model}`,
    "",
  ];

  for (const section of analysis.sections) {
    lines.push(`${section.title}`);
    lines.push(section.content);
    if (section.evidence.length === 0) {
      lines.push("证据：本次未提供可核验来源，待人工核验。");
    } else {
      for (const evidence of section.evidence) {
        const quote = evidence.quoteVerified && evidence.quote
          ? ` | 引用：“${evidence.quote}”（已匹配来源摘要）`
          : " | 未提供可逐字匹配的引用，待人工核验";
        lines.push(
          `证据：${evidence.sourceId} ${evidence.sourceTitle} (${evidence.domain}) ${evidence.sourceUrl}${quote}`,
        );
      }
    }
    lines.push("");
  }

  lines.push("免责声明");
  lines.push(analysis.disclaimer);
  return lines.join("\n");
}
