import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const uploadDocumentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Arquivo muito grande. Máximo 10MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Tipo de arquivo não suportado. Use TXT, PDF ou DOCX"
    ),
});

export const deleteDocumentSchema = z.object({
  documentId: z.uuid("ID de documento inválido"),
});
