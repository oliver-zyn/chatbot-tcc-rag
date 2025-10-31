/**
 * Formata o tamanho de um arquivo em bytes para uma string legível
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB", "250 KB")
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1572864) // "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Retorna o label formatado para um tipo de arquivo
 * @param fileType - Extensão do arquivo (ex: "pdf", "docx", "txt")
 * @returns Label em maiúsculas (ex: "PDF", "DOCX", "TXT")
 * @example
 * getFileTypeLabel("pdf") // "PDF"
 * getFileTypeLabel("docx") // "DOCX"
 */
export function getFileTypeLabel(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type === "pdf") return "PDF";
  if (type === "docx" || type === "doc") return "DOCX";
  if (type === "txt") return "TXT";
  return fileType.toUpperCase();
}

/**
 * Retorna o nome do ícone apropriado para um tipo de arquivo
 * Compatível com lucide-react icons
 * @param fileType - Extensão do arquivo
 * @returns Nome do ícone do lucide-react
 * @example
 * getFileTypeIconName("pdf") // "FileType"
 * getFileTypeIconName("txt") // "File"
 */
export function getFileTypeIconName(fileType: string): "FileType" | "FileText" | "File" {
  const type = fileType.toLowerCase();
  if (type === "pdf") return "FileType";
  if (type === "docx" || type === "doc") return "FileText";
  if (type === "txt") return "File";
  return "File";
}
