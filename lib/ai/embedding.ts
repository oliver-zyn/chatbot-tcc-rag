import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';
import { appConfig } from '../config/app-config';
import { generateChunks } from './chunking';

const embeddingModel = openai.embedding(appConfig.embeddings.model);

export async function generateEmbeddings(
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
}

export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

export async function findRelevantContent(
  userQuery: string,
  documentId?: string | null,
  similarityThreshold: number = appConfig.retrieval.defaultSimilarityThreshold
) {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  const embeddingString = `[${userQueryEmbedded.join(',')}]`;

  const { documents } = await import('../db/schema/documents');

  // Valores típicos: 0.7+ (alta confiança), 0.5-0.7 (média), 0.3-0.5 (baixa, mas relevante)
  let query = db
    .select({
      content: embeddings.content,
      similarity: sql<number>`1 - (${embeddings.embedding} <=> ${embeddingString}::vector)`,
      documentId: embeddings.documentId,
      documentName: documents.fileName
    })
    .from(embeddings)
    .innerJoin(documents, sql`${embeddings.documentId} = ${documents.id}`)
    .where(sql`1 - (${embeddings.embedding} <=> ${embeddingString}::vector) > ${similarityThreshold}`)
    .$dynamic();

  // Se um documentId foi fornecido, filtra apenas por esse documento
  if (documentId) {
    query = query.where(sql`${embeddings.documentId} = ${documentId}`);
  }

  const similarChunks = await query
    .orderBy(sql`${embeddings.embedding} <=> ${embeddingString}::vector`)
    .limit(appConfig.retrieval.maxChunksReturned);

  return similarChunks;
};