import type { Metadata } from "next";
import { CompetitorRadar } from "@/components/competitors/competitor-radar";
import { SiteHeader } from "@/components/site-header";
import { WorkbenchTypeScale } from "@/components/workbench-type-scale";

export const metadata: Metadata = {
  title: "竞品营销雷达",
  description:
    "基于 Tavily 公开网页搜索与 DeepSeek 的竞品营销策略分析工作台，独立于万语鉴风险检测系统。",
};

export default function CompetitorsPage() {
  return (
    <div className="workbench-type-scale min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_8%_6%,rgba(255,224,235,0.35),transparent_28%),radial-gradient(circle_at_92%_10%,rgba(194,246,234,0.45),transparent_36%),linear-gradient(180deg,#fffafb_0%,#f5fbfa_55%,#eef8fb_100%)]">
      <WorkbenchTypeScale />
      <SiteHeader variant="workspace" />

      <main className="relative mx-auto max-w-[92rem] px-4 pt-6 pb-12 sm:px-6 sm:pt-8 lg:px-8">
        <CompetitorRadar />
      </main>
    </div>
  );
}
