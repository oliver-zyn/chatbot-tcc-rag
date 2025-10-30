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
    maxContentPreview: 1200, // Caracteres do conteúdo do ticket a incluir no contexto
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
} as const;

/**
 * Type helper para extrair tipos do config
 */
export type AppConfig = typeof appConfig;
