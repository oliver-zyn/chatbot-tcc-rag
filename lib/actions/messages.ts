"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { createMessage, getConversationById, checkRateLimit, incrementUsage } from "@/lib/db/queries";
import { sendMessageSchema } from "@/lib/validations/message";
import { generateRAGResponse } from "@/lib/ai/generate-response";

export async function sendMessage(conversationId: string, content: string) {
  try {
    const validation = sendMessageSchema.safeParse({ conversationId, content });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Não autorizado" };
    }

    const rateLimit = await checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Limite diário atingido. Você pode fazer até ${rateLimit.limit} perguntas por dia. Tente novamente amanhã.`,
      };
    }

    const conversation = await getConversationById(conversationId);

    if (!conversation || conversation.userId !== session.user.id) {
      return { success: false, error: "Conversa não encontrada" };
    }

    const userMessage = await createMessage(conversationId, "user", content);

    await incrementUsage(session.user.id);

    const ragResponse = await generateRAGResponse(content);
    const assistantMessage = await createMessage(
      conversationId,
      "assistant",
      ragResponse.content,
      ragResponse.confidenceScore,
      ragResponse.sources
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
