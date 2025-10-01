"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { createMessage, getConversationById } from "@/lib/db/queries";
import type { Message } from "@/lib/db/schema/messages";

export async function sendMessage(conversationId: string, content: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Não autorizado" };
    }

    // Verifica se a conversa existe e pertence ao usuário
    const conversation = await getConversationById(conversationId);

    if (!conversation || conversation.userId !== session.user.id) {
      return { success: false, error: "Conversa não encontrada" };
    }

    // Salva mensagem do usuário
    const userMessage = await createMessage(conversationId, "user", content);

    // TODO: Implementar busca RAG e geração de resposta com LLM
    // Por enquanto, retorna uma resposta mock
    const mockResponse = generateMockResponse(content);
    const assistantMessage = await createMessage(
      conversationId,
      "assistant",
      mockResponse.content,
      mockResponse.confidenceScore
    );

    revalidatePath(`/chat/${conversationId}`);

    return {
      success: true,
      userMessage,
      assistantMessage,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return { success: false, error: "Erro ao enviar mensagem" };
  }
}

// Função mock temporária - será substituída pelo RAG real
function generateMockResponse(userQuestion: string): {
  content: string;
  confidenceScore: number;
} {
  const responses = [
    {
      content: "Esta é uma resposta temporária do sistema. O sistema RAG completo ainda não foi implementado. Por enquanto, estou apenas testando a interface de chat.",
      confidenceScore: 75,
    },
    {
      content: "Não encontrei informações suficientes nos documentos para responder esta pergunta com precisão. Por favor, certifique-se de que os documentos relevantes foram carregados no sistema.",
      confidenceScore: 45,
    },
    {
      content: "Baseado nos documentos carregados, posso fornecer as seguintes informações: [Resposta mock]. Esta é uma resposta de exemplo que será substituída pelo sistema RAG real.",
      confidenceScore: 92,
    },
  ];

  // Retorna uma resposta aleatória para demonstração
  return responses[Math.floor(Math.random() * responses.length)];
}
