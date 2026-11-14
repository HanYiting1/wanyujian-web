"use client";

import { useEffect } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  Globe,
  Info,
  LoaderCircle,
  LockKeyhole,
  Printer,
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
import { cn } from "@/lib/utils";

const germany = MARKET_OPTIONS[0];
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

function formatReportNumber(value: string): string {
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

  return `WYJ-DE-${getPart("year")}${getPart("month")}${getPart("day")}-${getPart("hour")}${getPart("minute")}${getPart("second")}`;
}

const marketOptions = [
  {
    flag: "de",
    name: germany.name,
    englishName: germany.englishName,
    status: "已开放",
    available: true,
  },
  {
    flag: "fr",
    name: "法国",
    englishName: "France",
    status: "规划中",
    available: false,
  },
  {
    flag: "es",
    name: "西班牙",
    englishName: "Spain",
    status: "规划中",
    available: false,
  },
  {
    flag: "jp",
    name: "日本",
    englishName: "Japan",
    status: "规划中",
    available: false,
  },
] as const;

function WorkbenchFlag({ code }: { code: "de" | "fr" | "es" | "jp" }) {
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
    </span>
  );
}

export function AnalyzeWorkbench() {
  const upload = useDocumentUpload();
  const realAnalysis = useRealAnalysis();

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
            : "开始 AI 检测会将解析后的文本发送给 DeepSeek，并结合本地知识库；结果需人工复核。";

  function handleAnalyze() {
    if (!canAnalyze || upload.parseState.status !== "ready") {
      return;
    }

    void realAnalysis.analyze(
      upload.parseState.text,
      germany.code,
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
            <h2 className="text-sm font-semibold text-deep-950">
              目标市场选择
            </h2>
            <p className="mt-0.5 text-[11px] leading-5 text-deep-500">
              选择内容所面向的国家或地区，匹配当地法规、文化语境与广告合规规则。
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div
          role="radiogroup"
          aria-label="目标市场"
          className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        >
          {marketOptions.map((market) => (
            <div
              key={market.flag}
              role="radio"
              aria-checked={market.available}
              aria-disabled={!market.available}
              aria-label={`${market.name}，${market.status}`}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5",
                market.available
                  ? "border-aqua-300 bg-aqua-50/50 ring-1 ring-aqua-500/10"
                  : "border-deep-100 bg-deep-50/30",
              )}
            >
              <WorkbenchFlag code={market.flag} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-deep-900">
                  {market.name}
                </p>
                <p className="mt-0.5 truncate text-[9px] text-deep-400">
                  {market.englishName}
                </p>
              </div>
              {market.available ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-aqua-600 text-white">
                  <Check aria-hidden="true" className="size-3" />
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-deep-50 px-1.5 py-0.5 text-[8px] text-deep-400">
                  规划中
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] leading-4 text-deep-400">
            当前仅德国可发起检测；其他市场为规划中。
          </p>
          <span className="text-[10px] text-deep-400">
            更多市场逐步接入
          </span>
        </div>
      </div>
    </Card>
  );

  const actionCard = (
    <div className="rounded-[1.7rem] border border-white/80 bg-white/85 p-4 shadow-[0_20px_50px_rgba(15,76,95,0.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-deep-700">
            <Sparkles aria-hidden="true" className="size-3.5 text-aqua-600" />
            准备开始 AI 检测
          </p>
          <p className="mt-1 text-[10px] leading-4 text-deep-400">
            解析完成后，DeepSeek 将结合本地知识库生成结构化报告。
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
        className="mt-3 h-11 w-full justify-between rounded-xl bg-[#2563eb] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]"
      >
        {aiLabel}
        {aiLoading ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
      </Button>

      <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-4 text-deep-400">
        <Info aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
        {actionHint}
      </p>
    </div>
  );

  const workspaceHeader = (
    <div className="mb-6 flex flex-col gap-5 print:hidden lg:mb-7 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-aqua-700 uppercase">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-aqua-500"
          />
          Content risk workspace
        </p>
        <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-deep-950 sm:text-3xl">
          内容合规预检工作台
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-500">
          上传对外传播文案，选择目标市场，先完成文本解析，再按需发起 DeepSeek AI 初筛。当前德国市场已开放，其他市场规划中；报告仅在 AI 检测成功后生成。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-deep-200 bg-white/80 px-2.5 py-1 text-[10px] font-normal text-deep-600"
        >
          <LockKeyhole aria-hidden="true" className="size-3" />
          解析后不保存
        </Badge>
        <Badge
          variant="outline"
          className="border-deep-200 bg-white/80 px-2.5 py-1 text-[10px] font-normal text-deep-600"
        >
          <FileText aria-hidden="true" className="size-3" />
          服务端文本解析
        </Badge>
        <Badge
          variant="outline"
          className="border-aqua-200 bg-aqua-50 px-2.5 py-1 text-[10px] font-normal text-aqua-700"
        >
          <ScanText aria-hidden="true" className="size-3" />
          DeepSeek AI 初筛
        </Badge>
      </div>
    </div>
  );

  const workspaceFooter = (
    <p className="mt-6 flex items-start gap-1.5 text-[10px] leading-5 text-deep-400 print:hidden">
      <Info
        aria-hidden="true"
        className="mt-0.5 size-3 shrink-0 text-deep-400"
      />
      文件解析后不保存。AI 检测会将解析后的文本发送给 DeepSeek，并结合本地知识库；结果仅供初筛、需人工复核，不构成法律或合规意见。
    </p>
  );

  if (reportResult) {
    const reportNumber = formatReportNumber(reportResult.analyzedAt);
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
                <p className="truncate text-sm font-semibold text-deep-900">
                  {upload.document?.file.name ?? "未命名文件"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-deep-400">
                  <Globe aria-hidden="true" className="size-3" />
                  德国（DE）
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

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-deep-400">
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
                className="h-8 border-deep-200 bg-white px-2.5 text-[11px] text-deep-600 hover:bg-deep-50"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                更换文件
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRedetect}
                disabled={!canAnalyze}
                className="h-8 bg-[#2563eb] px-2.5 text-[11px] text-white hover:bg-[#1d4ed8]"
              >
                <RefreshCw aria-hidden="true" className="size-3.5" />
                重新检测
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="h-8 bg-deep-950 px-2.5 text-[11px] text-white hover:bg-deep-800"
              >
                <Printer aria-hidden="true" className="size-3.5" />
                打印 / 保存 PDF
              </Button>
            </div>
          </div>
        </div>

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
          {marketCard}
          <UploadPanel upload={upload} />
          {actionCard}

          {aiError && (
            <div
              role="alert"
              className="rounded-2xl border border-risk-200 bg-risk-50 px-4 py-3.5 sm:px-5"
            >
              <p className="text-sm font-semibold text-risk-700">
                AI 检测未完成
              </p>
              <p className="mt-1 text-xs leading-5 text-risk-600">
                {aiError.message}
              </p>
              <p className="mt-1 font-mono text-[10px] text-risk-500">
                错误代码：{aiError.code}
              </p>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!upload.isReady}
                className="mt-3 h-8 bg-[#2563eb] px-3 text-[11px] text-white hover:bg-[#1d4ed8]"
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
