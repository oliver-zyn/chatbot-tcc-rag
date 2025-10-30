import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { findRelevantContent } from './embedding';
import { logError } from '@/lib/errors/logger';
import type { Document } from '@/lib/db/schema/documents';

interface SimilarTicket {
  document: Document;
  similarity: number;
}

export async function generateRAGResponse(
  userQuestion: string,
  documentId?: string | null,
  similarityThreshold?: number,
  similarTickets?: SimilarTicket[]
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

    // Prepara contexto de tickets similares (se houver)
    let similarTicketsContext = '';
    if (similarTickets && similarTickets.length > 0) {
      const extractTicketNumber = (fileName: string): string => {
        const match = fileName.match(/ticket[_-]?(\d+)/i);
        return match ? match[1] : 'desconhecido';
      };

      similarTicketsContext = '\n\n--- TICKETS RELACIONADOS ---\n\n' +
        'Os seguintes tickets têm problemas ou soluções semelhantes:\n\n' +
        similarTickets
          .map((item) => {
            const ticketNumber = extractTicketNumber(item.document.fileName);
            const similarityPercent = Math.round(item.similarity * 100);
            return `TICKET #${ticketNumber} (${similarityPercent}% similar):\n${item.document.content.substring(0, 1200)}`;
          })
          .join('\n\n---\n\n');
    }

    const { text } = await generateText({
      model: openai('gpt-5-nano'),
      system: `Você é um assistente útil que responde perguntas baseado APENAS nas informações fornecidas no contexto.

REGRAS IMPORTANTES:
- Responda APENAS com base nas informações do contexto fornecido
- Se a informação não estiver no contexto, diga que não encontrou a informação
- Seja claro, conciso e objetivo
- Não invente ou assuma informações que não estão explícitas no contexto
- Responda em português brasileiro
- NÃO cite fontes ou números entre colchetes, apenas responda diretamente
- Formate sua resposta usando Markdown quando apropriado:
  * Use listas com bullets (- ou *) para enumerar itens
  * Use numeração (1., 2., 3.) para listas ordenadas
  * Use **negrito** para destacar termos importantes
  * Use \`código\` para termos técnicos ou comandos
  * Use ### para subtítulos quando necessário
  * Use > para citações diretas do documento
- Organize a resposta de forma clara e estruturada quando houver múltiplos pontos
- Se houver TICKETS RELACIONADOS no contexto, inclua uma seção no final com:
  ### 🎫 Tickets Relacionados
  Liste cada ticket com: número, problema principal e solução (máximo 2 linhas cada)`,
      prompt: `Contexto dos documentos:
${context}${similarTicketsContext}

Pergunta do usuário: ${userQuestion}

Responda a pergunta usando apenas as informações do contexto acima. Use formatação Markdown para tornar a resposta mais clara e organizada.${similarTickets && similarTickets.length > 0 ? '\n\nAo final da resposta, inclua uma seção "🎫 Tickets Relacionados" resumindo os tickets similares de forma concisa.' : ''}`,
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
