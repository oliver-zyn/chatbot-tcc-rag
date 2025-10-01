"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { createDocument, deleteDocument, getDocumentById } from "@/lib/db/queries";
import { extractTextFromFile } from "@/lib/documents/extract-text";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types/action-response";
import { uploadDocumentSchema, deleteDocumentSchema } from "@/lib/validations/document";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { db } from "@/lib/db";
import { embeddings as embeddingsTable } from "@/lib/db/schema/embeddings";

export async function uploadDocumentAction(
  formData: FormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return actionError("Não autorizado");
    }

    const file = formData.get("file") as File;

    if (!file) {
      return actionError("Nenhum arquivo enviado");
    }

    const validation = uploadDocumentSchema.safeParse({ file });
    if (!validation.success) {
      return actionError(validation.error.issues[0].message);
    }

    const text = await extractTextFromFile(file);

    if (!text || text.trim().length === 0) {
      return actionError("Não foi possível extrair texto do arquivo");
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "txt";

    const document = await createDocument(
      session.user.id,
      file.name,
      fileExtension,
      file.size,
      text
    );

    try {
      const embeddings = await generateEmbeddings(text);
      await db.insert(embeddingsTable).values(
        embeddings.map(embedding => ({
          documentId: document.id,
          ...embedding,
        })),
      );
    } catch (embeddingError) {
      console.error("Erro ao gerar embeddings:", embeddingError);
      await deleteDocument(document.id);
      return actionError("Erro ao processar documento. Não foi possível gerar embeddings do conteúdo.");
    }

    revalidatePath("/documents");

    return actionSuccess({ id: document.id });
  } catch (error) {
    console.error("Error uploading document:", error);
    return actionError("Erro ao processar documento");
  }
}

export async function deleteDocumentAction(
  documentId: string
): Promise<ActionResponse<void>> {
  try {
    const validation = deleteDocumentSchema.safeParse({ documentId });
    if (!validation.success) {
      return actionError(validation.error.issues[0].message);
    }

    const session = await auth();

    if (!session?.user) {
      return actionError("Não autorizado");
    }

    const document = await getDocumentById(documentId);

    if (!document) {
      return actionError("Documento não encontrado");
    }

    if (document.userId !== session.user.id) {
      return actionError("Você não tem permissão para deletar este documento");
    }

    await deleteDocument(documentId);
    revalidatePath("/documents");

    return actionSuccess(undefined);
  } catch (error) {
    console.error("Error deleting document:", error);
    return actionError("Erro ao deletar documento");
  }
}
