import { z } from "zod";
import { appConfig } from "@/lib/config/app-config";

export const uploadDocumentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= appConfig.documents.maxFileSize, "Arquivo muito grande. Máximo 10MB")
    .refine(
      (file) => appConfig.documents.acceptedFileTypes.includes(file.type as typeof appConfig.documents.acceptedFileTypes[number]),
      "Tipo de arquivo não suportado. Use TXT, PDF ou DOCX"
    ),
});

export const deleteDocumentSchema = z.object({
  documentId: z.uuid("ID de documento inválido"),
});
