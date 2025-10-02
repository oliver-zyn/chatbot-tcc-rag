import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { findRelevantContent } from './embedding';

export async function generateRAGResponse(userQuestion: string): Promise<{
  content: string;
  confidenceScore: number;
  sources: string[];
}> {
  try {
    const relevantChunks = await findRelevantContent(userQuestion);

    if (relevantChunks.length === 0) {
      return {
        content: "Não encontrei informações suficientes nos documentos carregados para responder esta pergunta. Por favor, certifique-se de que os documentos relevantes foram carregados no sistema.",
        confidenceScore: 0,
        sources: [],
      };
    }

    const avgSimilarity = relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / relevantChunks.length;
    const confidenceScore = Math.round(avgSimilarity * 100);

    const context = relevantChunks
      .map((chunk) => chunk.content)
      .join('\n\n---\n\n');

    const sources = [...new Set(relevantChunks.map(chunk => chunk.documentName))];

    const { text } = await generateText({
      model: openai('gpt-5-mini'),
      system: `Você é um assistente útil que responde perguntas baseado APENAS nas informações fornecidas no contexto.

REGRAS IMPORTANTES:
- Responda APENAS com base nas informações do contexto fornecido
- Se a informação não estiver no contexto, diga que não encontrou a informação
- Seja claro, conciso e objetivo
- Não invente ou assuma informações que não estão explícitas no contexto
- Responda em português brasileiro
- NÃO cite fontes ou números entre colchetes, apenas responda diretamente`,
      prompt: `Contexto dos documentos:
${context}

Pergunta do usuário: ${userQuestion}

Responda a pergunta usando apenas as informações do contexto acima.`,
    });

    return {
      content: text,
      confidenceScore,
      sources,
    };
  } catch (error) {
    console.error('Erro ao gerar resposta RAG:', error);
    return {
      content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.',
      confidenceScore: 0,
      sources: [],
    };
  }
}
