"use server";

import { getEmbeddingsByDocumentId } from "@/lib/db/queries";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types/action-response";
import { logError } from "@/lib/errors/logger";
import { z } from "zod";

const getChunksSchema = z.object({
  documentId: z.string().uuid({ message: "ID do documento inválido" }),
});

type ChunkData = {
  id: string;
  content: string;
};

export async function getDocumentChunks(
  documentId: string
): Promise<ActionResponse<ChunkData[]>> {
  try {
    const validation = getChunksSchema.safeParse({ documentId });
    if (!validation.success) {
      return actionError(validation.error.issues[0].message);
    }

    const chunks = await getEmbeddingsByDocumentId(documentId);
    return actionSuccess(chunks);
  } catch (error) {
    logError(error, { action: "getDocumentChunks", documentId });
    return actionError("Erro ao buscar chunks do documento");
  }
}
