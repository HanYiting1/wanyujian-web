import { NextResponse } from "next/server";
import { z } from "zod";
import type { AnalyzeApiSuccess } from "@/lib/analysis/types";
import { analyzeMarketingContent, LlmError } from "@/lib/llm";

const analyzeRequestSchema = z.object({
  text: z.string().trim().min(1).max(10_000),
  market: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .transform((value) => value.toUpperCase()),
  contentType: z.string().trim().min(1).max(50),
});

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

function errorResponse(status: number, code: string, error: string) {
  return NextResponse.json(
    { error, code },
    { status, headers: NO_STORE_HEADERS },
  );
}

function invalidInputMessage(issues: z.core.$ZodIssue[]): string {
  const issue = issues[0];
  const field = issue?.path[0];

  if (field === "market") {
    return "market 必须是 2–8 个字符的市场代码。";
  }

  if (field === "text") {
    return "text 必须是 1–10,000 字符的待分析文本。";
  }

  if (field === "contentType") {
    return "contentType 必须是 1–50 字符的内容类型。";
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
    const result = await analyzeMarketingContent({
      text: parsed.data.text,
      contentType: parsed.data.contentType,
      market: parsed.data.market,
    });

    const payload: AnalyzeApiSuccess = {
      summary: result.summary,
      risks: result.risks,
      rewrittenText: result.rewrittenText,
      market: parsed.data.market,
      contentType: parsed.data.contentType,
      model: result.model,
      warnings: result.warnings,
      analyzedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof LlmError) {
      return errorResponse(error.status, error.code, error.message);
    }

    console.error(
      "POST /api/analyze failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return errorResponse(500, "ANALYZE_FAILED", "AI 检测失败，请稍后重试。");
  }
}
