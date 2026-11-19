import { NextResponse } from "next/server";
import { z } from "zod";
import {
  analyzeCompetitorSources,
  CompetitorAnalysisError,
} from "@/lib/competitors/analysis";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

const sourceSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z
    .string()
    .trim()
    .min(1)
    .max(2_000)
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "url 必须是有效的 http(s) 网页地址"),
  snippet: z.string().trim().max(2_000),
  score: z.number().finite().min(0).max(1).optional().nullable(),
});

const analyzeRequestSchema = z.object({
  product: z.string().trim().min(1).max(100),
  market: z.string().trim().min(1).max(50),
  industry: z.string().trim().min(1).max(60),
  results: z.array(sourceSchema).min(1).max(5),
});

function errorResponse(status: number, code: string, error: string) {
  return NextResponse.json(
    { error, code },
    { status, headers: NO_STORE_HEADERS },
  );
}

function invalidInputMessage(issues: z.core.$ZodIssue[]): string {
  const issue = issues[0];
  const field = issue?.path[0];

  if (field === "product") {
    return "product 必须是 1–100 字符的产品关键词。";
  }
  if (field === "market") {
    return "请先选择目标市场。";
  }
  if (field === "industry") {
    return "industry 必须是 1–60 字符的行业名称。";
  }
  if (field === "results" && issue?.path.includes("url")) {
    return "竞品来源必须是有效的 http(s) 网页地址。";
  }
  if (field === "results") {
    return "请选择 1–5 条真实竞品搜索结果后再生成分析。";
  }

  return "请求参数无效。";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_JSON",
      "请求体必须是有效的 JSON。",
    );
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      422,
      "INVALID_INPUT",
      invalidInputMessage(parsed.error.issues),
    );
  }

  try {
    const analysis = await analyzeCompetitorSources(parsed.data);
    return NextResponse.json({ analysis }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof CompetitorAnalysisError) {
      return errorResponse(error.status, error.code, error.message);
    }

    console.error(
      "POST /api/competitors/analyze failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return errorResponse(
      500,
      "COMPETITOR_ANALYSIS_FAILED",
      "AI 营销策略分析失败，请稍后重试；本次竞品搜索结果不会受影响。",
    );
  }
}
