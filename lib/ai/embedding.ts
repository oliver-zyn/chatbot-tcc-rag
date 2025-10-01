import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';

const embeddingModel = openai.embedding('text-embedding-ada-002');

const generateChunks = (input: string): string[] => {
  const text = input.trim();
  const chunkSize = 800; // caracteres por chunk
  const overlap = 200; // overlap entre chunks
  const chunks: string[] = [];

  if (text.length <= chunkSize) {
    return [text];
  }

  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Tenta terminar no final de uma sentença
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const lastBreak = Math.max(lastPeriod, lastNewline);

      if (lastBreak > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBreak + 1);
      }
    }

    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > 0) {
      chunks.push(trimmedChunk);
    }

    const advance = Math.max(chunk.length - overlap, chunkSize - overlap);
    start += advance;
  }

  return chunks;
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  // Importa documents schema para fazer join
  const { documents } = await import('../db/schema/documents');

  const similarChunks = await db
    .select({
      content: embeddings.content,
      similarity,
      documentId: embeddings.documentId,
      documentName: documents.fileName
    })
    .from(embeddings)
    .innerJoin(documents, sql`${embeddings.documentId} = ${documents.id}`)
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(5);
  return similarChunks;
};