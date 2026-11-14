"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  HardDrive,
  Info,
  Quote,
  ShieldCheck,
  Sparkles,
  TriangleExclamationPoint,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RealAnalysisState } from "@/hooks/use-real-analysis";
import type {
  AnalysisRisk,
  AnalyzeApiSuccess,
  KnowledgeKind,
  RiskKnowledge,
  RiskLevel,
  SelectedDocument,
} from "@/lib/analysis/types";
import { formatFileSize } from "@/lib/analysis/files";
import { cn } from "@/lib/utils";

interface RealReportPanelProps {
  state: RealAnalysisState;
  document: SelectedDocument | null;
  ready: boolean;
  sourceText: string | null;
  reportNumber: string;
  onRetry: () => void;
  onClear: () => void;
}

interface RiskMeta {
  label: string;
  badgeClassName: string;
  markClassName: string;
  countClassName: string;
}

interface CopyFeedback {
  key: string;
  status: "copied" | "error";
}

interface RiskEntry {
  risk: AnalysisRisk;
  index: number;
}

type RiskFilter = "all" | RiskLevel;
type DetailTab = "analysis" | "basis" | "suggestion";

const RISK_META: Record<RiskLevel, RiskMeta> = {
  high: {
    label: "高风险",
    badgeClassName: "border-risk-200 bg-risk-50 text-risk-700",
    markClassName: "bg-risk-100 text-risk-800",
    countClassName: "border-risk-100 bg-risk-50/70 text-risk-700",
  },
  medium: {
    label: "中风险",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    markClassName: "bg-amber-100 text-amber-900",
    countClassName: "border-amber-100 bg-amber-50/70 text-amber-700",
  },
  low: {
    label: "低风险",
    badgeClassName: "border-aqua-200 bg-aqua-50 text-aqua-700",
    markClassName: "bg-aqua-100 text-aqua-900",
    countClassName: "border-aqua-100 bg-aqua-50/70 text-aqua-700",
  },
};

const riskLevels: readonly RiskLevel[] = ["high", "medium", "low"];

const riskDescriptions: Record<RiskLevel, string> = {
  high: "可能引发文化冒犯或合规问题",
  medium: "存在语义歧义或表达不当",
  low: "建议优化以提升本地化效果",
};

function formatAnalyzedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function contentTypeLabel(contentType: string): string {
  if (contentType === "marketing") {
    return "广告文案";
  }
  if (contentType === "未填写") {
    return "内容";
  }
  return contentType;
}

function knowledgeKindLabel(kind: KnowledgeKind): string {
  if (kind === "culture") {
    return "文化习俗";
  }
  if (kind === "advertising") {
    return "广告合规";
  }
  return "事实参考";
}

function knowledgeKindClassName(kind: KnowledgeKind): string {
  if (kind === "fact") {
    return "border-deep-200 bg-deep-50 text-deep-600";
  }
  if (kind === "culture") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-aqua-200 bg-aqua-50 text-aqua-700";
}

function reviewStatusMeta(status: RiskKnowledge["reviewStatus"]) {
  if (status === "pending") {
    return {
      label: "知识库待审核",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (status === "reviewed") {
    return {
      label: "知识库已审核",
      className: "border-aqua-200 bg-aqua-50 text-aqua-700",
    };
  }
  return {
    label: "审核状态未知",
    className: "border-deep-200 bg-deep-50 text-deep-500",
  };
}

function KnowledgeReference({ knowledge }: { knowledge: RiskKnowledge }) {
  const review = reviewStatusMeta(knowledge.reviewStatus);

  return (
    <div className="rounded-xl border border-deep-100 bg-white/80 p-3.5 print:break-inside-avoid">
      <div className="flex flex-wrap items-center gap-1.5">
        <BookOpen aria-hidden="true" className="size-3.5 text-deep-400" />
        <span className="font-mono text-[10px] font-medium text-deep-700">
          {knowledge.id}
        </span>
        <Badge
          variant="outline"
          className={cn("text-[9px]", knowledgeKindClassName(knowledge.kind))}
        >
          {knowledgeKindLabel(knowledge.kind)}
        </Badge>
        <Badge variant="outline" className={cn("text-[9px]", review.className)}>
          {review.label}
        </Badge>
        {knowledge.timeSensitive && (
          <Badge
            variant="outline"
            className="border-risk-200 bg-risk-50 text-[9px] text-risk-700"
          >
            时效性事实
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-[11px] font-medium text-deep-700">
        {knowledge.category}
        {knowledge.subcategory ? ` / ${knowledge.subcategory}` : ""}
      </p>
      <p className="mt-1 text-[11px] leading-5 break-words text-deep-500">
        {knowledge.kind === "fact" ? "基准事实：" : "知识库说明："}
        {knowledge.description}
      </p>
      {knowledge.commonError && (
        <p className="mt-1 text-[11px] leading-5 break-words text-deep-500">
          常见错误：{knowledge.commonError}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
        {knowledge.sourceUrl ? (
          <>
            <a
              href={knowledge.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-aqua-700 underline decoration-aqua-300 underline-offset-2 hover:text-aqua-800"
            >
              <ExternalLink aria-hidden="true" className="size-3" />
              查看本地知识库来源
            </a>
            <span className="hidden break-all text-deep-400 print:inline">
              ({knowledge.sourceUrl})
            </span>
          </>
        ) : (
          <span className="text-deep-400">该知识库条目暂无来源链接</span>
        )}
      </div>
    </div>
  );
}

function UnlocatedQuote({ quote }: { quote: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3">
      <p className="text-sm leading-7 break-words whitespace-pre-wrap text-deep-700">
        “{quote}”
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700">
        <Info aria-hidden="true" className="size-3" />
        未能在原文中精确定位，不作高亮
      </p>
    </div>
  );
}

function QuoteContext({
  sourceText,
  risk,
}: {
  sourceText: string | null;
  risk: AnalysisRisk;
}) {
  if (sourceText === null || !risk.quoteVerified) {
    return <UnlocatedQuote quote={risk.quote} />;
  }

  const index = sourceText.indexOf(risk.quote);
  if (index === -1) {
    return <UnlocatedQuote quote={risk.quote} />;
  }

  const contextStart = Math.max(0, index - 80);
  const contextEnd = Math.min(sourceText.length, index + risk.quote.length + 80);

  return (
    <div className="rounded-xl border border-deep-100 bg-deep-50/60 px-3.5 py-3">
      <p className="text-sm leading-7 break-words whitespace-pre-wrap text-deep-700">
        {contextStart > 0 ? "…" : ""}
        {sourceText.slice(contextStart, index)}
        <mark
          className={cn(
            "rounded px-0.5 font-medium underline decoration-2 underline-offset-4",
            RISK_META[risk.level].markClassName,
          )}
        >
          {risk.quote}
        </mark>
        {sourceText.slice(index + risk.quote.length, contextEnd)}
        {contextEnd < sourceText.length ? "…" : ""}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-aqua-700">
        <CircleCheck aria-hidden="true" className="size-3" />
        服务端已在原文中定位该引文，以上为精确高亮
      </p>
    </div>
  );
}

function PrintRiskList({ result }: { result: AnalyzeApiSuccess }) {
  return (
    <section className="hidden print:block">
      <h2 className="text-base font-semibold text-deep-950">风险明细清单</h2>
      {result.risks.length === 0 ? (
        <p className="mt-2 text-sm text-deep-500">本次检测未发现明确风险。</p>
      ) : (
        <div className="mt-3 space-y-4">
          {result.risks.map((risk, index) => (
            <article
              key={`${risk.quote}-${index}`}
              className="break-inside-avoid border-b border-deep-200 pb-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-deep-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[9px]", RISK_META[risk.level].badgeClassName)}
                >
                  {RISK_META[risk.level].label}
                </Badge>
                <span className="text-[10px] text-deep-500">
                  {risk.category}
                </span>
                <span className="text-[9px] text-deep-400">
                  {risk.quoteVerified ? "原文已定位" : "原文未精确定位"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 break-words text-deep-800">
                “{risk.quote}”
              </p>
              <p className="mt-2 text-xs leading-5 break-words text-deep-600">
                <span className="font-medium text-deep-700">风险解释：</span>
                {risk.reason}
              </p>
              <p className="mt-1.5 text-xs leading-5 break-words text-deep-600">
                <span className="font-medium text-deep-700">优化建议：</span>
                {risk.suggestion}
              </p>
              {risk.knowledge && (
                <div className="mt-2">
                  <KnowledgeReference knowledge={risk.knowledge} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AISuggestionSection({
  sourceText,
  rewrittenText,
  copyStatus,
  onCopy,
}: {
  sourceText: string | null;
  rewrittenText: string;
  copyStatus: "copied" | "error" | null;
  onCopy: () => void;
}) {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,76,95,0.04)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-aqua-700 uppercase">
            AI rewrite
          </p>
          <h2 className="mt-1 text-base font-semibold text-deep-950">
            AI 修改建议
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-[9px] text-amber-700"
          >
            模型生成 · 未核验
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="h-7 border-deep-200 bg-white px-2 text-[10px] text-deep-600 hover:bg-deep-50 print:hidden"
          >
            {copyStatus === "copied" ? (
              <Check aria-hidden="true" className="size-3" />
            ) : (
              <Copy aria-hidden="true" className="size-3" />
            )}
            {copyStatus === "copied"
              ? "已复制"
              : copyStatus === "error"
                ? "复制失败"
                : "复制改写"}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-deep-500">
        已基于当前风险生成完整改写文案。改写可能改变原意，请人工复核后再使用。
      </p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-deep-100 bg-white/60 p-3.5 print:break-inside-avoid">
          <p className="text-[11px] font-semibold text-deep-700">
            修改前（送检原文）
          </p>
          <p className="mt-2 max-h-80 overflow-auto text-xs leading-6 break-words whitespace-pre-wrap text-deep-600 print:max-h-none print:overflow-visible">
            {sourceText ?? "未填写"}
          </p>
        </div>
        <div className="min-w-0 rounded-xl border border-aqua-100 bg-aqua-50/40 p-3.5 print:break-inside-avoid">
          <p className="text-[11px] font-semibold text-aqua-800">
            修改后（AI 改写）
          </p>
          <p className="mt-2 max-h-80 overflow-auto text-xs leading-6 break-words whitespace-pre-wrap text-deep-700 print:max-h-none print:overflow-visible">
            {rewrittenText}
          </p>
        </div>
      </div>
    </section>
  );
}

function FactVerificationSection({ factRisks }: { factRisks: RiskEntry[] }) {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,76,95,0.04)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-aqua-700 uppercase">
            Fact review
          </p>
          <h2 className="mt-1 text-base font-semibold text-deep-950">
            AI 事实核验专项结论
          </h2>
        </div>
        <Badge
          variant="outline"
          className="border-deep-200 bg-deep-50 text-[9px] text-deep-500"
        >
          尚未完成事实核验
        </Badge>
      </div>

      <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-[10px] leading-5 text-amber-800">
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        当前接口只提供模型语义初筛与风险数据，未提供独立事实核验结论。本报告不宣称事实已经核实正确。
      </p>

      {factRisks.length === 0 ? (
        <p className="mt-3 text-xs leading-5 text-deep-500">
          现有风险数据中没有关联事实参考的条目，不能据此推断内容事实正确。
        </p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {factRisks.map(({ risk, index }) => {
            const review = risk.knowledge
              ? reviewStatusMeta(risk.knowledge.reviewStatus)
              : null;

            return (
              <div
                key={`${risk.quote}-${index}`}
                className="rounded-xl border border-deep-100 bg-white/60 p-3.5"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px]",
                      RISK_META[risk.level].badgeClassName,
                    )}
                  >
                    {RISK_META[risk.level].label}
                  </Badge>
                  <span className="text-[9px] text-deep-400">
                    {risk.category}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 break-words text-deep-700">
                  “{risk.quote}”
                </p>
                <p className="mt-1.5 text-[10px] leading-5 break-words text-deep-500">
                  {risk.reason}
                </p>
                {risk.knowledge ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px]">
                    <span className="font-mono text-deep-500">
                      {risk.knowledge.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-[8px]", review?.className)}
                    >
                      {review?.label}
                    </Badge>
                  </div>
                ) : (
                  <p className="mt-2 text-[9px] text-deep-400">
                    未关联本地事实参考
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ConclusionSection({
  counts,
  recommendation,
}: {
  counts: Record<RiskLevel, number>;
  recommendation: string;
}) {
  const total = counts.high + counts.medium + counts.low;

  return (
    <section className="rounded-2xl border border-aqua-100 bg-[linear-gradient(135deg,rgba(235,253,248,0.9),rgba(244,250,255,0.85))] p-4 shadow-[0_18px_45px_rgba(15,76,95,0.04)] sm:p-5">
      <div className="flex items-start gap-2">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-aqua-700" />
        <div>
          <h2 className="text-base font-semibold text-deep-950">
            综合评估结论
          </h2>
          <p className="mt-2 text-xs leading-6 text-deep-600">
            本次共识别 {total} 项风险：高风险 {counts.high} 项、中风险{" "}
            {counts.medium} 项、低风险 {counts.low} 项。{recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}

function DisclaimerSection() {
  return (
    <section className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_18px_45px_rgba(15,76,95,0.03)] sm:p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck aria-hidden="true" className="size-4 text-deep-500" />
        <h2 className="text-sm font-semibold text-deep-900">免责声明</h2>
      </div>
      <div className="mt-2 grid gap-2 text-[10px] leading-5 text-deep-500 sm:grid-cols-2">
        <p>
          本报告基于公开资料、本地知识库与 AI 语义初筛生成，知识库覆盖范围和文化判断具有局限性，可能存在遗漏或误判。
        </p>
        <p>
          预检不替代当地律师或专业合规机构的审核；用户应在实际发布前自行评估潜在风险，报告不构成法律意见或合规保证。
        </p>
        <p>
          送检文件由服务端解析，解析后的文本会发送给 DeepSeek 进行模型推理；应用端未建立检测结果数据库。
        </p>
        <p>
          第三方模型服务的数据处理、保留和删除受其服务条款约束；具体数据处理与责任表述待法务/隐私审核。
        </p>
      </div>
    </section>
  );
}

export function RealReportPanel({
  state,
  document,
  sourceText,
  reportNumber,
}: RealReportPanelProps) {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [selectedRiskIndex, setSelectedRiskIndex] = useState(0);
  const [detailTab, setDetailTab] = useState<DetailTab>("analysis");
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);

  if (state.status !== "success") {
    return null;
  }

  const result = state.result;
  const counts: Record<RiskLevel, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const risk of result.risks) {
    counts[risk.level] += 1;
  }

  const riskEntries: RiskEntry[] = result.risks.map((risk, index) => ({
    risk,
    index,
  }));
  const filteredRisks =
    riskFilter === "all"
      ? riskEntries
      : riskEntries.filter((entry) => entry.risk.level === riskFilter);
  const activeEntry =
    filteredRisks.find((entry) => entry.index === selectedRiskIndex) ??
    filteredRisks[0] ??
    null;
  const activeRisk = activeEntry?.risk ?? null;
  const activeIndex = activeEntry?.index ?? null;
  const activePosition = activeEntry
    ? filteredRisks.findIndex((entry) => entry.index === activeEntry.index)
    : -1;

  const factRisks = riskEntries.filter(
    ({ risk }) =>
      risk.knowledge?.kind === "fact" || risk.category.includes("事实"),
  );

  const rewriteKey = `${result.analyzedAt}-rewrite`;
  const suggestionKey =
    activeIndex === null ? null : `${result.analyzedAt}-suggestion-${activeIndex}`;
  const rewriteCopyStatus =
    copyFeedback?.key === rewriteKey ? copyFeedback.status : null;
  const suggestionCopyStatus =
    suggestionKey && copyFeedback?.key === suggestionKey
      ? copyFeedback.status
      : null;

  const reportTitle = `德国市场${contentTypeLabel(result.contentType)}文化与合规风险报告`;
  const fileType = document ? document.kind.toUpperCase() : "未提供";
  const fileSize = document
    ? formatFileSize(document.file.size)
    : "未提供";

  const recommendation =
    counts.high > 0
      ? "建议优先修改或删除高风险内容，重新送检并由专业人员复核。"
      : counts.medium + counts.low > 0
        ? "建议根据风险明细优化内容后再次检查。"
        : "本次未发现明确风险，仍建议结合属地要求进一步确认。";

  const filterOptions: {
    key: RiskFilter;
    label: string;
    count: number;
    dotClassName?: string;
  }[] = [
    { key: "all", label: "全部片段", count: result.risks.length },
    {
      key: "high",
      label: "高风险",
      count: counts.high,
      dotClassName: "bg-risk-500",
    },
    {
      key: "medium",
      label: "中风险",
      count: counts.medium,
      dotClassName: "bg-amber-500",
    },
    {
      key: "low",
      label: "低风险",
      count: counts.low,
      dotClassName: "bg-aqua-500",
    },
  ];

  async function copyText(text: string, key: string) {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(text);
      setCopyFeedback({ key, status: "copied" });
    } catch {
      setCopyFeedback({ key, status: "error" });
    }
  }

  function moveRisk(direction: -1 | 1) {
    if (!activeEntry || filteredRisks.length === 0) {
      return;
    }

    const nextPosition =
      (activePosition + direction + filteredRisks.length) %
      filteredRisks.length;
    setSelectedRiskIndex(filteredRisks[nextPosition].index);
    setDetailTab("analysis");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,76,95,0.06)] backdrop-blur-sm sm:p-6">
        <div className="mb-3 hidden items-center justify-between border-b border-deep-200 pb-2 text-[9px] text-deep-500 print:flex">
          <span>万语鉴多语言跨文化合规风险预检报告</span>
          <span>报告编号：{reportNumber}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-aqua-200 bg-aqua-50 text-[9px] text-aqua-800"
          >
            <span className="size-1.5 rounded-full bg-aqua-500" />
            内容风险评估报告
          </Badge>
          <span className="text-[10px] text-deep-400">
            AI 辅助预检 · 需人工复核
          </span>
        </div>

        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-deep-950 sm:text-3xl lg:text-[2.15rem]">
              {reportTitle}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-deep-500">
              基于历史语境、广告合规与语言歧义的多维度分析，识别潜在文化误读与合规风险，并提供可落地的优化建议。
            </p>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <div className="flex items-start gap-2">
                <Globe aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-deep-400" />
                <div>
                  <p className="text-[9px] text-deep-400">目标市场</p>
                  <p className="mt-0.5 text-[11px] font-medium text-deep-700">
                    德国（DE）
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-deep-400" />
                <div>
                  <p className="text-[9px] text-deep-400">文件类型</p>
                  <p className="mt-0.5 text-[11px] font-medium text-deep-700">
                    {fileType}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HardDrive aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-deep-400" />
                <div>
                  <p className="text-[9px] text-deep-400">文件大小</p>
                  <p className="mt-0.5 text-[11px] font-medium text-deep-700">
                    {fileSize}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-deep-400" />
                <div>
                  <p className="text-[9px] text-deep-400">检测模型</p>
                  <p className="mt-0.5 text-[11px] font-medium text-deep-700">
                    DeepSeek + 本地知识库
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {riskLevels.map((level) => (
              <div
                key={level}
                className={cn(
                  "rounded-2xl border p-3",
                  RISK_META[level].countClassName,
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      level === "high"
                        ? "bg-risk-500"
                        : level === "medium"
                          ? "bg-amber-500"
                          : "bg-aqua-500",
                    )}
                  />
                  <p className="text-[10px] font-medium">
                    {RISK_META[level].label}
                  </p>
                </div>
                <p className="mt-2 text-2xl leading-none font-semibold">
                  {counts[level]}
                  <span className="ml-0.5 text-[10px] font-normal">处</span>
                </p>
                <p className="mt-1.5 text-[9px] leading-4 opacity-80">
                  {riskDescriptions[level]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl border border-aqua-100 bg-[linear-gradient(135deg,rgba(235,253,248,0.8),rgba(244,250,255,0.8))] p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/75 text-aqua-700">
            <Sparkles aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-aqua-800 uppercase">
              Executive summary
            </p>
            <p className="mt-1 text-xs leading-6 break-words text-deep-600">
              {result.summary}
            </p>
          </div>
        </div>
      </section>

      {result.warnings.length > 0 && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 print:break-inside-avoid">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
            <TriangleExclamationPoint aria-hidden="true" className="size-3.5" />
            系统校验提示
          </p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[10px] leading-5 text-amber-800">
            {result.warnings.map((warning) => (
              <li key={warning} className="break-words">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] print:hidden">
        <div className="min-w-0 rounded-2xl border border-white/80 bg-white/80 shadow-[0_18px_45px_rgba(15,76,95,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-deep-100 p-4">
            <div>
              <p className="text-[10px] text-deep-400">Source locator</p>
              <h2 className="mt-1 text-sm font-semibold text-deep-950">
                原文定位
              </h2>
              <p className="mt-0.5 text-[10px] text-deep-400">
                浏览并定位存在风险的原文片段
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-aqua-200 bg-aqua-50 text-[9px] text-aqua-800"
            >
              共 {result.risks.length} 处风险
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-deep-100 p-3">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={riskFilter === option.key}
                onClick={() => setRiskFilter(option.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-colors",
                  riskFilter === option.key
                    ? "border-aqua-300 bg-aqua-50 text-aqua-800"
                    : "border-deep-100 bg-white/70 text-deep-500 hover:border-deep-200 hover:text-deep-800",
                )}
              >
                {option.dotClassName && (
                  <span
                    className={cn("size-1.5 rounded-full", option.dotClassName)}
                  />
                )}
                {option.label}
                <span className="font-mono text-[9px] text-deep-400">
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          <div className="max-h-[30rem] overflow-auto p-2">
            {filteredRisks.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-deep-400">
                当前筛选下没有风险片段。
              </p>
            ) : (
              filteredRisks.map(({ risk, index }) => (
                <button
                  key={`${risk.quote}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedRiskIndex(index);
                    setDetailTab("analysis");
                  }}
                  className={cn(
                    "mb-1.5 flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors",
                    activeIndex === index
                      ? "border-aqua-300 bg-aqua-50/60"
                      : "border-transparent hover:bg-deep-50/60",
                  )}
                >
                  <span className="mt-0.5 font-mono text-[9px] text-deep-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] leading-5 text-deep-700">
                      <mark
                        className={cn(
                          "rounded px-0.5",
                          RISK_META[risk.level].markClassName,
                        )}
                      >
                        “{risk.quote}”
                      </mark>
                    </p>
                    <p className="mt-1 truncate text-[9px] text-deep-400">
                      {risk.category}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[8px]",
                      RISK_META[risk.level].badgeClassName,
                    )}
                  >
                    {RISK_META[risk.level].label}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/80 bg-white/80 shadow-[0_18px_45px_rgba(15,76,95,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-deep-100 p-4">
            <div>
              <p className="text-[10px] text-deep-400">Risk detail</p>
              <h2 className="mt-1 text-sm font-semibold text-deep-950">
                风险详情
              </h2>
              <p className="mt-0.5 text-[10px] text-deep-400">
                选中左侧片段查看具体分析、依据与优化建议
              </p>
            </div>
            {filteredRisks.length > 0 && activeEntry && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => moveRisk(-1)}
                  disabled={filteredRisks.length <= 1}
                  aria-label="上一条风险"
                  className="size-7 border-deep-200 bg-white text-deep-500 hover:bg-deep-50"
                >
                  <ChevronLeft aria-hidden="true" className="size-3.5" />
                </Button>
                <span className="min-w-12 text-center font-mono text-[10px] text-deep-400">
                  {activePosition + 1} / {filteredRisks.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => moveRisk(1)}
                  disabled={filteredRisks.length <= 1}
                  aria-label="下一条风险"
                  className="size-7 border-deep-200 bg-white text-deep-500 hover:bg-deep-50"
                >
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          {activeRisk && activeIndex !== null ? (
            <>
              <div className="border-b border-deep-100 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px]",
                      RISK_META[activeRisk.level].badgeClassName,
                    )}
                  >
                    {RISK_META[activeRisk.level].label}
                  </Badge>
                  <span className="text-[10px] text-deep-500">
                    {activeRisk.category}
                  </span>
                  <span className="font-mono text-[9px] text-deep-300">
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-3">
                  <QuoteContext sourceText={sourceText} risk={activeRisk} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 border-b border-deep-100 px-4 py-2">
                {(
                  [
                    ["analysis", "风险分析"],
                    ["basis", "依据与参考"],
                    ["suggestion", "优化建议"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={detailTab === key}
                    onClick={() => setDetailTab(key)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[11px] transition-colors",
                      detailTab === key
                        ? "bg-aqua-50 font-medium text-aqua-800"
                        : "text-deep-500 hover:bg-deep-50 hover:text-deep-800",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {detailTab === "analysis" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-deep-100 bg-white/60 p-3">
                      <p className="text-[9px] text-deep-400">风险类型</p>
                      <p className="mt-1 text-xs font-medium text-deep-800">
                        {activeRisk.category}
                      </p>
                    </div>
                    <div className="rounded-xl border border-deep-100 bg-white/60 p-3">
                      <p className="text-[9px] text-deep-400">风险等级</p>
                      <p className="mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px]",
                            RISK_META[activeRisk.level].badgeClassName,
                          )}
                        >
                          {RISK_META[activeRisk.level].label}
                        </Badge>
                      </p>
                    </div>
                    <div className="rounded-xl border border-deep-100 bg-white/60 p-3 sm:col-span-2">
                      <p className="text-[9px] text-deep-400">问题说明</p>
                      <p className="mt-1 text-xs leading-5 break-words text-deep-600">
                        {activeRisk.reason}
                      </p>
                    </div>
                    <div className="rounded-xl border border-deep-100 bg-white/60 p-3 sm:col-span-2">
                      <p className="text-[9px] text-deep-400">引文状态</p>
                      <p className="mt-1 text-[10px] text-deep-500">
                        {activeRisk.quoteVerified
                          ? "服务端已在原文中定位该引文"
                          : "未能在原文中精确定位，不作高亮"}
                      </p>
                    </div>
                  </div>
                )}

                {detailTab === "basis" &&
                  (activeRisk.knowledge ? (
                    <KnowledgeReference knowledge={activeRisk.knowledge} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-deep-200 bg-deep-50/40 px-3.5 py-4 text-[10px] leading-5 text-deep-400">
                      未关联本地知识库规则；本条判断仅来自模型初筛，需人工复核。
                    </div>
                  ))}

                {detailTab === "suggestion" && (
                  <div className="rounded-xl border border-aqua-100 bg-aqua-50/40 p-3.5">
                    <p className="text-[10px] font-semibold text-aqua-800">
                      优化建议
                    </p>
                    <p className="mt-1.5 text-xs leading-5 break-words text-deep-600">
                      {activeRisk.suggestion}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (suggestionKey) {
                          void copyText(activeRisk.suggestion, suggestionKey);
                        }
                      }}
                      className="mt-2 h-7 border-aqua-200 bg-white px-2 text-[10px] text-aqua-800 hover:bg-aqua-50 print:hidden"
                    >
                      {suggestionCopyStatus === "copied" ? (
                        <Check aria-hidden="true" className="size-3" />
                      ) : (
                        <Copy aria-hidden="true" className="size-3" />
                      )}
                      {suggestionCopyStatus === "copied"
                        ? "已复制"
                        : suggestionCopyStatus === "error"
                          ? "复制失败"
                          : "复制建议"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="px-6 py-12 text-center">
              <ShieldCheck
                aria-hidden="true"
                className="mx-auto size-8 text-aqua-600"
              />
              <p className="mt-3 text-sm font-medium text-deep-800">
                本次检测未发现明确风险
              </p>
              <p className="mt-1.5 text-xs leading-5 text-deep-500">
                这不代表内容已经合规，请结合人工审核和属地要求确认。
              </p>
            </div>
          )}
        </div>
      </section>

      <PrintRiskList result={result} />

      <AISuggestionSection
        sourceText={sourceText}
        rewrittenText={result.rewrittenText}
        copyStatus={rewriteCopyStatus}
        onCopy={() => void copyText(result.rewrittenText, rewriteKey)}
      />

      <FactVerificationSection factRisks={factRisks} />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <ConclusionSection counts={counts} recommendation={recommendation} />
        <section className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_18px_45px_rgba(15,76,95,0.03)]">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-deep-800">
            <Quote aria-hidden="true" className="size-3.5 text-aqua-700" />
            报告说明
          </p>
          <p className="mt-2 text-[10px] leading-5 text-deep-500">
            检测时间：{formatAnalyzedAt(result.analyzedAt)}
            <br />
            检测模型：{result.model}
            <br />
            报告内容基于当前真实风险数据生成。
          </p>
        </section>
      </div>

      <DisclaimerSection />
    </div>
  );
}
