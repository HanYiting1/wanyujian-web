import type { Metadata } from "next";
import { AnalyzeWorkbench } from "@/components/analyze/workbench";
import { SiteHeader } from "@/components/site-header";
import { WorkbenchTypeScale } from "@/components/workbench-type-scale";

export const metadata: Metadata = {
  title: "检测工作台",
  description:
    "上传 TXT、DOCX 或 PDF 文件，由服务端提取文本，并通过 DeepSeek 与本地知识库进行营销内容 AI 初步风险识别。",
};

export default function AnalyzePage() {
  return (
    <div className="workbench-type-scale min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_8%_6%,rgba(255,224,235,0.35),transparent_28%),radial-gradient(circle_at_92%_10%,rgba(194,246,234,0.45),transparent_36%),linear-gradient(180deg,#fffafb_0%,#f5fbfa_55%,#eef8fb_100%)]">
      <WorkbenchTypeScale />
      <SiteHeader variant="workspace" />

      <main className="relative mx-auto max-w-[92rem] px-4 pt-6 pb-12 sm:px-6 sm:pt-8 lg:px-8">
        <AnalyzeWorkbench />
      </main>
    </div>
  );
}
