import { z } from "zod";
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from "@/lib/constants/documents";

export const uploadDocumentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Arquivo muito grande. Máximo 10MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type as typeof ACCEPTED_FILE_TYPES[number]),
      "Tipo de arquivo não suportado. Use TXT, PDF ou DOCX"
    ),
});

export const deleteDocumentSchema = z.object({
  documentId: z.uuid("ID de documento inválido"),
});
