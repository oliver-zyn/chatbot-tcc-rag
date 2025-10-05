import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';

const embeddingModel = openai.embedding('text-embedding-3-small');

/**
 * Recursive Splitting Strategy com overlap semântico:
 * 1. Divide o texto usando separadores estruturais (parágrafos, seções)
 * 2. Se algum chunk exceder o tamanho máximo, divide recursivamente
 * 3. Sem overlap artificial - mantém apenas a estrutura natural do documento
 */
const generateChunks = (input: string): string[] => {
  const text = input.trim();
  const maxChunkSize = 800; // tamanho máximo de caracteres por chunk
  const minChunkSize = 50; // chunks menores que isso são mesclados com o anterior

  // Separadores em ordem de prioridade (do mais específico para o menos)
  const separators = [
    '\n\n',    // Quebras duplas (parágrafos) - principal separador
    '\n',      // Quebras simples (linhas)
    '. ',      // Fim de sentença
    '! ',      // Fim de sentença (exclamação)
    '? ',      // Fim de sentença (pergunta)
    '; ',      // Ponto e vírgula
    ', ',      // Vírgula
    ' ',       // Espaço (último recurso)
  ];

  function recursiveSplit(text: string, separatorIndex: number = 0): string[] {
    // Se o texto já está no tamanho ideal, retorna
    if (text.length <= maxChunkSize) {
      return [text];
    }

    // Se já esgotou todos os separadores, força divisão
    if (separatorIndex >= separators.length) {
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += maxChunkSize) {
        chunks.push(text.slice(i, i + maxChunkSize));
      }
      return chunks;
    }

    const separator = separators[separatorIndex];
    const splits = text.split(separator);

    const chunks: string[] = [];
    let currentChunk = '';

    for (let i = 0; i < splits.length; i++) {
      const segment = splits[i];

      // Ignora segmentos vazios
      if (!segment.trim()) continue;

      // Se o segmento sozinho já é muito grande, divide recursivamente
      if (segment.length > maxChunkSize) {
        // Salva o chunk atual se existir
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // Divide recursivamente usando o próximo separador
        const subChunks = recursiveSplit(segment, separatorIndex + 1);
        chunks.push(...subChunks);
        continue;
      }

      // Tenta adicionar o segmento ao chunk atual
      const potentialChunk = currentChunk
        ? currentChunk + separator + segment
        : segment;

      if (potentialChunk.length <= maxChunkSize) {
        currentChunk = potentialChunk;
      } else {
        // Chunk atual está completo, salva e inicia novo
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = segment;
      }
    }

    // Adiciona o último chunk se não estiver vazio
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Gera chunks sem overlap artificial
  let chunks = recursiveSplit(text);

  // Mescla chunks muito pequenos com o anterior
  const finalChunks: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (chunk.length < minChunkSize && finalChunks.length > 0) {
      // Mescla com o chunk anterior
      finalChunks[finalChunks.length - 1] += '\n\n' + chunk;
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks.filter(chunk => chunk.trim().length >= minChunkSize);
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

export const findRelevantContent = async (
  userQuery: string,
  documentId?: string | null,
  similarityThreshold: number = 0.3
) => {
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
    .limit(5);

  return similarChunks;
};