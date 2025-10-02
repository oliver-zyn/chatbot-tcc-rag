export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_FILE_EXTENSIONS = {
  "text/plain": [".txt"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
} as const;

export const ACCEPTED_EXTENSIONS_STRING = Object.values(
  ACCEPTED_FILE_EXTENSIONS
)
  .flat()
  .join(",");

export const FILE_TYPE_LABELS: Record<string, string> = {
  "text/plain": "TXT",
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
};

export function isAcceptedFileType(mimeType: string): boolean {
  return ACCEPTED_FILE_TYPES.includes(
    mimeType as (typeof ACCEPTED_FILE_TYPES)[number]
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
