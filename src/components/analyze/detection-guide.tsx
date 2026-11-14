import {
  FileText,
  Megaphone,
  Scale,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const guideSteps: {
  icon: LucideIcon;
  title: string;
  english: string;
  detail: string;
}[] = [
  {
    icon: Scale,
    title: "风险识别",
    english: "Risk identification",
    detail: "基于目标市场的法规、广告合规与语言语境，识别潜在风险点。",
  },
  {
    icon: ScanText,
    title: "原文定位",
    english: "Source mapping",
    detail: "在原文中高亮风险内容，明确对应位置与问题类型。",
  },
  {
    icon: ShieldCheck,
    title: "依据与建议",
    english: "Basis & suggestions",
    detail: "提供风险依据与可操作的修改建议，保留知识库审核状态。",
  },
  {
    icon: FileText,
    title: "生成报告",
    english: "Generate report",
    detail: "输出结构化风险报告，包含风险等级、具体说明与修改建议。",
  },
];

export function DetectionGuide() {
  return (
    <aside className="min-w-0 xl:sticky xl:top-24">
      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(160deg,rgba(246,255,252,0.94),rgba(242,250,255,0.92))] p-5 shadow-[0_24px_60px_rgba(15,76,95,0.07)] backdrop-blur-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-aqua-700 uppercase">
              What happens next
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-deep-950 sm:text-2xl">
              检测流程与输出
            </h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-deep-500">
              上传并解析文件后，系统会自动完成规则候选与语义复核，生成可复核的风险报告。
            </p>
          </div>
          <span className="hidden rounded-full border border-aqua-100 bg-white/80 px-2.5 py-1 text-[9px] whitespace-nowrap text-aqua-700 sm:inline-flex">
            AI + KB
          </span>
        </div>

        <div
          aria-hidden="true"
          className="relative mt-5 h-40 overflow-hidden rounded-[1.5rem] border border-white/80 bg-[radial-gradient(circle_at_50%_60%,rgba(133,236,216,0.34),transparent_56%)]"
        >
          <div className="absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-aqua-200/50 bg-white/25" />
          <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-aqua-200/40" />
          <div className="absolute top-7 left-1/2 h-24 w-20 -translate-x-1/2 rotate-[-7deg] rounded-2xl border border-white/90 bg-white/85 p-3 shadow-[0_18px_36px_rgba(15,76,95,0.12)]">
            <div className="h-1.5 w-10 rounded-full bg-aqua-300/80" />
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-12 rounded-full bg-deep-100" />
              <div className="h-1.5 w-9 rounded-full bg-deep-100" />
              <div className="h-1.5 w-11 rounded-full bg-deep-100" />
            </div>
          </div>
          <div className="absolute right-[18%] bottom-5 grid size-16 place-items-center rounded-2xl border border-aqua-100 bg-white/90 text-aqua-600 shadow-[0_16px_34px_rgba(15,76,95,0.14)]">
            <ShieldCheck className="size-8" strokeWidth={1.8} />
          </div>
          <div className="absolute bottom-6 left-[16%] grid size-10 place-items-center rounded-xl border border-white/80 bg-white/75 text-aqua-700 shadow-sm">
            <ScanText className="size-4" />
          </div>
        </div>

        <ol className="relative mt-5 space-y-4 border-l border-aqua-100/80 pl-5">
          {guideSteps.map((step) => {
            const Icon = step.icon;

            return (
              <li key={step.title} className="relative">
                <span className="absolute top-0 -left-[2.05rem] grid size-6 place-items-center rounded-full border border-aqua-100 bg-[#f4fdfa] text-aqua-700">
                  <Icon aria-hidden="true" className="size-3" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="text-sm font-semibold text-deep-900">
                    {step.title}
                  </p>
                  <span className="text-[9px] text-deep-400">
                    {step.english}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-deep-500">
                  {step.detail}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/80 bg-white/65 px-3.5 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-aqua-50 text-aqua-700">
            <Megaphone aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-deep-800">
              更多能力持续上线
            </p>
            <p className="mt-1 text-[10px] leading-5 text-deep-500">
              后续将支持更多国家与行业场景，并提供团队协作与报告管理。
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
