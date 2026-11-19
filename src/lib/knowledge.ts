import beKnowledge from "@/data/knowledge/be.json";
import chKnowledge from "@/data/knowledge/ch.json";
import deKnowledge from "@/data/knowledge/de.json";
import esKnowledge from "@/data/knowledge/es.json";
import euKnowledge from "@/data/knowledge/eu.json";
import frKnowledge from "@/data/knowledge/fr.json";
import idKnowledge from "@/data/knowledge/id.json";
import luKnowledge from "@/data/knowledge/lu.json";
import magKnowledge from "@/data/knowledge/mag.json";
import mcKnowledge from "@/data/knowledge/mc.json";
import myKnowledge from "@/data/knowledge/my.json";
import qcKnowledge from "@/data/knowledge/qc.json";
import sgKnowledge from "@/data/knowledge/sg.json";
import thKnowledge from "@/data/knowledge/th.json";
import vnKnowledge from "@/data/knowledge/vn.json";
import type {
  KnowledgeKind,
  KnowledgeReviewStatus,
  MarketCode,
  RiskKnowledge,
  RiskLevel,
} from "@/lib/analysis/types";

interface RawRule {
  id: string;
  market: string;
  kind: string;
  category: string;
  subcategory?: string;
  riskLevel: string;
  description?: string;
  triggerDescription?: string;
  triggers?: string[];
  sourceText?: string;
  sourceUrl?: string;
  reviewStatus?: string;
  reviewNotes?: string;
}

interface RawFact {
  id: string;
  market: string;
  kind: string;
  category: string;
  baselineClaim?: string;
  commonError?: string;
  sourceText?: string;
  sourceUrl?: string;
  reviewStatus?: string;
  reviewNotes?: string;
  timeSensitive?: boolean;
}

interface RawKnowledgeBase {
  rules: RawRule[];
  facts: RawFact[];
}

export interface KnowledgeItem {
  id: string;
  market: MarketCode;
  kind: KnowledgeKind;
  category: string;
  subcategory: string | null;
  riskLevel: RiskLevel | null;
  description: string;
  commonError: string | null;
  triggers: string[];
  reviewStatus: KnowledgeReviewStatus;
  reviewNotes: string;
  sourceText: string | null;
  sourceUrl: string | null;
  timeSensitive: boolean;
}

interface TriggerMatch {
  ruleId: string;
  trigger: string;
  start: number;
  end: number;
  context: string;
  negated: boolean;
  quoted: boolean;
}

export interface KnowledgeContext {
  market: MarketCode;
  hasKnowledge: boolean;
  promptText: string;
  suppressedRuleIds: ReadonlySet<string>;
  suppressedTriggers: ReadonlySet<string>;
}

const rawKnowledgeBases: RawKnowledgeBase[] = [
  beKnowledge as RawKnowledgeBase,
  chKnowledge as RawKnowledgeBase,
  deKnowledge as RawKnowledgeBase,
  esKnowledge as RawKnowledgeBase,
  euKnowledge as RawKnowledgeBase,
  frKnowledge as RawKnowledgeBase,
  idKnowledge as RawKnowledgeBase,
  luKnowledge as RawKnowledgeBase,
  magKnowledge as RawKnowledgeBase,
  mcKnowledge as RawKnowledgeBase,
  myKnowledge as RawKnowledgeBase,
  qcKnowledge as RawKnowledgeBase,
  sgKnowledge as RawKnowledgeBase,
  thKnowledge as RawKnowledgeBase,
  vnKnowledge as RawKnowledgeBase,
];

function normalizeKind(value: string): KnowledgeKind {
  if (value === "culture" || value === "advertising" || value === "fact") {
    return value;
  }

  throw new Error(`Unsupported knowledge kind: ${value}`);
}

function normalizeMarket(value: string): MarketCode {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2,4}$/.test(code)) {
    throw new Error(`Unsupported knowledge market: ${value}`);
  }
  return code;
}

function normalizeRiskLevel(value: string | undefined): RiskLevel | null {
  if (value === undefined || value.length === 0) {
    return null;
  }

  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  throw new Error(`Unsupported knowledge risk level: ${value}`);
}

function normalizeReviewStatus(
  value: string | undefined,
): KnowledgeReviewStatus {
  if (value === "pending" || value === "reviewed") {
    return value;
  }

  return "unknown";
}

function normalizeOptionalText(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeSourceUrl(value: string | undefined): string | null {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:"
      ? normalized
      : null;
  } catch {
    return null;
  }
}

function normalizeTriggers(triggers: string[] | undefined): string[] {
  if (!triggers) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const trigger of triggers) {
    const value = trigger.trim().toLowerCase();
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}

function buildItems(): KnowledgeItem[] {
  const ruleItems = rawKnowledgeBases.flatMap((raw) =>
    raw.rules.map((rule) => ({
      id: rule.id.trim().toUpperCase(),
      market: normalizeMarket(rule.market),
      kind: normalizeKind(rule.kind),
      category: rule.category.trim(),
      subcategory: normalizeOptionalText(rule.subcategory),
      riskLevel: normalizeRiskLevel(rule.riskLevel),
      description:
        normalizeOptionalText(rule.description) ??
        normalizeOptionalText(rule.triggerDescription) ??
        rule.category,
      commonError: null,
      triggers: normalizeTriggers(rule.triggers),
      reviewStatus: normalizeReviewStatus(rule.reviewStatus),
      reviewNotes: normalizeOptionalText(rule.reviewNotes) ?? "",
      sourceText: normalizeOptionalText(rule.sourceText),
      sourceUrl: normalizeSourceUrl(rule.sourceUrl),
      timeSensitive: false,
    })),
  );

  const factItems = rawKnowledgeBases.flatMap((raw) =>
    raw.facts.map((fact) => ({
      id: fact.id.trim().toUpperCase(),
      market: normalizeMarket(fact.market),
      kind: normalizeKind(fact.kind),
      category: fact.category.trim(),
      subcategory: null,
      riskLevel: null,
      description:
        normalizeOptionalText(fact.baselineClaim) ??
        normalizeOptionalText(fact.commonError) ??
        fact.category,
      commonError: normalizeOptionalText(fact.commonError),
      triggers: [],
      reviewStatus: normalizeReviewStatus(fact.reviewStatus),
      reviewNotes: normalizeOptionalText(fact.reviewNotes) ?? "",
      sourceText: normalizeOptionalText(fact.sourceText),
      sourceUrl: normalizeSourceUrl(fact.sourceUrl),
      timeSensitive: fact.timeSensitive === true,
    })),
  );

  return [...ruleItems, ...factItems];
}

const allItems = buildItems().filter(
  (item, index, items) =>
    items.findIndex(
      (other) => other.market === item.market && other.id === item.id,
    ) === index,
);
const itemById = new Map<string, KnowledgeItem>();
const itemByMarketId = new Map<string, KnowledgeItem>();

for (const item of allItems) {
  const marketKey = `${item.market}:${item.id}`;
  if (!itemByMarketId.has(marketKey)) {
    itemByMarketId.set(marketKey, item);
  }
  if (!itemById.has(item.id)) {
    itemById.set(item.id, item);
  }
}

function kindLabel(kind: KnowledgeKind): string {
  if (kind === "culture") {
    return "文化/社会语境";
  }
  if (kind === "advertising") {
    return "广告合规候选规则";
  }
  return "事实参考";
}

function compactText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}…`
    : normalized;
}

function detectQuoted(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 48), start);
  const after = text.slice(end, Math.min(text.length, end + 48));
  const quotePairs: ReadonlyArray<readonly [string, string]> = [
    ["“", "”"],
    ["„", "“"],
    ["「", "」"],
    ["『", "』"],
    ["‘", "’"],
    ['"', '"'],
  ];

  for (const [open, close] of quotePairs) {
    const openIndex = before.lastIndexOf(open);
    if (openIndex === -1) {
      continue;
    }

    const closeIndex = after.indexOf(close);
    if (closeIndex === -1) {
      continue;
    }

    const insideBefore = before.slice(openIndex + open.length);
    const insideAfter = after.slice(0, closeIndex);
    if (!/[。！？.!?\n]/.test(insideBefore + insideAfter)) {
      return true;
    }
  }

  return false;
}

const NEGATION_PATTERN =
  /不要|不得|禁止|避免|切勿|请勿|勿|不应|不能|不可|严禁|拒绝|反对|并非|不是|无需|\b(?:do not|don't|avoid|never|without|not)\b|\b(?:nicht|kein(?:e|en|er)?|vermeid(?:e|en)|nie|ohne)\b/i;

function detectNegated(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 32), start);
  const after = text.slice(end, Math.min(text.length, end + 24));
  return NEGATION_PATTERN.test(before) || NEGATION_PATTERN.test(after);
}

function findMatches(text: string, items: KnowledgeItem[]): TriggerMatch[] {
  const searchText = text.toLowerCase();
  const matches: TriggerMatch[] = [];

  for (const item of items) {
    for (const trigger of item.triggers) {
      let fromIndex = 0;

      while (fromIndex < searchText.length) {
        const start = searchText.indexOf(trigger, fromIndex);
        if (start === -1) {
          break;
        }

        const end = start + trigger.length;
        const contextStart = Math.max(0, start - 44);
        const contextEnd = Math.min(text.length, end + 44);
        matches.push({
          ruleId: item.id,
          trigger,
          start,
          end,
          context: compactText(text.slice(contextStart, contextEnd), 160),
          negated: detectNegated(text, start, end),
          quoted: detectQuoted(text, start, end),
        });

        fromIndex = start + Math.max(1, trigger.length);
      }
    }
  }

  return matches;
}

function dedupeMatches(matches: TriggerMatch[]): TriggerMatch[] {
  const byRule = new Map<string, TriggerMatch[]>();

  for (const match of matches) {
    const list = byRule.get(match.ruleId) ?? [];
    list.push(match);
    byRule.set(match.ruleId, list);
  }

  const result: TriggerMatch[] = [];

  for (const list of byRule.values()) {
    const sorted = [...list].sort(
      (first, second) =>
        first.start - second.start ||
        second.end - second.start - (first.end - first.start),
    );
    const kept: TriggerMatch[] = [];

    for (const candidate of sorted) {
      const overlaps = kept.some(
        (existing) =>
          candidate.start < existing.end && candidate.end > existing.start,
      );
      if (!overlaps) {
        kept.push(candidate);
      }
    }

    result.push(...kept);
  }

  return result.sort((first, second) => first.start - second.start);
}

function buildCatalogPrompt(items: KnowledgeItem[]): string {
  const lines = [
    "本地知识库目录（所有条目 reviewStatus=pending，仅作候选复核；不同 kind 不能混为法律禁令）：",
  ];

  for (const item of items) {
    if (item.kind === "fact") {
      lines.push(
        `[事实参考] ${item.id} | ${item.category} | 基准事实：${item.description} | 常见错误：${item.commonError ?? "未提供"} | 时效性：${item.timeSensitive ? "是" : "否"} | 审核状态：${item.reviewStatus}`,
      );
      continue;
    }

    lines.push(
      `[${kindLabel(item.kind)}] ${item.id} | ${item.category}${item.subcategory ? `/${item.subcategory}` : ""} | 风险等级：${item.riskLevel ?? "未标注"} | 说明：${item.description} | 审核状态：${item.reviewStatus} | 审核备注：${item.reviewNotes || "无"}`,
    );
  }

  return lines.join("\n");
}

function buildCandidatePrompt(
  matches: TriggerMatch[],
  suppressedRuleIds: ReadonlySet<string>,
): string {
  if (matches.length === 0) {
    return "关键词候选：无。仍可依据知识库目录进行语义复核与事实核对。";
  }

  const lines = [
    "关键词候选（仅为候选，不是违规结论；引用、否定、举例、假设语境不能直接判为风险）：",
  ];

  for (const match of matches.slice(0, 24)) {
    const flags = [
      match.negated ? "否定语境=是" : "否定语境=否",
      match.quoted ? "引用语境=是" : "引用语境=否",
    ];
    const suppressed = suppressedRuleIds.has(match.ruleId)
      ? " | 该规则的全部命中均处于否定/引用语境，不应据此判违规"
      : "";

    lines.push(
      `- ${match.ruleId} | 触发词「${match.trigger}」 | 上下文：「${match.context}」 | ${flags.join(" | ")}${suppressed}`,
    );
  }

  return lines.join("\n");
}

export function getKnowledgeItem(
  id: string,
  market?: MarketCode,
): KnowledgeItem | null {
  const normalizedId = id.trim().toUpperCase();
  if (market) {
    return (
      itemByMarketId.get(`${market.toUpperCase()}:${normalizedId}`) ?? null
    );
  }
  return itemById.get(normalizedId) ?? null;
}

export function toRiskKnowledge(item: KnowledgeItem): RiskKnowledge {
  return {
    id: item.id,
    market: item.market,
    kind: item.kind,
    category: item.category,
    subcategory: item.subcategory,
    riskLevel: item.riskLevel,
    reviewStatus: item.reviewStatus,
    description: item.description,
    commonError: item.commonError,
    reviewNotes: item.reviewNotes,
    sourceText: item.sourceText,
    sourceUrl: item.sourceUrl,
    timeSensitive: item.timeSensitive,
  };
}

export function buildKnowledgeContext(
  text: string,
  market: MarketCode,
): KnowledgeContext {
  const normalizedMarket = normalizeMarket(market);
  const items = allItems.filter(
    (item) => item.market === normalizedMarket,
  );

  if (items.length === 0) {
    return {
      market: normalizedMarket,
      hasKnowledge: false,
      promptText:
        "该目标市场暂无本地知识库。只能进行 DeepSeek AI 语义初筛；不得编造本地规则、法规条款、来源或 ruleId；不确定内容必须标注“待人工核验”。",
      suppressedRuleIds: new Set<string>(),
      suppressedTriggers: new Set<string>(),
    };
  }

  const matches = dedupeMatches(findMatches(text, items));
  const suppressedRuleIds = new Set<string>();
  const suppressedTriggers = new Set<string>();

  for (const item of items) {
    const ruleMatches = matches.filter((match) => match.ruleId === item.id);
    if (
      ruleMatches.length > 0 &&
      ruleMatches.every((match) => match.negated || match.quoted)
    ) {
      suppressedRuleIds.add(item.id);
      for (const match of ruleMatches) {
        suppressedTriggers.add(match.trigger.toLowerCase());
      }
    }
  }

  const promptText = [
    buildCatalogPrompt(items),
    "",
    buildCandidatePrompt(matches, suppressedRuleIds),
    "",
    "使用要求：规则命中只是候选线索；文化习俗和事实参考不是法律禁令；广告合规规则也必须结合上下文、证据与审核状态审慎表述。",
  ].join("\n");

  return {
    market: normalizedMarket,
    hasKnowledge: true,
    promptText,
    suppressedRuleIds,
    suppressedTriggers,
  };
}
