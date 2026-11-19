"use client";

import {
  Check,
  CircleAlert,
  Copy,
  ExternalLink,
  LoaderCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { CompetitorAnalysis } from "@/lib/competitors/types";
import {
  COMPETITOR_ANALYSIS_DISCLAIMER,
  MAX_COMPETITOR_SELECTION,
} from "@/lib/competitors/types";
import { formatGeneratedAt } from "@/lib/competitors/format";
import { cn } from "@/lib/utils";

export type AnalysisPanelState = "idle" | "loading" | "success" | "error";

interface AnalysisPanelProps {
  analysis: CompetitorAnalysis | null;
  state: AnalysisPanelState;
  error: string | null;
  selectedCount: number;
  copyStatus: "copied" | "error" | null;
  onAnalyze: () => void;
  onCopy: () => void;
}

export function AnalysisPanel({
  analysis,
  state,
  error,
  selectedCount,
  copyStatus,
  onAnalyze,
  onCopy,
}: AnalysisPanelProps) {
  const loading = state === "loading";

  return (
    <aside className="min-w-0">
      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(160deg,rgba(248,255,252,0.96),rgba(243,250,255,0.94))] shadow-[0_24px_60px_rgba(15,76,95,0.07)] backdrop-blur-sm">
        <div className="border-b border-deep-100 p-4 sm:p-5">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-deep-950 font-mono text-[11px] font-semibold text-aqua-300">
              03
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-base font-semibold text-deep-950">
                  AI 营销策略分析
                </h2>
                <span className="rounded-full border border-aqua-200 bg-aqua-50 px-2 py-0.5 font-mono text-[9px] text-aqua-700">
                  DeepSeek
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-deep-400">
                仅根据你勾选的公开网页标题与摘要生成中文分析。
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-deep-400">
            <span>
              已选择{" "}
              <span className="font-mono text-aqua-700">{selectedCount}</span> /{" "}
              {MAX_COMPETITOR_SELECTION} 条
            </span>
            {analysis && (
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-deep-200 bg-white px-2 py-1 text-[11px] text-deep-500 transition-colors hover:border-deep-300 hover:text-deep-800"
              >
                {copyStatus === "copied" ? (
                  <Check className="size-3 text-aqua-600" />
                ) : (
                  <Copy className="size-3" />
                )}
                {copyStatus === "copied"
                  ? "已复制"
                  : copyStatus === "error"
                    ? "复制失败"
                    : "复制分析结果"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={selectedCount === 0 || loading}
            className={cn(
              "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
              selectedCount === 0 || loading
                ? "cursor-not-allowed bg-deep-50 text-deep-300"
                : "bg-[#2563eb] text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]",
            )}
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading
              ? "DeepSeek 正在分析…"
              : analysis
                ? "重新生成 AI 分析"
                : "生成 AI 营销策略分析"}
          </button>

          {selectedCount === 0 && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-deep-400">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
              请先在左侧勾选 1–{MAX_COMPETITOR_SELECTION} 条竞品结果。
            </p>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-risk-200 bg-risk-50 px-3 py-2.5 text-xs leading-5 text-risk-700"
            >
              <p className="flex items-center gap-1.5 font-medium">
                <CircleAlert className="size-3.5 shrink-0" />
                AI 分析失败
              </p>
              <p className="mt-1 text-risk-600">{error}</p>
              <p className="mt-1 text-[11px] text-risk-500">
                竞品搜索结果仍然保留，你可以调整选择后重试。
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <LoaderCircle className="size-7 animate-spin text-aqua-600" />
              <p className="mt-3 text-sm text-deep-600">
                正在基于 {selectedCount} 条公开网页摘要生成分析…
              </p>
              <p className="mt-1.5 text-[11px] leading-5 text-deep-400">
                需要 20–60 秒；请勿关闭页面。
              </p>
            </div>
          )}

          {!loading && !analysis && !error && (
            <div className="rounded-2xl border border-dashed border-deep-200 bg-white/50 px-5 py-10 text-center">
              <Sparkles className="mx-auto size-7 text-aqua-500/70" />
              <p className="mt-3 text-base font-medium text-deep-700">
                勾选竞品后生成策略分析
              </p>
              <p className="mt-1.5 text-xs leading-5 text-deep-400">
                分析会覆盖卖点、语言、利益诉求、证据使用、可借鉴策略、宣传风险和差异化建议。
              </p>
            </div>
          )}

          {!loading && analysis && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-aqua-100 bg-aqua-50/60 px-3 py-2.5">
                <span className="text-xs text-aqua-800">
                  {analysis.market} · {analysis.industry} ·{" "}
                  {analysis.sourceCount} 条来源 ·{" "}
                  {formatGeneratedAt(analysis.generatedAt)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                  <ShieldAlert className="size-3" />
                  待人工核验
                </span>
              </div>

              {analysis.sections.map((section, index) => (
                <section
                  key={section.id}
                  className="rounded-2xl border border-deep-100 bg-white/80 p-3.5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-aqua-50 font-mono text-[10px] text-aqua-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-base font-semibold text-deep-900">
                          {section.title}
                        </h3>
                        {section.needsHumanReview && (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                            待人工核验
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[15px] leading-7 break-words whitespace-pre-wrap text-deep-600">
                        {section.content}
                      </p>

                      <div className="mt-2.5 space-y-2">
                        {section.evidence.length === 0 ? (
                          <p className="rounded-lg border border-amber-100 bg-amber-50/60 px-2.5 py-2 text-[11px] leading-5 text-amber-700">
                            本项未提供可核验来源，待人工核验。
                          </p>
                        ) : (
                          section.evidence.map((evidence, evidenceIndex) => (
                            <div
                              key={`${section.id}-${evidence.sourceId}-${evidenceIndex}`}
                              className="rounded-lg border border-deep-100 bg-deep-50/40 px-2.5 py-2"
                            >
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-[11px] text-aqua-700">
                                  {evidence.sourceId}
                                </span>
                                <a
                                  href={evidence.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-w-0 items-center gap-1 text-xs text-deep-600 underline decoration-deep-200 underline-offset-2 hover:text-aqua-800"
                                >
                                  <span className="max-w-full truncate">
                                    {evidence.sourceTitle}
                                  </span>
                                  <ExternalLink className="size-2.5 shrink-0" />
                                </a>
                                <span className="text-[11px] text-deep-400">
                                  {evidence.domain}
                                </span>
                              </div>
                              {evidence.quoteVerified && evidence.quote ? (
                                <blockquote className="mt-1.5 border-l border-aqua-300 pl-2 text-[13px] leading-6 break-words text-deep-500">
                                  “{evidence.quote}”
                                  <span className="mt-0.5 block text-[10px] text-aqua-600">
                                    已匹配来源摘要原文
                                  </span>
                                </blockquote>
                              ) : (
                                <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                  未提供可逐字匹配的原文引用，请打开来源人工核验。
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              ))}

              <p className="rounded-xl border border-deep-100 bg-white/60 px-3 py-2.5 text-[11px] leading-5 text-deep-400">
                {analysis.disclaimer}
              </p>
            </div>
          )}

          {!loading && !analysis && !error && (
            <p className="mt-3 text-[11px] leading-5 text-deep-400">
              {COMPETITOR_ANALYSIS_DISCLAIMER}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
