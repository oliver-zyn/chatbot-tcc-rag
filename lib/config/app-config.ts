/**
 * Configuração centralizada da aplicação
 * Agrupa todas as constantes e parâmetros configuráveis do sistema
 */

export const appConfig = {
  /**
   * Configurações de Rate Limiting
   */
  rateLimit: {
    messagesPerDay: 50,
  },

  /**
   * Configurações de Chunking de Documentos
   */
  chunking: {
    maxChunkSize: 800,
    minChunkSize: 50,
  },

  /**
   * Configurações de Embeddings
   */
  embeddings: {
    model: "text-embedding-3-small" as const,
    dimensions: 1536,
  },

  /**
   * Configurações de Recuperação de Contexto
   */
  retrieval: {
    defaultSimilarityThreshold: 0.3,
    maxChunksReturned: 5,
  },

  /**
   * Configurações de Tickets Similares
   */
  tickets: {
    similarityThreshold: 0.7,
    maxSimilarTickets: 3,
    maxContentPreview: -1, // -1 = sem limite (envia conteúdo completo), ou número de caracteres
  },

  /**
   * Configurações do LLM
   */
  llm: {
    model: "gpt-5-nano" as const,
  },

  /**
   * Configurações de Conversação
   */
  conversation: {
    maxTitleLength: 80,
    titleTruncateLength: 77, // 80 - 3 (para "...")
  },

  /**
   * Configurações de Sessão
   */
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
  },

  /**
   * Configurações de Upload de Documentos
   */
  documents: {
    maxFileSize: 10 * 1024 * 1024, // 10MB em bytes
    acceptedFileTypes: [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ] as const,
    acceptedFileExtensions: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    } as const,
  },
} as const;

/**
 * Type helper para extrair tipos do config
 */
export type AppConfig = typeof appConfig;

/**
 * Helper para gerar string de extensões aceitas para input de arquivo
 * @returns String no formato ".txt,.pdf,.docx"
 */
export function getAcceptedExtensionsString(): string {
  return Object.values(appConfig.documents.acceptedFileExtensions)
    .flat()
    .join(",");
}
