import mammoth from "mammoth";
import {
  FormatError,
  InvalidPDFException,
  PasswordException,
  PDFParse,
  VerbosityLevel,
} from "pdf-parse";
import {
  MAX_EXTRACTED_TEXT_LENGTH,
  normalizeText,
} from "@/lib/analysis/files";
import type { DocumentKind } from "@/lib/analysis/types";

// This module is imported only by the server-side /api/parse route.
// Keep mammoth / pdf-parse out of the client bundle.

export class FileParseError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "FileParseError";
    this.status = status;
    this.code = code;
  }
}

interface ParsedText {
  text: string;
  warnings: string[];
}

const PDF_SIGNATURE = Buffer.from("%PDF-");
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04] as const;

const EMPTY_TEXT_MESSAGES: Record<DocumentKind, string> = {
  txt: "TXT 文件内容为空，或只包含空白字符。",
  docx: "DOCX 文档中没有可提取的文本，请确认文档不是纯图片或空文档。",
  pdf: "PDF 中没有可提取的文本，可能是扫描版或仅包含图片。",
};

function hasZipSignature(buffer: Buffer): boolean {
  return (
    buffer.length >= ZIP_SIGNATURE.length &&
    ZIP_SIGNATURE.every((byte, index) => buffer[index] === byte)
  );
}

function assertPdfSignature(buffer: Buffer): void {
  const header = buffer.subarray(0, Math.min(buffer.length, 1024));
  if (!header.includes(PDF_SIGNATURE)) {
    throw new FileParseError(
      422,
      "INVALID_PDF",
      "文件内容不是有效的 PDF，请确认文件未损坏后重试。",
    );
  }
}

function assertDocxSignature(buffer: Buffer): void {
  if (!hasZipSignature(buffer)) {
    throw new FileParseError(
      422,
      "INVALID_DOCX",
      "文件内容不是有效的 DOCX，请确认文件未损坏后重试。",
    );
  }
}

function parseTxt(buffer: Buffer): ParsedText {
  if (buffer.includes(0)) {
    throw new FileParseError(
      422,
      "INVALID_TXT",
      "TXT 文件中包含二进制内容，请上传纯文本文件。",
    );
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    throw new FileParseError(
      422,
      "INVALID_TXT_ENCODING",
      "TXT 文件不是有效的 UTF-8 编码，请转换为 UTF-8 后重试。",
    );
  }

  return { text, warnings: [] };
}

async function parseDocx(buffer: Buffer): Promise<ParsedText> {
  assertDocxSignature(buffer);

  try {
    const result = await mammoth.extractRawText({ buffer });
    const warnings =
      result.messages.length > 0
        ? ["文档中的部分样式、图片或嵌入对象未包含在纯文本预览中。"]
        : [];

    return { text: result.value, warnings };
  } catch {
    throw new FileParseError(
      422,
      "DOCX_PARSE_FAILED",
      "无法解析该 DOCX 文件，请确认文件未损坏且为有效的 Word 文档。",
    );
  }
}

async function parsePdf(buffer: Buffer): Promise<ParsedText> {
  assertPdfSignature(buffer);

  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    verbosity: VerbosityLevel.ERRORS,
  });

  try {
    const result = await parser.getText({ pageJoiner: "" });
    const emptyPages = result.pages.filter(
      (page) => page.text.trim().length === 0,
    ).length;
    const warnings =
      emptyPages > 0
        ? [`有 ${emptyPages} 页未提取到文本，可能包含扫描图片。`]
        : [];

    return { text: result.text, warnings };
  } catch (error) {
    if (error instanceof PasswordException) {
      throw new FileParseError(
        422,
        "PDF_PASSWORD_REQUIRED",
        "该 PDF 已加密，无法提取文本。请移除密码后重新上传。",
      );
    }

    if (error instanceof InvalidPDFException || error instanceof FormatError) {
      throw new FileParseError(
        422,
        "INVALID_PDF",
        "PDF 文件结构无效或已损坏，无法提取文本。",
      );
    }

    throw new FileParseError(
      422,
      "PDF_PARSE_FAILED",
      "无法解析该 PDF 文件，请确认文件未损坏后重试。",
    );
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export async function extractText(
  buffer: Buffer,
  kind: DocumentKind,
): Promise<ParsedText> {
  if (buffer.length === 0) {
    throw new FileParseError(422, "EMPTY_FILE", "上传的文件内容为空。");
  }

  const parsed =
    kind === "txt"
      ? parseTxt(buffer)
      : kind === "docx"
        ? await parseDocx(buffer)
        : await parsePdf(buffer);

  const text = normalizeText(parsed.text).trim();
  if (text.length === 0) {
    throw new FileParseError(422, "EMPTY_TEXT", EMPTY_TEXT_MESSAGES[kind]);
  }

  if (text.length > MAX_EXTRACTED_TEXT_LENGTH) {
    throw new FileParseError(
      422,
      "TEXT_TOO_LONG",
      `提取出的文本为 ${text.length.toLocaleString("zh-CN")} 字符，超过 ${MAX_EXTRACTED_TEXT_LENGTH.toLocaleString("zh-CN")} 字符上限。系统不会自动截断，请精简文件后重试。`,
    );
  }

  return {
    text,
    warnings: Array.from(new Set(parsed.warnings)),
  };
}
