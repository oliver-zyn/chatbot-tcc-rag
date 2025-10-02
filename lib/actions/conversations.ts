"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  createConversation,
  deleteConversation,
  updateConversationTitle,
  getConversationById,
} from "@/lib/db/queries";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
} from "@/lib/types/action-response";
import {
  updateConversationTitleSchema,
  deleteConversationSchema,
} from "@/lib/validations/conversation";
import { withAuth, authorizeResourceAccess } from "./utils";
import { logError } from "@/lib/errors/logger";

export async function createNewConversation() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  const conversation = await createConversation(session.user.id);
  revalidatePath("/");
  redirect(`/chat/${conversation.id}`);
}

export async function deleteConversationAction(
  conversationId: string
): Promise<ActionResponse<void>> {
  try {
    const validation = deleteConversationSchema.safeParse({ conversationId });
    if (!validation.success) {
      return actionError(validation.error.issues[0].message);
    }

    return await withAuth(async (userId) => {
      const conversationResult = await authorizeResourceAccess(
        () => getConversationById(conversationId),
        userId,
        "Conversa"
      );

      if (!conversationResult.success) {
        return conversationResult;
      }

      await deleteConversation(conversationId);
      revalidatePath("/");

      return actionSuccess(undefined);
    });
  } catch (error) {
    logError(error, { action: "deleteConversation", conversationId });
    return actionError("Erro ao deletar conversa");
  }
}

export async function updateConversationTitleAction(
  conversationId: string,
  title: string
): Promise<ActionResponse<void>> {
  try {
    const validation = updateConversationTitleSchema.safeParse({
      conversationId,
      title,
    });

    if (!validation.success) {
      return actionError(validation.error.issues[0].message);
    }

    return await withAuth(async (userId) => {
      const conversationResult = await authorizeResourceAccess(
        () => getConversationById(conversationId),
        userId,
        "Conversa"
      );

      if (!conversationResult.success) {
        return conversationResult;
      }

      await updateConversationTitle(conversationId, validation.data.title);
      revalidatePath("/");
      revalidatePath(`/chat/${conversationId}`);

      return actionSuccess(undefined);
    });
  } catch (error) {
    logError(error, { action: "updateConversationTitle", conversationId });
    return actionError("Erro ao atualizar título da conversa");
  }
}
