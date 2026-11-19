"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Globe,
  Info,
  LoaderCircle,
  LockKeyhole,
  Printer,
  Radar,
  RefreshCw,
  RotateCcw,
  ScanText,
  Sparkles,
} from "lucide-react";
import { RealReportPanel } from "@/components/analyze/real-report-panel";
import { DetectionGuide } from "@/components/analyze/detection-guide";
import { UploadPanel } from "@/components/analyze/upload-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { useRealAnalysis } from "@/hooks/use-real-analysis";
import { MARKET_OPTIONS } from "@/lib/analysis/markets";
import { getMarketName } from "@/lib/markets/catalog";
import { cn } from "@/lib/utils";

const CONTENT_TYPE = "marketing";

function formatReportDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatReportNumber(value: string, marketCode: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未提供";
  }

  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `WYJ-${marketCode}-${getPart("year")}${getPart("month")}${getPart("day")}-${getPart("hour")}${getPart("minute")}${getPart("second")}`;
}

const marketOptions = [
  {
    flag: "de",
    name: MARKET_OPTIONS[0].name,
    englishName: MARKET_OPTIONS[0].englishName,
    status: "已开放",
    available: true,
  },
  {
    flag: "fr",
    name: "法国",
    englishName: "France",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "es",
    name: "西班牙",
    englishName: "Spain",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "jp",
    name: "日本",
    englishName: "Japan",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "us",
    name: "美国",
    englishName: "United States",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "gb",
    name: "英国",
    englishName: "United Kingdom",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "it",
    name: "意大利",
    englishName: "Italy",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "nl",
    name: "荷兰",
    englishName: "Netherlands",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "ae",
    name: "阿联酋",
    englishName: "UAE",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "kr",
    name: "韩国",
    englishName: "South Korea",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "ca",
    name: "加拿大",
    englishName: "Canada",
    status: "知识库检测",
    available: false,
  },
  {
    flag: "au",
    name: "澳大利亚",
    englishName: "Australia",
    status: "知识库检测",
    available: false,
  },
] as const;

function WorkbenchFlag({ code }: { code: string }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex size-8 shrink-0 overflow-hidden rounded-full border border-white/90 bg-white shadow-[0_4px_12px_rgba(15,76,95,0.12)]"
    >
      {code === "de" && (
        <span className="flex h-full w-full flex-col">
          <span className="flex-1 bg-[#1f2937]" />
          <span className="flex-1 bg-[#dc2626]" />
          <span className="flex-1 bg-[#fbbf24]" />
        </span>
      )}
      {code === "fr" && (
        <span className="flex h-full w-full">
          <span className="w-1/3 bg-[#1d4ed8]" />
          <span className="w-1/3 bg-white" />
          <span className="w-1/3 bg-[#dc2626]" />
        </span>
      )}
      {code === "es" && (
        <span className="flex h-full w-full flex-col">
          <span className="flex-1 bg-[#dc2626]" />
          <span className="flex-[2] bg-[#fbbf24]" />
          <span className="flex-1 bg-[#dc2626]" />
        </span>
      )}
      {code === "jp" && (
        <span className="flex h-full w-full items-center justify-center bg-white">
          <span className="size-3.5 rounded-full bg-[#dc2626]" />
        </span>
      )}
      {!["de", "fr", "es", "jp"].includes(code) && (
        <span className="grid h-full w-full place-items-center bg-deep-50 font-mono text-[7px] font-semibold tracking-wide text-deep-500">
          {code.toUpperCase()}
        </span>
      )}
    </span>
  );
}

export function AnalyzeWorkbench() {
  const upload = useDocumentUpload();
  const realAnalysis = useRealAnalysis();
  const [selectedMarketCode, setSelectedMarketCode] = useState("DE");
  const selectedMarket =
    MARKET_OPTIONS.find((market) => market.code === selectedMarketCode) ??
    MARKET_OPTIONS[0];

  const resetRealAnalysis = realAnalysis.reset;

  useEffect(() => {
    resetRealAnalysis();
  }, [upload.document, resetRealAnalysis]);

  const sourceText =
    upload.parseState.status === "ready" ? upload.parseState.text : null;
  const aiLoading = realAnalysis.state.status === "loading";
  const aiError =
    realAnalysis.state.status === "error" ? realAnalysis.state : null;
  const canAnalyze = upload.isReady && !aiLoading;
  const reportResult =
    realAnalysis.state.status === "success" ? realAnalysis.state.result : null;

  let aiLabel = "开始 AI 检测";
  if (!upload.document) {
    aiLabel = "请先上传文件";
  } else if (upload.parseState.status === "error") {
    aiLabel = "请先处理解析错误";
  } else if (!upload.isReady) {
    aiLabel = "正在解析文件…";
  } else if (aiLoading) {
    aiLabel = "AI 正在检测…";
  } else if (realAnalysis.state.status === "success") {
    aiLabel = "重新进行 AI 检测";
  } else if (realAnalysis.state.status === "error") {
    aiLabel = "重试 AI 检测";
  }

  const actionHint = !upload.document
    ? "上传并解析文件后，即可开始 AI 检测。"
    : aiLoading
      ? "正在等待 DeepSeek 返回；本次请求不会自动重试。"
      : !upload.isReady
        ? "文件解析完成后才能开始 AI 检测。"
        : realAnalysis.state.status === "error"
          ? "AI 检测失败；本次不会生成报告，请检查错误后重试。"
          : realAnalysis.state.status === "success"
            ? "报告已生成；可更换文件或重新检测。"
            : "开始 AI 检测会将解析后的文本发送给 DeepSeek，并结合知识库进行检测；结果需人工复核。";

  function handleAnalyze() {
    if (!canAnalyze || upload.parseState.status !== "ready") {
      return;
    }

    void realAnalysis.analyze(
      upload.parseState.text,
      selectedMarket.code,
      CONTENT_TYPE,
    );
  }

  function handleChangeFile() {
    realAnalysis.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRedetect() {
    handleAnalyze();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const marketCard = (
    <Card className="gap-0 overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/85 p-0 shadow-[0_20px_50px_rgba(15,76,95,0.05)]">
      <div className="flex items-start justify-between gap-3 border-b border-deep-100 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-deep-950 font-mono text-[10px] font-semibold text-aqua-300">
            01
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-deep-950">
              目标市场选择
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-deep-500">
              选择内容面向的国家或地区；系统会结合知识库与 DeepSeek 进行检测。
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-aqua-200 bg-aqua-50 text-[10px] text-aqua-700"
        >
          知识库检测
        </Badge>
      </div>

      <div className="p-4 sm:p-5">
        <label className="block rounded-xl border border-deep-200 bg-white px-3 py-2.5 focus-within:border-aqua-400">
          <span className="block text-[10px] text-deep-400">目标市场</span>
          <span className="mt-1 flex items-center gap-2">
            <Globe aria-hidden="true" className="size-4 shrink-0 text-aqua-600" />
            <select
              value={selectedMarketCode}
              onChange={(event) => setSelectedMarketCode(event.target.value)}
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-deep-800 outline-none"
            >
              {MARKET_OPTIONS.map((market) => (
                <option key={market.code} value={market.code}>
                  {market.name}（{market.code}）· 知识库检测
                </option>
              ))}
            </select>
          </span>
        </label>

        <div className="mt-3 rounded-xl border border-deep-100 bg-deep-50/40 px-3 py-2.5 text-xs leading-6 text-deep-500">
          系统会结合知识库条目与 DeepSeek 上下文复核；检测结果需人工复核。
        </div>
      </div>
    </Card>
  );

  const actionCard = (
    <div className="rounded-[1.7rem] border border-white/80 bg-white/85 p-4 shadow-[0_20px_50px_rgba(15,76,95,0.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-deep-700">
            <Sparkles aria-hidden="true" className="size-4 text-aqua-600" />
            准备开始 AI 检测
          </p>
          <p className="mt-1 text-xs leading-5 text-deep-400">
            解析完成后，系统会结合知识库与 DeepSeek 生成结构化报告。
          </p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-aqua-200 bg-aqua-50 font-mono text-[9px] tracking-wider text-aqua-700"
        >
          AI
        </Badge>
      </div>

      <Button
        type="button"
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="mt-3 h-11 w-full justify-between rounded-xl bg-[#2563eb] px-4 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]"
      >
        {aiLabel}
        {aiLoading ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
      </Button>

      <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-5 text-deep-400">
        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        {actionHint}
      </p>
    </div>
  );

  const competitorCard = (
    <Link
      href="/competitors"
      className="group block rounded-[1.7rem] border border-aqua-100 bg-[linear-gradient(135deg,rgba(236,253,248,0.9),rgba(244,250,255,0.9))] p-4 shadow-[0_18px_42px_rgba(15,76,95,0.04)] transition-all hover:border-aqua-200 hover:shadow-[0_22px_50px_rgba(15,76,95,0.07)]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-aqua-100 bg-gradient-to-br from-aqua-100 to-white text-aqua-700 shadow-[0_8px_18px_rgba(15,76,95,0.06)] transition-transform duration-300 group-hover:scale-105">
          <Radar aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-deep-950">
              市场竞品分析
            </h2>
            <span className="rounded-full border border-aqua-100 bg-white/70 px-1.5 py-0.5 font-mono text-[9px] text-aqua-600">
              00
            </span>
            <Badge
              variant="outline"
              className="border-aqua-200 bg-white/70 px-2 py-0.5 text-[10px] font-normal text-aqua-700"
            >
              独立工作台
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-deep-600">
            还没有广告词？先看看{selectedMarket.name}同类产品在说什么，再回来做合规预检。
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-deep-500">
            <span className="rounded-full border border-aqua-100 bg-white/70 px-2 py-0.5">
              Tavily 真实网页
            </span>
            <span className="rounded-full border border-aqua-100 bg-white/70 px-2 py-0.5">
              DeepSeek 营销策略
            </span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-aqua-200 bg-white/75 px-2.5 py-1.5 text-xs font-medium text-aqua-800 transition-colors group-hover:bg-white">
          去看看
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </span>
      </div>
    </Link>
  );

  const workspaceHeader = (
    <div className="mb-6 flex flex-col gap-5 print:hidden lg:mb-7 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-aqua-700 uppercase">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-aqua-500"
          />
          Content risk workspace
        </p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-deep-950 sm:text-4xl">
          内容合规预检工作台
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-deep-500">
          上传对外传播文案，选择目标市场，先完成文本解析，再按需发起 DeepSeek AI 初筛。{MARKET_OPTIONS.length} 个市场统一使用知识库检测，结果需人工复核。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-deep-200 bg-white/80 px-2.5 py-1 text-[11px] font-normal text-deep-600"
        >
          <LockKeyhole aria-hidden="true" className="size-3.5" />
          解析后不保存
        </Badge>
        <Badge
          variant="outline"
          className="border-deep-200 bg-white/80 px-2.5 py-1 text-[11px] font-normal text-deep-600"
        >
          <FileText aria-hidden="true" className="size-3.5" />
          服务端文本解析
        </Badge>
        <Badge
          variant="outline"
          className="border-aqua-200 bg-aqua-50 px-2.5 py-1 text-[11px] font-normal text-aqua-700"
        >
          <ScanText aria-hidden="true" className="size-3.5" />
          DeepSeek AI 初筛
        </Badge>
      </div>
    </div>
  );

  const workspaceFooter = (
    <p className="mt-6 flex items-start gap-1.5 text-[11px] leading-5 text-deep-400 print:hidden">
      <Info
        aria-hidden="true"
        className="mt-0.5 size-3.5 shrink-0 text-deep-400"
      />
      文件解析后不保存。AI 检测会将解析后的文本发送给 DeepSeek，并结合知识库；结果仅供初筛、需人工复核，不构成法律或合规意见。
    </p>
  );

  if (reportResult) {
    const reportNumber = formatReportNumber(
      reportResult.analyzedAt,
      reportResult.market,
    );
    const detectionTime = formatReportDateTime(reportResult.analyzedAt);

    return (
      <div className="mx-auto w-full max-w-[92rem]">
        <div className="mb-4 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-[0_12px_32px_rgba(15,76,95,0.05)] print:hidden sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-deep-950 text-aqua-300">
                <FileText aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-deep-900">
                  {upload.document?.file.name ?? "未命名文件"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-deep-400">
                  <Globe aria-hidden="true" className="size-3" />
                  {getMarketName(reportResult.market)}（{reportResult.market}）
                  <span aria-hidden="true">/</span>
                  <span className="inline-flex items-center gap-1 text-aqua-700">
                    <Check aria-hidden="true" className="size-3" />
                    检测完成
                  </span>
                </p>
              </div>
            </div>

            <span
              aria-hidden="true"
              className="hidden h-6 w-px bg-deep-100 sm:block"
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-deep-400">
              <span>检测时间：{detectionTime}</span>
              <span>
                报告编号：
                <span className="font-mono text-deep-600">{reportNumber}</span>
              </span>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleChangeFile}
                className="h-8 border-deep-200 bg-white px-2.5 text-xs text-deep-600 hover:bg-deep-50"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                更换文件
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRedetect}
                disabled={!canAnalyze}
                className="h-8 bg-[#2563eb] px-2.5 text-xs text-white hover:bg-[#1d4ed8]"
              >
                <RefreshCw aria-hidden="true" className="size-3.5" />
                重新检测
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="h-8 bg-deep-950 px-2.5 text-xs text-white hover:bg-deep-800"
              >
                <Printer aria-hidden="true" className="size-3.5" />
                打印 / 保存 PDF
              </Button>
            </div>
          </div>
        </div>

        <Link
          href="/competitors"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-aqua-100 bg-[linear-gradient(135deg,rgba(236,253,248,0.9),rgba(244,250,255,0.9))] px-4 py-3 shadow-[0_14px_36px_rgba(15,76,95,0.04)] transition-colors hover:border-aqua-200 print:hidden"
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/80 text-aqua-700">
              <Radar aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-deep-900">
                修改没思路？去看看同类产品在
                {getMarketName(reportResult.market)}市场怎么说
              </p>
              <p className="mt-0.5 text-xs leading-5 text-deep-500">
                用竞品营销雷达查真实网页表达，再回来继续修改和复检。
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-aqua-800">
            打开竞品雷达
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </span>
        </Link>

        <RealReportPanel
          state={realAnalysis.state}
          document={upload.document}
          ready={upload.isReady}
          sourceText={sourceText}
          reportNumber={reportNumber}
          onRetry={handleAnalyze}
          onClear={handleChangeFile}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[92rem]">
      {workspaceHeader}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          {competitorCard}
          {marketCard}
          <UploadPanel upload={upload} />
          {actionCard}

          {aiError && (
            <div
              role="alert"
              className="rounded-2xl border border-risk-200 bg-risk-50 px-4 py-3.5 sm:px-5"
            >
              <p className="text-base font-semibold text-risk-700">
                AI 检测未完成
              </p>
              <p className="mt-1 text-sm leading-6 text-risk-600">
                {aiError.message}
              </p>
              <p className="mt-1 font-mono text-[11px] text-risk-500">
                错误代码：{aiError.code}
              </p>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!upload.isReady}
                className="mt-3 h-8 bg-[#2563eb] px-3 text-xs text-white hover:bg-[#1d4ed8]"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                重试 AI 检测
              </Button>
            </div>
          )}
        </div>

        <DetectionGuide />
      </div>
      {workspaceFooter}
    </div>
  );
}
