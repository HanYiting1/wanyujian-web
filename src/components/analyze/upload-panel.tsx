"use client";

import {
  CircleExclamationPoint,
  FileText,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Trash,
  TriangleExclamationPoint,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DocumentUpload } from "@/hooks/use-document-upload";
import {
  ACCEPTED_EXTENSIONS,
  formatFileSize,
  MAX_EXTRACTED_TEXT_LENGTH,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/analysis/files";
import type { DocumentKind } from "@/lib/analysis/types";
import { cn } from "@/lib/utils";

interface UploadPanelProps {
  upload: DocumentUpload;
}

interface StatusView {
  label: string;
  className: string;
  dotClassName: string;
}

const KIND_DESCRIPTIONS: Record<DocumentKind, string> = {
  txt: "纯文本 · 服务端解析",
  docx: "Word 文档 · 服务端解析",
  pdf: "PDF 文档 · 服务端解析",
};

function getStatusView(upload: DocumentUpload): StatusView {
  if (!upload.document) {
    return {
      label: "未选择文件",
      className: "border-deep-200 bg-deep-50 text-deep-500",
      dotClassName: "bg-deep-300",
    };
  }

  if (upload.parseState.status === "parsing") {
    return {
      label: "正在解析文件",
      className: "border-aqua-200 bg-aqua-50 text-aqua-700",
      dotClassName: "animate-pulse bg-aqua-500",
    };
  }

  if (upload.parseState.status === "error") {
    return {
      label: "文件解析失败",
      className: "border-risk-200 bg-risk-50 text-risk-700",
      dotClassName: "bg-risk-500",
    };
  }

  if (upload.parseState.status === "ready") {
    return {
      label: "文本解析完成",
      className: "border-aqua-200 bg-aqua-50 text-aqua-700",
      dotClassName: "bg-aqua-500",
    };
  }

  return {
    label: "已选择文件",
    className: "border-deep-200 bg-deep-50 text-deep-600",
    dotClassName: "bg-deep-400",
  };
}

export function UploadPanel({ upload }: UploadPanelProps) {
  const document = upload.document;
  const status = getStatusView(upload);

  return (
    <Card className="gap-0 overflow-hidden border border-deep-100 p-0 shadow-[0_14px_36px_rgba(7,30,42,0.05)]">
      <div className="flex items-start justify-between gap-3 border-b border-deep-100 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-deep-950 font-mono text-[10px] font-semibold text-aqua-300">
            02
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-deep-950">上传待检内容</h2>
            <p className="mt-0.5 text-[11px] text-deep-500">
              单文件 ≤ {MAX_FILE_SIZE_LABEL} · 提取 ≤{" "}
              {MAX_EXTRACTED_TEXT_LENGTH.toLocaleString("zh-CN")} 字符
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0 text-[10px] font-medium", status.className)}
        >
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", status.dotClassName)}
          />
          {status.label}
        </Badge>
      </div>

      <div className="p-4 sm:p-5">
        {!document ? (
          <div
            {...upload.getRootProps({
              "aria-label": "拖拽或点击选择待检测文件",
            })}
            className={cn(
              "group flex min-h-[13rem] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-8 text-center transition-all outline-none focus-visible:ring-4",
              upload.isDragActive
                ? "border-aqua-500 bg-aqua-50 ring-4 ring-aqua-500/10"
                : "border-deep-200 bg-deep-50/50 hover:border-aqua-400 hover:bg-aqua-50/60 focus-visible:border-aqua-500 focus-visible:ring-aqua-500/15",
            )}
          >
            <input {...upload.getInputProps()} />
            <span
              className={cn(
                "grid size-12 place-items-center rounded-2xl border bg-white shadow-sm transition-colors",
                upload.isDragActive
                  ? "border-aqua-200 text-aqua-600"
                  : "border-deep-100 text-deep-500 group-hover:text-aqua-600",
              )}
            >
              {upload.isDragActive ? (
                <FileText aria-hidden="true" className="size-5" />
              ) : (
                <Upload aria-hidden="true" className="size-5" />
              )}
            </span>
            <p className="mt-4 text-sm font-medium text-deep-800">
              {upload.isDragActive
                ? "松开鼠标，添加文件"
                : "拖拽文件到这里，或点击选择"}
            </p>
            <p className="mt-1.5 text-xs text-deep-500">
              支持 TXT、DOCX、PDF 三种格式
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {ACCEPTED_EXTENSIONS.map((extension) => (
                <span
                  key={extension}
                  className="rounded-md border border-deep-100 bg-white px-2 py-1 font-mono text-[10px] font-medium tracking-wide text-deep-500 uppercase"
                >
                  {extension}
                </span>
              ))}
              <span className="rounded-md border border-deep-100 bg-white px-2 py-1 text-[10px] text-deep-500">
                单文件 ≤ {MAX_FILE_SIZE_LABEL}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-deep-100 bg-white p-3.5 sm:p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-deep-950 text-aqua-300">
                <FileText aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p
                    className="max-w-full truncate text-sm font-medium text-deep-900"
                    title={document.file.name}
                  >
                    {document.file.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-deep-200 bg-deep-50 font-mono text-[9px] text-deep-500 uppercase"
                  >
                    {document.kind}
                  </Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-deep-500">
                  <span>{formatFileSize(document.file.size)}</span>
                  <span aria-hidden="true" className="text-deep-300">
                    /
                  </span>
                  <span>{KIND_DESCRIPTIONS[document.kind]}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={upload.removeDocument}
                aria-label={`删除文件 ${document.file.name}`}
                className="shrink-0 text-deep-400 hover:bg-risk-50 hover:text-risk-600"
              >
                <Trash aria-hidden="true" className="size-4" />
              </Button>
            </div>

            <div
              {...upload.getRootProps({
                "aria-label": "拖拽或点击替换当前文件",
              })}
              className={cn(
                "mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-[11px] transition-colors outline-none focus-visible:ring-4",
                upload.isDragActive
                  ? "border-aqua-500 bg-aqua-50 text-aqua-700"
                  : "border-deep-200 bg-deep-50/40 text-deep-500 hover:border-aqua-400 hover:bg-aqua-50/50 hover:text-deep-700 focus-visible:border-aqua-500 focus-visible:ring-aqua-500/15",
              )}
            >
              <input {...upload.getInputProps()} />
              <Upload aria-hidden="true" className="size-3.5" />
              {upload.isDragActive
                ? "松开鼠标，替换当前文件"
                : "拖入新文件，或点击替换"}
            </div>
          </>
        )}

        {upload.error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-risk-200 bg-risk-50 p-3"
          >
            <CircleExclamationPoint
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-risk-600"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-risk-700">
                {upload.error.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-risk-600">
                {upload.error.message}
              </p>
            </div>
            <button
              type="button"
              onClick={upload.clearError}
              aria-label="关闭错误提示"
              className="shrink-0 rounded p-0.5 text-risk-500 transition-colors hover:bg-risk-100 hover:text-risk-700 focus-visible:ring-2 focus-visible:ring-risk-300 focus-visible:outline-none"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        )}

        {document && (
          <>
            {upload.parseState.status === "parsing" && (
              <div
                role="status"
                className="mt-3 flex items-center gap-2.5 rounded-xl border border-aqua-100 bg-aqua-50/50 p-3.5"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin text-aqua-600"
                />
                <div>
                  <p className="text-xs font-medium text-deep-800">
                    服务端正在解析文件…
                  </p>
                  <p className="mt-0.5 text-[11px] text-deep-500">
                    正在从 {document.kind.toUpperCase()}{" "}
                    文件中提取纯文本，请稍候。
                  </p>
                </div>
              </div>
            )}

            {upload.parseState.status === "error" && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2.5 rounded-xl border border-risk-200 bg-risk-50 p-3.5"
              >
                <CircleExclamationPoint
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-risk-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-risk-700">
                    文件解析失败
                  </p>
                  <p className="mt-0.5 text-[11px] leading-5 text-risk-600">
                    {upload.parseState.message}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={upload.retryParse}
                  className="h-7 shrink-0 border-risk-200 bg-white px-2 text-[11px] text-risk-700 hover:bg-risk-50"
                >
                  <RotateCcw aria-hidden="true" className="size-3" />
                  重试解析
                </Button>
              </div>
            )}

            {upload.parseState.status === "ready" && (
              <>
                <div className="mt-3 overflow-hidden rounded-xl border border-deep-100 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-deep-100 bg-deep-50/50 px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-deep-600">
                      <FileText
                        aria-hidden="true"
                        className="size-3.5 text-aqua-600"
                      />
                      只读文本预览
                    </span>
                    <span className="text-[10px] text-deep-400">
                      {upload.parseState.charCount.toLocaleString("zh-CN")}{" "}
                      字符
                    </span>
                  </div>
                  {upload.parseState.text.trim().length > 0 ? (
                    <pre
                      aria-label={`${document.kind.toUpperCase()} 文件文本预览`}
                      className="max-h-56 overflow-auto px-3.5 py-3 font-sans text-xs leading-6 break-words whitespace-pre-wrap text-deep-700"
                    >
                      {upload.parseState.text}
                    </pre>
                  ) : (
                    <p className="px-3.5 py-6 text-center text-xs text-deep-400">
                      文件内容为空，或只包含空白字符。
                    </p>
                  )}
                </div>

                {upload.parseState.warnings.length > 0 && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                      <TriangleExclamationPoint
                        aria-hidden="true"
                        className="size-3.5"
                      />
                      解析提示
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-5 text-amber-700">
                      {upload.parseState.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-deep-400">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 size-3 shrink-0 text-deep-400"
          />
          文件会发送到服务端解析接口，仅用于本次文本提取，不保存；刷新页面后需重新选择。
        </p>
      </div>
    </Card>
  );
}
