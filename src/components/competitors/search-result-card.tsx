"use client";

import { Check, ExternalLink } from "lucide-react";
import type { CompetitorSearchResult } from "@/lib/competitors/types";
import { formatScore, truncateText } from "@/lib/competitors/format";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
  result: CompetitorSearchResult;
  selected: boolean;
  selectionDisabled: boolean;
  onToggle: (id: string) => void;
}

export function SearchResultCard({
  result,
  selected,
  selectionDisabled,
  onToggle,
}: SearchResultCardProps) {
  const score = formatScore(result.score);

  return (
    <article
      className={cn(
        "rounded-2xl border p-3.5 transition-colors sm:p-4",
        selected
          ? "border-aqua-300 bg-aqua-50/40 ring-1 ring-aqua-500/10"
          : "border-deep-100 bg-white hover:border-deep-200",
      )}
    >
      <div className="flex items-start gap-3">
        <label
          className={cn(
            "mt-0.5 inline-flex shrink-0 items-center justify-center",
            selectionDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer",
          )}
          title={
            selectionDisabled
              ? "最多选择 5 条竞品结果"
              : selected
                ? "取消加入参考"
                : "加入参考"
          }
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={selected}
            disabled={selectionDisabled}
            onChange={() => onToggle(result.id)}
          />
          <span
            aria-hidden="true"
            className={cn(
              "grid size-5 place-items-center rounded-md border transition-colors",
              selected
                ? "border-aqua-600 bg-aqua-600 text-white"
                : "border-deep-200 bg-white text-transparent",
            )}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <span className="sr-only">加入参考：{result.title}</span>
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex max-w-full items-center rounded-full border border-aqua-100 bg-aqua-50 px-2 py-0.5 text-[11px] text-aqua-700">
              {result.domain}
            </span>
            {score && (
              <span className="rounded-full border border-deep-100 bg-deep-50 px-2 py-0.5 text-[10px] text-deep-500">
                相关度 {score}
              </span>
            )}
            {selected && (
              <span className="rounded-full border border-aqua-200 bg-aqua-50 px-2 py-0.5 text-[10px] text-aqua-800">
                已加入参考
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base leading-7 font-medium text-deep-900">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words transition-colors hover:text-aqua-800"
            >
              {result.title}
            </a>
          </h3>

          <p className="mt-1.5 text-[13px] leading-6 break-words text-deep-600">
            {result.snippet
              ? truncateText(result.snippet, 260)
              : "该网页未返回可用摘要。"}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-deep-100 pt-2.5 text-[11px]">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-aqua-700 transition-colors hover:text-aqua-800"
            >
              <ExternalLink className="size-3" />
              打开原始网页
            </a>
            <span
              className="min-w-0 max-w-full truncate text-deep-400"
              title={result.url}
            >
              {result.url}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
