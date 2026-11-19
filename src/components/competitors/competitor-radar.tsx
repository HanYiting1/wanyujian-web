"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CircleAlert,
  Database,
  FlaskConical,
  Globe2,
  Info,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import {
  AnalysisPanel,
  type AnalysisPanelState,
} from "@/components/competitors/analysis-panel";
import { SearchResultCard } from "@/components/competitors/search-result-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  COMPETITOR_COUNTRIES,
  DEFAULT_COMPETITOR_COUNTRY,
  getCompetitorCountry,
} from "@/lib/competitors/countries";
import {
  COMPETITOR_ANALYZE_API_PATH,
  COMPETITOR_INDUSTRY,
  COMPETITOR_SEARCH_API_PATH,
  DEFAULT_COMPETITOR_PRODUCT,
  MAX_COMPETITOR_SELECTION,
  type CompetitorAnalysis,
  type CompetitorSearchResult,
} from "@/lib/competitors/types";
import {
  buildAnalysisCopyText,
  extractApiError,
  normalizeSearchResults,
  parseAnalysisResponse,
  toAnalyzeSource,
  truncateText,
} from "@/lib/competitors/format";
import { cn } from "@/lib/utils";

type SearchState = "idle" | "loading" | "success" | "error";

function getSearchErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") {
    return "竞品搜索超时，请稍后重试。";
  }
  if (error instanceof TypeError) {
    return "无法连接竞品搜索接口。请确认 /api/competitors 已正确实现并导出 POST。";
  }
  if (error instanceof Error && error.message.trim()) {
    return truncateText(error.message, 240);
  }
  return "竞品搜索失败，请稍后重试。";
}

function getAnalyzeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") {
    return "AI 分析超时，请减少勾选结果后重试。竞品搜索结果不会受影响。";
  }
  if (error instanceof Error && error.message.trim()) {
    return truncateText(error.message, 280);
  }
  return "AI 营销策略分析失败，请稍后重试。竞品搜索结果不会受影响。";
}

async function readJsonResponse(
  response: Response,
  fallback: string,
): Promise<unknown> {
  const raw = await response.text();
  let payload: unknown = null;

  if (raw.trim()) {
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error(
        `${fallback} 接口未返回有效 JSON，请检查服务端响应。`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      extractApiError(
        payload,
        `${fallback} 失败（HTTP ${response.status}）。`,
      ),
    );
  }

  if (!raw.trim()) {
    throw new Error(
      `${fallback} 接口返回空响应，请检查服务端接口是否已实现。`,
    );
  }

  return payload;
}

export function CompetitorRadar() {
  const [product, setProduct] = useState(DEFAULT_COMPETITOR_PRODUCT);
  const [countryCode, setCountryCode] = useState<string>(
    DEFAULT_COMPETITOR_COUNTRY.code,
  );
  const [industry, setIndustry] = useState<string>(COMPETITOR_INDUSTRY);
  const [searchedProduct, setSearchedProduct] = useState(
    DEFAULT_COMPETITOR_PRODUCT,
  );
  const [searchedMarket, setSearchedMarket] = useState<string>(
    DEFAULT_COMPETITOR_COUNTRY.name,
  );
  const [searchedIndustry, setSearchedIndustry] =
    useState<string>(COMPETITOR_INDUSTRY);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<CompetitorSearchResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [analysisState, setAnalysisState] =
    useState<AnalysisPanelState>("idle");
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    "copied" | "error" | null
  >(null);

  const searchLoading = searchState === "loading";
  const analysisLoading = analysisState === "loading";
  const selectedResults = results.filter((result) =>
    selectedIds.has(result.id),
  );
  const selectedCount = selectedResults.length;

  function clearAnalysis() {
    setAnalysis(null);
    setAnalysisState("idle");
    setAnalysisError(null);
    setCopyStatus(null);
  }

  async function handleSearch() {
    const keyword = product.trim();
    const industryValue = industry.trim();
    const country =
      getCompetitorCountry(countryCode) ?? DEFAULT_COMPETITOR_COUNTRY;
    if (!keyword || !industryValue || searchLoading) {
      return;
    }

    setSearchState("loading");
    setSearchError(null);
    setResults([]);
    setSelectedIds(new Set<string>());
    clearAnalysis();

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(COMPETITOR_SEARCH_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: keyword,
          country: country.code,
          industry: industryValue,
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      const payload = await readJsonResponse(response, "竞品搜索");
      const normalized = normalizeSearchResults(payload);
      setResults(normalized);
      setSearchedProduct(keyword);
      setSearchedMarket(country.name);
      setSearchedIndustry(industryValue);
      setSearchState("success");
    } catch (error) {
      setSearchError(getSearchErrorMessage(error));
      setSearchState("error");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSearch();
  }

  function toggleSelection(id: string) {
    if (analysisLoading) {
      return;
    }

    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else if (next.size < MAX_COMPETITOR_SELECTION) {
      next.add(id);
    } else {
      return;
    }

    setSelectedIds(next);
    if (analysis || analysisState !== "idle" || analysisError) {
      clearAnalysis();
    }
  }

  async function handleAnalyze() {
    if (selectedCount === 0 || analysisLoading) {
      return;
    }

    setAnalysisState("loading");
    setAnalysisError(null);
    setAnalysis(null);
    setCopyStatus(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(COMPETITOR_ANALYZE_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: searchedProduct,
          market: searchedMarket,
          industry: searchedIndustry,
          results: selectedResults.map(toAnalyzeSource),
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      const payload = await readJsonResponse(response, "AI 营销策略分析");
      const parsed = parseAnalysisResponse(payload);
      if (!parsed) {
        throw new Error(
          "AI 分析接口返回结构异常，请检查服务端响应或重试。",
        );
      }

      setAnalysis(parsed);
      setAnalysisState("success");
    } catch (error) {
      setAnalysis(null);
      setAnalysisError(getAnalyzeErrorMessage(error));
      setAnalysisState("error");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function handleCopyAnalysis() {
    if (!analysis) {
      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(buildAnalysisCopyText(analysis));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  const searchButtonLabel = searchLoading
    ? "正在搜索…"
    : searchState === "success" || searchState === "error"
      ? "重新搜索"
      : "搜索竞品";

  return (
    <div className="mx-auto w-full max-w-[92rem]">
      <div className="mb-6 flex flex-col gap-5 lg:mb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-aqua-700 uppercase">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-aqua-500"
            />
            Competitor marketing radar
          </p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-deep-950 sm:text-4xl">
            竞品营销雷达工作台
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-deep-500">
            选择目标国家，输入行业与产品关键词，搜索公开网页并勾选最多五条竞品作为参考，再生成中文营销策略分析。分析只基于本次选中的真实网页摘要，网页宣称不自动视为事实。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-deep-200 bg-white/80 px-2.5 py-1 text-[11px] font-normal text-deep-600"
          >
            <span className="size-1.5 rounded-full bg-aqua-500" />
            Tavily 公开网页
          </Badge>
          <Badge
            variant="outline"
            className="border-aqua-200 bg-aqua-50 px-2.5 py-1 text-[11px] font-normal text-aqua-700"
          >
            <span className="size-1.5 rounded-full bg-aqua-500" />
            DeepSeek 策略分析
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-normal text-amber-700"
          >
            <ShieldAlert aria-hidden="true" className="size-3.5" />
            结果需人工核验
          </Badge>
          <Link
            href="/analyze"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 rounded-full border-deep-200 bg-white/80 px-3 text-[11px] text-deep-600 hover:bg-white",
            )}
          >
            内容合规预检
            <ArrowRight aria-hidden="true" className="size-3" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="gap-0 overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/85 p-0 shadow-[0_20px_50px_rgba(15,76,95,0.05)]">
            <div className="flex items-start justify-between gap-3 border-b border-deep-100 px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-deep-950 font-mono text-[10px] font-semibold text-aqua-300">
                  01
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-deep-950">
                    竞品搜索
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-deep-500">
                    选择目标国家，输入行业和产品关键词，获取该市场的真实公开网页结果。
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-aqua-200 bg-aqua-50 text-[10px] text-aqua-700"
              >
                Tavily
              </Badge>
            </div>

            <div className="p-4 sm:p-5">
              <form onSubmit={handleSearchSubmit}>
                <div className="grid gap-2.5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,1.3fr)_auto]">
                  <label className="block rounded-xl border border-deep-100 bg-deep-50/50 px-3 py-2.5 focus-within:border-aqua-400">
                    <span className="block text-[10px] text-deep-400">
                      目标市场
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <Globe2 className="size-3.5 shrink-0 text-aqua-600" />
                      <select
                        value={countryCode}
                        onChange={(event) => setCountryCode(event.target.value)}
                        className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-deep-800 outline-none"
                      >
                        {COMPETITOR_COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name} · {country.englishName}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label className="block rounded-xl border border-deep-100 bg-deep-50/50 px-3 py-2.5 focus-within:border-aqua-400">
                    <span className="block text-[10px] text-deep-400">
                      行业
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <FlaskConical className="size-3.5 shrink-0 text-aqua-600" />
                      <input
                        value={industry}
                        onChange={(event) => setIndustry(event.target.value)}
                        maxLength={60}
                        placeholder="护肤品 / 美妆 / 食品…"
                        className="min-w-0 flex-1 bg-transparent text-sm text-deep-800 outline-none placeholder:text-deep-300"
                      />
                    </span>
                  </label>
                  <label className="block rounded-xl border border-deep-200 bg-white px-3 py-2.5 focus-within:border-aqua-400">
                    <span className="block text-[10px] text-deep-400">
                      产品关键词
                    </span>
                    <input
                      value={product}
                      onChange={(event) => setProduct(event.target.value)}
                      maxLength={60}
                      placeholder={DEFAULT_COMPETITOR_PRODUCT}
                      className="mt-1 w-full bg-transparent text-sm text-deep-900 outline-none placeholder:text-deep-300"
                    />
                  </label>
                  <Button
                    type="submit"
                    disabled={
                      searchLoading ||
                      analysisLoading ||
                      !product.trim() ||
                      !industry.trim()
                    }
                    className="h-full min-h-[2.75rem] justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)] hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-deep-100 disabled:text-deep-400 disabled:shadow-none"
                  >
                    {searchLoading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : searchState === "success" ||
                      searchState === "error" ? (
                      <RefreshCw className="size-4" />
                    ) : (
                      <Search className="size-4" />
                    )}
                    {searchButtonLabel}
                  </Button>
                </div>
              </form>

              <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-5 text-deep-400">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                选择的国家、行业和关键词会用于 Tavily 搜索；页面只截断过长摘要，不拼接、不伪造结果。修改任一条件后请重新搜索。
              </p>
            </div>
          </Card>

          <Card className="gap-0 overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/85 p-0 shadow-[0_20px_50px_rgba(15,76,95,0.05)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-deep-100 px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-deep-950 font-mono text-[10px] font-semibold text-aqua-300">
                  02
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-deep-950">
                    竞品结果
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-deep-500">
                    勾选最多 {MAX_COMPETITOR_SELECTION} 条作为 AI 分析参考。
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-deep-100 bg-deep-50 px-2.5 py-1 text-[11px] text-deep-500">
                  共 {results.length} 条
                </span>
                <span className="rounded-full border border-aqua-200 bg-aqua-50 px-2.5 py-1 text-[11px] text-aqua-700">
                  已选 {selectedCount} / {MAX_COMPETITOR_SELECTION}
                </span>
                {(results.length > 0 || searchState === "error") && (
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    disabled={searchLoading || analysisLoading}
                    className="inline-flex items-center gap-1 rounded-full border border-deep-200 bg-white px-2.5 py-1 text-[11px] text-deep-500 transition-colors hover:border-deep-300 hover:text-deep-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RefreshCw className="size-3" />
                    重新搜索
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {searchLoading && (
                <div className="space-y-2.5">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-deep-100 bg-white p-4"
                    >
                      <div className="h-2 w-24 rounded-full bg-deep-100" />
                      <div className="mt-3 h-3 w-3/4 rounded-full bg-deep-100" />
                      <div className="mt-2 h-2 w-full rounded-full bg-deep-50" />
                      <div className="mt-2 h-2 w-5/6 rounded-full bg-deep-50" />
                    </div>
                  ))}
                  <p className="pt-3 text-center text-[11px] text-deep-400">
                    正在请求 Tavily 公开网页结果…
                  </p>
                </div>
              )}

              {!searchLoading && searchState === "error" && (
                <div className="rounded-2xl border border-risk-200 bg-risk-50 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-risk-700">
                    <CircleAlert className="size-4" />
                    竞品搜索失败
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-risk-600">
                    {searchError}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-risk-200 bg-white px-2.5 py-1.5 text-xs text-risk-700 transition-colors hover:bg-risk-50"
                  >
                    <RefreshCw className="size-3" />
                    重试搜索
                  </button>
                </div>
              )}

              {!searchLoading && searchState === "idle" && (
                <div className="rounded-2xl border border-dashed border-deep-200 bg-deep-50/40 px-5 py-12 text-center">
                  <Search className="mx-auto size-7 text-aqua-600/70" />
                  <p className="mt-3 text-base font-medium text-deep-700">
                    搜索目标市场竞品
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-deep-400">
                    默认关键词 {DEFAULT_COMPETITOR_PRODUCT}；可以修改后重新搜索。
                  </p>
                </div>
              )}

              {!searchLoading &&
                searchState === "success" &&
                results.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-deep-200 bg-deep-50/40 px-5 py-12 text-center">
                    <Database className="mx-auto size-7 text-deep-300" />
                    <p className="mt-3 text-base font-medium text-deep-600">
                      接口未返回可用结果
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-deep-400">
                      本页不会用模拟数据补位。请调整关键词或检查搜索接口返回。
                    </p>
                  </div>
                )}

              {!searchLoading && results.length > 0 && (
                <div className="space-y-2.5">
                  {results.map((result) => {
                    const selected = selectedIds.has(result.id);

                    return (
                      <SearchResultCard
                        key={result.id}
                        result={result}
                        selected={selected}
                        selectionDisabled={
                          analysisLoading ||
                          (selectedCount >= MAX_COMPETITOR_SELECTION &&
                            !selected)
                        }
                        onToggle={toggleSelection}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

        <AnalysisPanel
          analysis={analysis}
          state={analysisState}
          error={analysisError}
          selectedCount={selectedCount}
          copyStatus={copyStatus}
          onAnalyze={() => void handleAnalyze()}
          onCopy={() => void handleCopyAnalysis()}
        />
      </div>

      <p className="mt-6 flex items-start gap-1.5 text-[11px] leading-5 text-deep-400 print:hidden">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        竞品营销雷达仅使用 Tavily 公开网页摘要和 DeepSeek
        分析，不写入内容风险检测报告；网页宣称不等同于事实，AI
        输出不构成法律或合规意见，来源与结论需人工核验。
      </p>
    </div>
  );
}
