import { NextResponse } from "next/server";
import {
  formatFileSize,
  getDocumentKind,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/analysis/files";
import type { ParseApiSuccess } from "@/lib/analysis/types";
import { extractText, FileParseError } from "@/lib/file-parsers";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

function errorResponse(status: number, code: string, error: string) {
  return NextResponse.json(
    { error, code },
    { status, headers: NO_STORE_HEADERS },
  );
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      400,
      "INVALID_FORM_DATA",
      "请求格式无效，请使用 multipart/form-data 上传文件。",
    );
  }

  const entry = formData.get("file");
  if (!(entry instanceof File)) {
    return errorResponse(
      400,
      "FILE_REQUIRED",
      "缺少文件，请通过 file 字段上传。",
    );
  }

  if (entry.size === 0) {
    return errorResponse(422, "EMPTY_FILE", "上传的文件为空。");
  }

  if (entry.size > MAX_FILE_SIZE_BYTES) {
    return errorResponse(
      413,
      "FILE_TOO_LARGE",
      `文件为 ${formatFileSize(entry.size)}，超过单文件 5 MB 的上限。`,
    );
  }

  const kind = getDocumentKind(entry.name);
  if (!kind) {
    return errorResponse(
      415,
      "UNSUPPORTED_FILE_TYPE",
      "仅支持 .txt、.docx、.pdf 格式的文件。",
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await entry.arrayBuffer());
  } catch {
    return errorResponse(
      400,
      "FILE_READ_FAILED",
      "无法读取上传的文件内容，请重新选择文件。",
    );
  }

  try {
    const parsed = await extractText(buffer, kind);
    const payload: ParseApiSuccess = {
      filename: entry.name,
      text: parsed.text,
      charCount: parsed.text.length,
      warnings: parsed.warnings,
    };

    return NextResponse.json(payload, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof FileParseError) {
      return errorResponse(error.status, error.code, error.message);
    }

    console.error("POST /api/parse failed", error);
    return errorResponse(
      500,
      "PARSE_FAILED",
      "文件解析失败，请稍后重试。",
    );
  }
}
