"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ErrorCode,
  useDropzone,
  type DropzoneState,
  type FileRejection,
} from "react-dropzone";
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_FILE_TYPES,
  formatFileSize,
  getDocumentKind,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/analysis/files";
import type {
  ParseApiError,
  ParseApiSuccess,
  SelectedDocument,
} from "@/lib/analysis/types";

export interface UploadError {
  title: string;
  message: string;
}

export type TextParseState =
  | { status: "idle" }
  | { status: "parsing" }
  | {
      status: "ready";
      text: string;
      charCount: number;
      warnings: string[];
    }
  | { status: "error"; message: string };

export interface DocumentUpload {
  document: SelectedDocument | null;
  parseState: TextParseState;
  error: UploadError | null;
  isDragActive: boolean;
  isReady: boolean;
  getRootProps: DropzoneState["getRootProps"];
  getInputProps: DropzoneState["getInputProps"];
  openFileDialog: () => void;
  removeDocument: () => void;
  retryParse: () => void;
  clearError: () => void;
}

function describeRejection(rejection: FileRejection): UploadError {
  const extensionList = ACCEPTED_EXTENSIONS.join(" / ");
  const firstError = rejection.errors[0];

  switch (firstError?.code) {
    case ErrorCode.FileInvalidType:
      return {
        title: "文件格式不支持",
        message: `“${rejection.file.name}”无法读取。请选择 ${extensionList} 格式的文件。`,
      };
    case ErrorCode.FileTooLarge:
      return {
        title: "文件超过大小限制",
        message: `“${rejection.file.name}”为 ${formatFileSize(rejection.file.size)}，超过单文件 ${MAX_FILE_SIZE_LABEL} 的上限。`,
      };
    case ErrorCode.TooManyFiles:
      return {
        title: "一次只能添加一个文件",
        message: "请只保留一个文件；如需替换，请先删除当前文件。",
      };
    default:
      return {
        title: "文件未能添加",
        message: "请确认文件格式与大小后重试。",
      };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isParseApiError(value: unknown): value is ParseApiError {
  return (
    isRecord(value) &&
    typeof value.error === "string" &&
    typeof value.code === "string"
  );
}

function isParseApiSuccess(value: unknown): value is ParseApiSuccess {
  return (
    isRecord(value) &&
    typeof value.filename === "string" &&
    typeof value.text === "string" &&
    typeof value.charCount === "number" &&
    Number.isFinite(value.charCount) &&
    Array.isArray(value.warnings) &&
    value.warnings.every((warning) => typeof warning === "string")
  );
}

export function useDocumentUpload(): DocumentUpload {
  const [document, setDocument] = useState<SelectedDocument | null>(null);
  const [parseState, setParseState] = useState<TextParseState>({
    status: "idle",
  });
  const [error, setError] = useState<UploadError | null>(null);
  const [parseAttempt, setParseAttempt] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        setError(describeRejection(rejections[0]));
        return;
      }

      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      const kind = getDocumentKind(file.name);
      if (!kind) {
        setError({
          title: "文件格式不支持",
          message: `请选择 ${ACCEPTED_EXTENSIONS.join(" / ")} 格式的文件。`,
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError({
          title: "文件超过大小限制",
          message: `“${file.name}”为 ${formatFileSize(file.size)}，超过单文件 ${MAX_FILE_SIZE_LABEL} 的上限。`,
        });
        return;
      }

      setError(null);
      setParseAttempt(0);
      setDocument({ file, kind });
      setParseState({ status: "parsing" });
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: 1,
    multiple: false,
    noPaste: true,
    useFsAccessApi: false,
    onDrop,
  });

  useEffect(() => {
    if (!document) {
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;
    const file = document.file;

    async function parseDocument() {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/parse", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);

        if (isCancelled) {
          return;
        }

        if (!response.ok) {
          setParseState({
            status: "error",
            message: isParseApiError(payload)
              ? payload.error
              : `文件解析失败（HTTP ${response.status}）。`,
          });
          return;
        }

        if (!isParseApiSuccess(payload)) {
          setParseState({
            status: "error",
            message: "解析接口返回了无法识别的数据，请稍后重试。",
          });
          return;
        }

        setParseState({
          status: "ready",
          text: payload.text,
          charCount: payload.charCount,
          warnings: payload.warnings,
        });
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setParseState({
          status: "error",
          message: "无法连接文件解析服务，请确认服务正在运行后重试。",
        });
      }
    }

    void parseDocument();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [document, parseAttempt]);

  const removeDocument = useCallback(() => {
    setDocument(null);
    setParseState({ status: "idle" });
    setError(null);
    setParseAttempt(0);
  }, []);

  const retryParse = useCallback(() => {
    if (!document) {
      return;
    }

    setParseState({ status: "parsing" });
    setParseAttempt((attempt) => attempt + 1);
  }, [document]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isReady = document !== null && parseState.status === "ready";

  return {
    document,
    parseState,
    error,
    isDragActive,
    isReady,
    getRootProps,
    getInputProps,
    openFileDialog: open,
    removeDocument,
    retryParse,
    clearError,
  };
}
