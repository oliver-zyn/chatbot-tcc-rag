"use server";

import { revalidatePath } from "next/cache";
import {
  createMessage,
  getConversationById,
  checkRateLimit,
  incrementUsage,
  getDocumentById,
  getMessagesByConversationId,
  updateConversationTitle,
} from "@/lib/db/queries";
import { sendMessageSchema } from "@/lib/validations/message";
import { generateRAGResponse } from "@/lib/ai/generate-response";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
} from "@/lib/types/action-response";
import { withAuth, authorizeResourceAccess } from "./utils";
import { logError } from "@/lib/errors/logger";
import { RateLimitError } from "@/lib/errors";
import { appConfig } from "@/lib/config/app-config";

type SendMessageResponse = {
  userMessage: Awaited<ReturnType<typeof createMessage>>;
  assistantMessage: Awaited<ReturnType<typeof createMessage>>;
};

export async function sendMessage(
  conversationId: string,
  content: string,
  documentId?: string | null,
  similarityThreshold?: number,
  similarTickets?: Array<{ document: any; similarity: number }>
): Promise<ActionResponse<SendMessageResponse>> {
  try {
    const validation = sendMessageSchema.safeParse({ conversationId, content });
    if (!validation.success) {
      return actionError(validation.error.issues[0].message);
    }

    return await withAuth(async (userId) => {
      const rateLimit = await checkRateLimit(userId);
      if (!rateLimit.allowed) {
        throw new RateLimitError(
          `Limite diário atingido. Você pode fazer até ${rateLimit.limit} perguntas por dia. Tente novamente amanhã.`
        );
      }

      const conversationResult = await authorizeResourceAccess(
        () => getConversationById(conversationId),
        userId,
        "Conversa"
      );

      if (!conversationResult.success) {
        return conversationResult;
      }

      let contextDocumentName: string | undefined;
      if (documentId) {
        const document = await getDocumentById(documentId);
        contextDocumentName = document?.fileName;
      }

      const existingMessages = await getMessagesByConversationId(conversationId);
      const isFirstMessage = existingMessages.length === 0;

      const userMessage = await createMessage(
        conversationId,
        "user",
        content,
        undefined,
        contextDocumentName
      );

      if (isFirstMessage) {
        try {
          const trimmedContent = content.trim();
          const title = trimmedContent.length > appConfig.conversation.maxTitleLength
            ? trimmedContent.substring(0, appConfig.conversation.titleTruncateLength) + "..."
            : trimmedContent;

          if (title.length > 0) {
            await updateConversationTitle(conversationId, title);
          }
        } catch (error) {
          logError(error, {
            action: "autoUpdateConversationTitle",
            conversationId,
            contentLength: content.length,
          });
        }
      }

      await incrementUsage(userId);

      const ragResponse = await generateRAGResponse(content, documentId, similarityThreshold, similarTickets);
      const assistantMessage = await createMessage(
        conversationId,
        "assistant",
        ragResponse.content,
        ragResponse.sources
      );

      revalidatePath(`/chat/${conversationId}`);
      revalidatePath("/");

      return actionSuccess({
        userMessage,
        assistantMessage,
      });
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return actionError(error.message);
    }

    logError(error, { action: "sendMessage", conversationId });
    return actionError("Erro ao enviar mensagem");
  }
}
