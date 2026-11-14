import type { DocumentKind } from "@/lib/analysis/types";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "5 MB";
export const MAX_EXTRACTED_TEXT_LENGTH = 10_000;

export const ACCEPTED_EXTENSIONS = [".txt", ".docx", ".pdf"] as const;

export const ACCEPTED_FILE_TYPES: Record<string, readonly string[]> = {
  "text/plain": [".txt"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const EXTENSION_TO_KIND: Record<string, DocumentKind> = {
  ".txt": "txt",
  ".docx": "docx",
  ".pdf": "pdf",
};

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot).toLowerCase();
}

export function getDocumentKind(fileName: string): DocumentKind | null {
  return EXTENSION_TO_KIND[getFileExtension(fileName)] ?? null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${Math.round(kilobytes)} KB`;
  }

  const megabytes = kilobytes / 1024;
  const digits = megabytes >= 10 ? 0 : 1;
  return `${megabytes.toFixed(digits).replace(/\.0$/, "")} MB`;
}

export function normalizeText(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}
