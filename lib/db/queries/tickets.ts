import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { type Document, documents } from "../schema/documents";
import { embeddings } from "../schema/embeddings";
import { appConfig } from "@/lib/config/app-config";

/**
 * Busca documentos cujo nome contém o número do ticket
 * Procura por padrões como: ticket-123, ticket_123, ticket123, etc
 */
export async function findDocumentByTicketNumber(ticketNumber: string): Promise<Document | null> {
  try {
    // Busca por nome de arquivo que contenha o número do ticket
    // Aceita formatos: ticket-123, ticket_123, ticket123, TICKET-123, etc
    const results = await db
      .select()
      .from(documents)
      .where(
        sql`LOWER(${documents.fileName}) LIKE ${`%ticket%${ticketNumber}%`}`
      )
      .orderBy(desc(documents.createdAt))
      .limit(1);

    return results[0] || null;
  } catch (error) {
    console.error("Failed to find document by ticket number:", error);
    throw new Error("Failed to find document by ticket number");
  }
}

/**
 * Busca tickets similares baseado no conteúdo
 * Retorna tickets com problemas/soluções semelhantes
 * Usa múltiplos embeddings e pega a MAIOR similaridade (max) ao invés da média
 */
export async function findSimilarTickets(
  documentId: string,
  limit: number = appConfig.tickets.maxSimilarTickets,
  minSimilarity: number = appConfig.tickets.similarityThreshold
): Promise<Array<{ document: Document }>> {
  try {
    // Busca TODOS os embeddings do documento de origem (não apenas o primeiro)
    const sourceEmbeddings = await db
      .select({
        embedding: embeddings.embedding,
      })
      .from(embeddings)
      .where(eq(embeddings.documentId, documentId));

    if (sourceEmbeddings.length === 0) {
      return [];
    }

    // Pega os N primeiros embeddings (mais representativos) para não sobrecarregar
    const topSourceEmbeddings = sourceEmbeddings.slice(0, appConfig.tickets.maxSourceEmbeddings);

    // Mapeia os resultados por documento para calcular similaridade máxima
    const documentSimilarities = new Map<string, {
      document: Document;
      maxSimilarity: number;
    }>();

    // Para cada embedding do documento fonte
    for (const sourceEmb of topSourceEmbeddings) {
      const embeddingString = `[${sourceEmb.embedding.join(',')}]`;

      // Busca documentos similares que sejam tickets (excluindo o próprio)
      // Usa threshold mais baixo na query para não perder resultados
      const similarDocs = await db
        .select({
          id: documents.id,
          userId: documents.userId,
          fileName: documents.fileName,
          fileType: documents.fileType,
          fileSize: documents.fileSize,
          content: documents.content,
          status: documents.status,
          createdAt: documents.createdAt,
          updatedAt: documents.updatedAt,
          similarity: sql<number>`1 - (${embeddings.embedding} <=> ${embeddingString}::vector)`,
        })
        .from(embeddings)
        .innerJoin(documents, eq(embeddings.documentId, documents.id))
        .where(
          sql`
            ${documents.id} != ${documentId} AND
            LOWER(${documents.fileName}) LIKE '%ticket%' AND
            1 - (${embeddings.embedding} <=> ${embeddingString}::vector) > ${minSimilarity}
          `
        )
        .orderBy(sql`${embeddings.embedding} <=> ${embeddingString}::vector`)
        .limit(appConfig.tickets.maxChunksPerSearch);

      // Pega a MAIOR similaridade para cada documento (não a média)
      for (const doc of similarDocs) {
        const existing = documentSimilarities.get(doc.id);
        const document: Document = {
          id: doc.id,
          userId: doc.userId,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          content: doc.content,
          status: doc.status,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };

        if (!existing || doc.similarity > existing.maxSimilarity) {
          documentSimilarities.set(doc.id, {
            document,
            maxSimilarity: doc.similarity,
          });
        }
      }
    }

    // Filtra por threshold e ordena pela maior similaridade
    const resultsWithMaxSimilarity = Array.from(documentSimilarities.values())
      .filter(item => item.maxSimilarity > minSimilarity)
      .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
      .slice(0, limit);

    return resultsWithMaxSimilarity.map(item => ({ document: item.document }));
  } catch (error) {
    console.error("Failed to find similar tickets:", error);
    throw new Error("Failed to find similar tickets");
  }
}
