"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AnalysisRisk,
  AnalyzeApiError,
  AnalyzeApiSuccess,
  EvidenceStatus,
  KnowledgeKind,
  KnowledgeReviewStatus,
  MarketCode,
  RiskKnowledge,
  RiskLevel,
} from "@/lib/analysis/types";

const CLIENT_TIMEOUT_MS = 60_000;

export type RealAnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AnalyzeApiSuccess }
  | { status: "error"; code: string; message: string };

export interface RealAnalysisController {
  state: RealAnalysisState;
  analyze: (
    text: string,
    market: MarketCode,
    contentType: string,
  ) => Promise<void>;
  reset: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "high" || value === "medium" || value === "low";
}

function isEvidenceStatus(value: unknown): value is EvidenceStatus {
  return value === "verified" || value === "unverified";
}

function isKnowledgeKind(value: unknown): value is KnowledgeKind {
  return (
    value === "culture" || value === "advertising" || value === "fact"
  );
}

function isKnowledgeReviewStatus(
  value: unknown,
): value is KnowledgeReviewStatus {
  return value === "pending" || value === "reviewed" || value === "unknown";
}

function isRiskKnowledge(value: unknown): value is RiskKnowledge {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.market === "DE" &&
    isKnowledgeKind(value.kind) &&
    typeof value.category === "string" &&
    (value.subcategory === null || typeof value.subcategory === "string") &&
    (value.riskLevel === null || isRiskLevel(value.riskLevel)) &&
    isKnowledgeReviewStatus(value.reviewStatus) &&
    typeof value.description === "string" &&
    (value.commonError === null || typeof value.commonError === "string") &&
    typeof value.reviewNotes === "string" &&
    (value.sourceText === null || typeof value.sourceText === "string") &&
    (value.sourceUrl === null || typeof value.sourceUrl === "string") &&
    typeof value.timeSensitive === "boolean"
  );
}

function isAnalysisRisk(value: unknown): value is AnalysisRisk {
  return (
    isRecord(value) &&
    typeof value.quote === "string" &&
    isRiskLevel(value.level) &&
    typeof value.category === "string" &&
    typeof value.reason === "string" &&
    typeof value.suggestion === "string" &&
    isEvidenceStatus(value.evidenceStatus) &&
    typeof value.quoteVerified === "boolean" &&
    (value.ruleId === null || typeof value.ruleId === "string") &&
    (value.knowledge === null || isRiskKnowledge(value.knowledge))
  );
}

function isAnalyzeApiSuccess(value: unknown): value is AnalyzeApiSuccess {
  return (
    isRecord(value) &&
    typeof value.summary === "string" &&
    Array.isArray(value.risks) &&
    value.risks.every(isAnalysisRisk) &&
    typeof value.rewrittenText === "string" &&
    value.market === "DE" &&
    typeof value.contentType === "string" &&
    typeof value.model === "string" &&
    Array.isArray(value.warnings) &&
    value.warnings.every((warning) => typeof warning === "string") &&
    typeof value.analyzedAt === "string"
  );
}

function isAnalyzeApiError(value: unknown): value is AnalyzeApiError {
  return (
    isRecord(value) &&
    typeof value.error === "string" &&
    typeof value.code === "string"
  );
}

export function useRealAnalysis(): RealAnalysisController {
  const [state, setState] = useState<RealAnalysisState>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(
    async (text: string, market: MarketCode, contentType: string) => {
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ status: "loading" });

      let timedOut = false;
      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, CLIENT_TIMEOUT_MS);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, market, contentType }),
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);

        if (controllerRef.current !== controller) {
          return;
        }

        if (!response.ok) {
          setState({
            status: "error",
            code: isAnalyzeApiError(payload) ? payload.code : "HTTP_ERROR",
            message: isAnalyzeApiError(payload)
              ? payload.error
              : `AI 检测失败（HTTP ${response.status}）。`,
          });
          return;
        }

        if (!isAnalyzeApiSuccess(payload)) {
          setState({
            status: "error",
            code: "INVALID_RESPONSE",
            message: "AI 检测接口返回了无法识别的结果，请稍后重试。",
          });
          return;
        }

        setState({ status: "success", result: payload });
      } catch (error) {
        if (controllerRef.current !== controller) {
          return;
        }

        if (timedOut) {
          setState({
            status: "error",
            code: "CLIENT_TIMEOUT",
            message: "AI 检测超时，请稍后重试。",
          });
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          status: "error",
          code: "NETWORK_ERROR",
          message: "无法连接 AI 检测服务，请稍后重试。",
        });
      } finally {
        window.clearTimeout(timeoutId);
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState({ status: "idle" });
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  return { state, analyze, reset };
}
