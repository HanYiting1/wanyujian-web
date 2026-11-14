import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Globe,
  Info,
  Languages,
  Layers,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MARKET_OPTIONS } from "@/lib/analysis/markets";
import { cn } from "@/lib/utils";

const germany = MARKET_OPTIONS[0];

const marketCoverage = [
  {
    code: "de",
    name: germany.name,
    englishName: germany.englishName,
    status: "已开放",
    available: true,
    detail: "历史语境 · 广告合规 · 语言歧义",
  },
  {
    code: "fr",
    name: "法国",
    englishName: "France",
    status: "规划中",
    available: false,
    detail: "本地规则接入中",
  },
  {
    code: "jp",
    name: "日本",
    englishName: "Japan",
    status: "规划中",
    available: false,
    detail: "本地规则接入中",
  },
  {
    code: "ae",
    name: "阿联酋",
    englishName: "UAE",
    status: "规划中",
    available: false,
    detail: "本地规则接入中",
  },
  {
    code: "es",
    name: "西班牙",
    englishName: "Spain",
    status: "规划中",
    available: false,
    detail: "本地规则接入中",
  },
] as const;

type MarketDisplay = (typeof marketCoverage)[number];

const countryPositions: Record<MarketDisplay["code"], string> = {
  de: "left-[4%] top-[16%]",
  fr: "right-[2%] top-[14%]",
  es: "left-[1%] top-[46%]",
  jp: "right-[1%] top-[45%]",
  ae: "right-[13%] bottom-[13%]",
};

const featureTags = [
  {
    icon: Layers,
    label: "历史语境",
    className: "left-[25%] top-[3%]",
  },
  {
    icon: ShieldCheck,
    label: "广告合规",
    className: "right-[13%] top-[7%]",
  },
  {
    icon: Languages,
    label: "语言歧义",
    className: "bottom-[27%] left-[1%]",
  },
  {
    icon: CircleCheck,
    label: "事实核验",
    className: "right-[2%] bottom-[29%]",
  },
] as const;

const workflow = [
  {
    step: "01",
    icon: Upload,
    title: "上传待检内容",
    description:
      "拖拽或选择 TXT、DOCX、PDF 文件，单文件不超过 5 MB。上传后由服务端提取纯文本并生成可编辑预览。",
    detail: "TXT · DOCX · PDF / ≤ 5 MB",
  },
  {
    step: "02",
    icon: Globe,
    title: "选择目标市场",
    description:
      "从已开放的市场中选择目标市场，系统按当地文化语境、广告规则与语言习惯进行预检。更多市场正在接入本地知识。",
    detail: "当前已开放：德国",
  },
  {
    step: "03",
    icon: Scale,
    title: "查看风险与依据",
    description:
      "以结构化报告呈现风险等级、原文位置、判断依据和修改建议，支持团队快速评审与落地。",
    detail: "风险报告 · 修改建议 · 知识库依据",
  },
] as const;

const processSteps = [
  { icon: Upload, title: "上传内容", detail: "TXT / DOCX / PDF" },
  { icon: Globe, title: "选择市场", detail: "已开放市场" },
  { icon: ShieldCheck, title: "风险预检", detail: "文化与合规" },
  { icon: FileText, title: "生成报告", detail: "结构化输出" },
] as const;

function MarketFlag({
  code,
  className,
}: {
  code: MarketDisplay["code"];
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-8 shrink-0 overflow-hidden rounded-full border border-white/90 bg-white shadow-[0_4px_12px_rgba(15,76,95,0.12)]",
        className,
      )}
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
      {code === "jp" && (
        <span className="flex h-full w-full items-center justify-center bg-white">
          <span className="size-3.5 rounded-full bg-[#dc2626]" />
        </span>
      )}
      {code === "ae" && (
        <span className="flex h-full w-full">
          <span className="h-full w-1/4 bg-[#d32f2f]" />
          <span className="flex h-full flex-1 flex-col">
            <span className="flex-1 bg-[#2e7d32]" />
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#111827]" />
          </span>
        </span>
      )}
      {code === "es" && (
        <span className="flex h-full w-full flex-col">
          <span className="flex-1 bg-[#dc2626]" />
          <span className="flex-[2] bg-[#fbbf24]" />
          <span className="flex-1 bg-[#dc2626]" />
        </span>
      )}
    </span>
  );
}

function CountryChip({
  market,
  className,
}: {
  market: MarketDisplay;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 hidden items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-2.5 py-2 shadow-[0_12px_30px_rgba(20,80,100,0.10)] backdrop-blur-sm sm:flex",
        className,
      )}
    >
      <MarketFlag code={market.code} className="size-7" />
      <div className="min-w-0">
        <p className="text-[11px] leading-none font-semibold text-deep-900">
          {market.name}
        </p>
        <p className="mt-1 text-[9px] leading-none text-deep-400">
          {market.englishName}
        </p>
      </div>
    </div>
  );
}

function FeatureTag({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute z-10 hidden items-center gap-1.5 rounded-full border border-aqua-200/70 bg-white/85 px-3 py-1.5 text-[10px] font-medium text-deep-600 shadow-[0_8px_24px_rgba(15,76,95,0.08)] backdrop-blur-sm lg:inline-flex",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5 text-aqua-600" />
      {label}
    </span>
  );
}

function GlobeVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[38rem] xl:max-w-none">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(240,252,249,0.72),rgba(235,247,255,0.74))] p-3 shadow-[0_32px_90px_rgba(18,86,104,0.12)] backdrop-blur-sm sm:p-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-aqua-200/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-[#ffe2ea]/40 blur-3xl"
        />

        <div className="relative h-[26rem] overflow-hidden rounded-[1.8rem] bg-white/30 sm:h-[30rem]">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
            viewBox="0 0 600 430"
          >
            <ellipse
              cx="300"
              cy="215"
              rx="235"
              ry="112"
              stroke="#6ed7c8"
              strokeOpacity="0.32"
            />
            <ellipse
              cx="300"
              cy="215"
              rx="180"
              ry="82"
              stroke="#8edfd4"
              strokeOpacity="0.24"
            />
            <ellipse
              cx="300"
              cy="215"
              rx="250"
              ry="118"
              stroke="#b9dff7"
              strokeOpacity="0.34"
              transform="rotate(-18 300 215)"
            />
            <path
              d="M62 252C133 137 227 96 327 108C424 120 520 176 552 245"
              stroke="#7ad9ca"
              strokeOpacity="0.28"
              strokeDasharray="3 7"
            />
            <circle cx="132" cy="174" r="3.5" fill="#12b8a0" fillOpacity="0.7" />
            <circle cx="474" cy="147" r="3" fill="#62c9b8" fillOpacity="0.7" />
            <circle cx="503" cy="264" r="3.5" fill="#8fbce1" fillOpacity="0.8" />
            <circle cx="116" cy="286" r="2.8" fill="#9fd7cc" fillOpacity="0.8" />
          </svg>

          <div className="absolute left-1/2 top-[48%] size-[16rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/90 bg-[radial-gradient(circle_at_34%_28%,#ffffff_0%,#e8fbf6_26%,#d5f2ed_58%,#dcebfb_100%)] shadow-[inset_0_0_60px_rgba(69,201,183,0.18),0_30px_80px_rgba(22,93,110,0.12)] sm:size-[20rem]">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 360 360"
            >
              <defs>
                <pattern
                  id="globeDots"
                  width="7"
                  height="7"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="1.2"
                    cy="1.2"
                    r="1.05"
                    fill="#129f8a"
                    fillOpacity="0.42"
                  />
                </pattern>
                <clipPath id="globeClip">
                  <circle cx="180" cy="180" r="178" />
                </clipPath>
              </defs>
              <g clipPath="url(#globeClip)">
                <g fill="url(#globeDots)">
                  <path d="M58 108C72 83 105 74 130 84C148 91 151 108 140 119C130 129 111 126 99 138C88 149 75 143 67 131C61 122 52 117 58 108Z" />
                  <path d="M128 167C145 166 157 179 155 195C153 212 143 228 136 245C131 257 123 254 121 241C117 225 112 210 116 195C119 181 120 169 128 167Z" />
                  <path d="M167 78C190 61 225 59 255 70C278 79 307 80 316 101C324 119 308 133 288 139C270 144 254 137 238 149C220 162 198 157 186 141C172 123 150 99 167 78Z" />
                  <path d="M201 157C219 153 237 165 241 184C245 203 233 222 223 239C214 253 205 251 199 236C192 217 188 197 192 178C194 168 196 160 201 157Z" />
                  <path d="M282 230C296 224 315 232 319 247C322 262 309 273 294 270C279 267 270 248 282 230Z" />
                </g>
                <g
                  fill="none"
                  stroke="#5fcbbb"
                  strokeOpacity="0.22"
                  strokeWidth="1"
                >
                  <ellipse cx="180" cy="180" rx="173" ry="57" />
                  <ellipse cx="180" cy="180" rx="173" ry="103" />
                  <ellipse cx="180" cy="180" rx="112" ry="173" />
                  <ellipse cx="180" cy="180" rx="57" ry="173" />
                  <path d="M180 7v346M7 180h346" strokeOpacity="0.1" />
                </g>
                <g
                  fill="none"
                  stroke="#5fcbbb"
                  strokeOpacity="0.34"
                  strokeDasharray="3 7"
                >
                  <path d="M79 137C126 93 186 83 242 112C276 130 300 158 312 190" />
                  <path d="M92 251C138 218 196 214 255 239C280 250 300 268 313 286" />
                </g>
                <g fill="#12b8a0" fillOpacity="0.62">
                  <circle cx="91" cy="144" r="3" />
                  <circle cx="243" cy="110" r="2.5" />
                  <circle cx="313" cy="190" r="3" />
                  <circle cx="97" cy="248" r="2.5" />
                  <circle cx="255" cy="239" r="3" />
                  <circle cx="313" cy="286" r="2.5" />
                </g>
              </g>
            </svg>
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.55),transparent_45%)]" />
          </div>

          <div className="absolute left-1/2 top-[48%] z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl border border-white/90 bg-white/90 p-1.5 shadow-[0_16px_40px_rgba(15,76,95,0.16)] backdrop-blur-sm">
              <div className="grid size-14 place-items-center rounded-xl bg-gradient-to-br from-aqua-300 via-aqua-400 to-aqua-500 text-[17px] font-semibold tracking-[-0.08em] text-deep-950">
                文A
              </div>
            </div>
          </div>

          {marketCoverage.map((market) => (
            <CountryChip
              key={market.code}
              market={market}
              className={countryPositions[market.code]}
            />
          ))}

          {featureTags.map((tag) => (
            <FeatureTag
              key={tag.label}
              icon={tag.icon}
              label={tag.label}
              className={tag.className}
            />
          ))}
        </div>

        <div className="relative z-10 mt-2 flex flex-wrap justify-center gap-1.5 sm:hidden">
          {marketCoverage.map((market) => (
            <span
              key={market.code}
              className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/80 px-2 py-1 text-[9px] text-deep-600"
            >
              <MarketFlag code={market.code} className="size-5" />
              {market.name}
            </span>
          ))}
        </div>

        <div className="relative z-10 mt-3 rounded-2xl border border-white/80 bg-white/75 p-2.5 shadow-[0_10px_30px_rgba(20,80,100,0.06)] backdrop-blur-sm sm:p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative flex items-center gap-2 rounded-xl px-2 py-1.5"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-aqua-50 text-aqua-700">
                    <Icon aria-hidden="true" className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-deep-800">
                      {step.title}
                    </p>
                    <p className="truncate text-[9px] text-deep-400">
                      {step.detail}
                    </p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="absolute top-1/2 -right-1.5 hidden size-3 -translate-y-1/2 text-deep-300 sm:block"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#fbfdfd]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_8%_8%,rgba(255,220,230,0.55),transparent_30%),radial-gradient(circle_at_92%_10%,rgba(194,246,234,0.65),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(210,231,255,0.60),transparent_45%),linear-gradient(180deg,#fff9fa_0%,#f7fcfb_54%,#eff8fb_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-32 -left-24 size-72 rounded-full bg-[#ffe1e9]/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-aqua-200/25 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-[92rem] gap-12 px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36 lg:pb-24 xl:grid-cols-[0.95fr_1.05fr] xl:items-center xl:gap-16">
            <div className="max-w-[36rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-aqua-200/70 bg-white/60 px-3.5 py-1.5 text-[10px] font-medium tracking-[0.16em] text-aqua-800 uppercase backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-aqua-500" />
                Multilingual pre-flight check
              </div>

              <h1 className="mt-7 text-[2.4rem] leading-[1.14] font-semibold tracking-[-0.045em] text-deep-950 sm:text-5xl lg:text-[3.4rem]">
                <span className="block">帮助品牌在发布前</span>
                <span className="mt-1 block text-[#2563eb]">
                  识别跨文化与合规风险。
                </span>
              </h1>

              <p className="mt-5 text-base font-medium text-deep-700 sm:text-lg">
                多语言内容预检 · 文化语境分析 · 合规与表达风险评估
              </p>

              <p className="mt-4 max-w-[34rem] text-sm leading-7 text-deep-500 sm:text-[15px]">
                面向出海与全球传播的内容风险预检平台。上传一份文案，结合目标市场的历史语境、广告合规与语言歧义，快速识别潜在风险并生成可执行建议，让品牌沟通更安全、更恰当、更有效。
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/analyze"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 rounded-xl bg-[#2563eb] px-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] hover:bg-[#1d4ed8]",
                  )}
                >
                  开始检测
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 rounded-xl border-deep-200 bg-white/70 px-6 text-[15px] text-deep-800 hover:bg-white",
                  )}
                >
                  了解工作方式
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-deep-500">
                <Globe
                  aria-hidden="true"
                  className="size-3.5 text-aqua-700"
                />
                <span className="font-medium text-deep-700">德国已开放</span>
                <span className="text-deep-300">·</span>
                <span>法国 / 日本 / 阿联酋 / 西班牙规划中</span>
                <Link
                  href="#markets"
                  className="inline-flex items-center gap-0.5 text-aqua-800 transition-colors hover:text-aqua-900"
                >
                  查看市场
                  <ChevronRight aria-hidden="true" className="size-3" />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-deep-400">
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole aria-hidden="true" className="size-3" />
                  解析后不保存
                </span>
                <span aria-hidden="true">/</span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck aria-hidden="true" className="size-3" />
                  结果需人工复核
                </span>
              </div>
            </div>

            <GlobeVisual />
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-white">
          <div className="mx-auto max-w-[92rem] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex w-fit items-center rounded-full border border-aqua-100 bg-aqua-50 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-aqua-800 uppercase">
                How it works
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-deep-950 sm:text-4xl lg:text-[2.8rem]">
                不是聊天，是一份可执行的预检报告。
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-deep-600">
                每一条风险都对应明确的原文位置、判断依据和修改方向。预检结果可以直接进入文案评审，而不是停在对话记录里。
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.step}
                    className="gap-0 overflow-hidden rounded-[1.7rem] border border-deep-100/80 bg-white p-6 shadow-[0_20px_50px_rgba(15,76,95,0.04)] ring-0 transition-shadow hover:shadow-[0_24px_60px_rgba(15,76,95,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-aqua-50 text-aqua-700">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.16em] text-aqua-300">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-deep-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-deep-600">
                      {item.description}
                    </p>
                    <div className="mt-5 flex items-center gap-2 border-t border-deep-100 pt-4 text-[11px] text-deep-400">
                      <FileText aria-hidden="true" className="size-3.5" />
                      {item.detail}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="markets"
          className="scroll-mt-24 bg-[linear-gradient(180deg,#f7fcfb_0%,#f1faf8_100%)]"
        >
          <div className="mx-auto max-w-[92rem] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-16">
              <div>
                <div className="inline-flex w-fit items-center rounded-full border border-aqua-100 bg-white/70 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-aqua-800 uppercase">
                  Market coverage
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-deep-950 sm:text-4xl">
                  支持市场
                </h2>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-deep-600">
                  覆盖主要出海市场的文化语境、广告合规与语言歧义。已接入知识与检测链路的德国市场先行开放，其他市场在完成本地规则与知识库接入后陆续开放。
                </p>
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/80 bg-white/55 px-3.5 py-3 text-xs leading-5 text-deep-500">
                  <Info
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-aqua-700"
                  />
                  仅德国已开放；其他市场状态为规划中，当前不会出现在检测选项中。
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {marketCoverage.map((market) => (
                  <div
                    key={market.code}
                    className={cn(
                      "flex min-h-[8.5rem] flex-col justify-between rounded-2xl border bg-white/85 p-3.5 shadow-[0_12px_30px_rgba(15,76,95,0.04)]",
                      market.available
                        ? "border-aqua-200"
                        : "border-white/80",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <MarketFlag
                        code={market.code}
                        className="size-9"
                      />
                      <div className="min-w-0">
                        <p className="text-sm leading-none font-semibold text-deep-900">
                          {market.name}
                        </p>
                        <p className="mt-1 text-[9px] leading-none text-deep-400">
                          {market.englishName}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-[9px] leading-4 text-deep-400">
                        {market.detail}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-2 text-[9px]",
                          market.available
                            ? "border-aqua-200 bg-aqua-50 text-aqua-800"
                            : "border-deep-100 bg-deep-50 text-deep-500",
                        )}
                      >
                        {market.available && (
                          <Check aria-hidden="true" className="size-2.5" />
                        )}
                        {market.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="knowledge"
              className="mt-10 grid scroll-mt-24 gap-6 rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_20px_50px_rgba(15,76,95,0.04)] backdrop-blur-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
            >
              <div>
                <div className="inline-flex w-fit items-center rounded-full border border-aqua-100 bg-aqua-50 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-aqua-800 uppercase">
                  Knowledge enhancement
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-deep-950">
                  知识库增强，不是让模型凭空判断。
                </h3>
                <p className="mt-3 text-sm leading-6 text-deep-600">
                  德国本地知识库先做规则候选，再由 DeepSeek
                  做上下文复核。来源只从本地知识库关联，并在报告中标注审核状态。
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  {
                    icon: BookOpen,
                    title: "本地文化语境",
                    detail: "历史、宗教与表达习惯的候选线索",
                  },
                  {
                    icon: ShieldCheck,
                    title: "广告合规规则",
                    detail: "规则命中只作候选，不直接判定违法",
                  },
                  {
                    icon: CircleCheck,
                    title: "事实参考",
                    detail: "事实条目与来源审核状态随报告展示",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-deep-100/70 bg-white/80 p-4"
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-aqua-50 text-aqua-700">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <p className="mt-3 text-xs font-semibold text-deep-800">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-deep-500">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f1faf8_0%,#ffffff_100%)]">
          <div className="mx-auto max-w-[92rem] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#e9fbf6_0%,#eef6ff_55%,#fff1f4_100%)] p-7 shadow-[0_24px_70px_rgba(15,76,95,0.07)] sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 right-1/3 size-64 rounded-full bg-white/50 blur-3xl"
              />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-aqua-800 uppercase">
                    Start with one document
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep-950 sm:text-3xl">
                    让下一条出海文案，先过一遍风险预检。
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-deep-500">
                    支持真实文件解析、DeepSeek AI
                    初筛与本地知识库复核。结果需人工复核，不构成法律意见。
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                  <Link
                    href="/analyze"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-11 shrink-0 rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(37,99,235,0.2)] hover:bg-[#1d4ed8]",
                    )}
                  >
                    开始检测
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <span className="text-[10px] text-deep-400">
                    文件解析后不保存 · 结果需人工复核
                  </span>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-10 bottom-4 hidden h-36 w-48 lg:block"
              >
                <div className="absolute top-4 right-14 h-28 w-24 rotate-[-7deg] rounded-2xl border border-white/80 bg-white/70 p-3 shadow-[0_18px_40px_rgba(15,76,95,0.10)]">
                  <div className="h-1.5 w-12 rounded-full bg-aqua-300/70" />
                  <div className="mt-3 space-y-2">
                    <div className="h-1.5 w-16 rounded-full bg-deep-100" />
                    <div className="h-1.5 w-12 rounded-full bg-deep-100" />
                    <div className="h-1.5 w-14 rounded-full bg-deep-100" />
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 grid size-16 place-items-center rounded-2xl border border-aqua-100 bg-white/85 text-aqua-600 shadow-[0_18px_40px_rgba(15,76,95,0.12)]">
                  <ShieldCheck className="size-7" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-deep-100/80 bg-white">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Brand />
            <span className="hidden h-4 w-px bg-deep-200 sm:block" />
            <p className="text-xs text-deep-500">多语言跨文化 AI 风险预检</p>
          </div>
          <p className="max-w-xl text-xs leading-5 text-deep-400">
            AI 检测调用 DeepSeek 并结合本地知识库，结果需人工复核；文件仅用于文本解析，解析后不保存；检测结果不构成法律或合规意见。
          </p>
        </div>
      </footer>
    </div>
  );
}
