import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { findRelevantContent } from './embedding';
import { logError } from '@/lib/errors/logger';
import { appConfig } from '@/lib/config/app-config';
import { findSimilarTickets } from '@/lib/db/queries/tickets';
import {
  buildSimilarTicketsContext,
  getSimilarTicketsInstructions
} from './tickets-context';

export async function generateRAGResponse(
  userQuestion: string,
  documentId?: string | null,
  similarityThreshold?: number
): Promise<{
  content: string;
  sources: string[];
}> {
  try {
    const relevantChunks = await findRelevantContent(userQuestion, documentId, similarityThreshold);

    if (relevantChunks.length === 0) {
      return {
        content: "Não encontrei informações suficientes nos documentos carregados para responder esta pergunta. Por favor, certifique-se de que os documentos relevantes foram carregados no sistema.",
        sources: [],
      };
    }

    const context = relevantChunks
      .map((chunk) => chunk.content)
      .join('\n\n---\n\n');

    const sources = [...new Set(relevantChunks.map(chunk => chunk.documentName))];

    // Busca tickets similares APENAS quando o usuário selecionou um ticket específico
    // Perguntas genéricas não mostram a seção "Tickets Relacionados"
    let similarTicketsContext = '';

    if (documentId) {
      try {
        const similarTickets = await findSimilarTickets(documentId);
        if (similarTickets.length > 0) {
          similarTicketsContext = buildSimilarTicketsContext(similarTickets);
        }
      } catch (error) {
        // Não bloqueia se falhar a busca de similares
        logError(error, {
          action: 'findSimilarTickets',
          documentId,
        });
      }
    }

    const { text } = await generateText({
      model: openai(appConfig.llm.model),
      system: `Você é um assistente especializado em responder perguntas sobre documentação técnica e tickets de suporte.

      REGRAS FUNDAMENTAIS:
      - Responda APENAS com base nas informações fornecidas no contexto
      - Se a informação não estiver no contexto, seja honesto e diga que não encontrou
      - Não invente, não assuma, não extrapole informações
      - Seja claro, objetivo e direto

      FORMATAÇÃO DA RESPOSTA:
      - Use Markdown para organizar a resposta
      - **Negrito** para termos importantes
      - \`código\` para comandos, funções ou variáveis
      - Listas com bullets (-) ou numeradas (1., 2., 3.)
      - ### Subtítulos quando necessário
      - > Citações diretas quando relevante

      MENÇÃO A TICKETS:
      - Você PODE e DEVE mencionar números de tickets naturalmente (ex: "ticket #12345")
      - NÃO use colchetes para citações [1], apenas mencione diretamente${similarTicketsContext ? getSimilarTicketsInstructions() : ''}`,
            prompt: `Contexto dos documentos:
      ${context}${similarTicketsContext}

      Pergunta: ${userQuestion}

      Responda a pergunta acima baseando-se exclusivamente nas informações do contexto fornecido.`,
    });

    return {
      content: text,
      sources,
    };
  } catch (error) {
    logError(error, {
      action: 'generateRAGResponse',
      userQuestion,
      documentId,
      similarityThreshold,
    });
    return {
      content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.',
      sources: [],
    };
  }
}
