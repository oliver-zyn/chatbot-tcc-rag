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
import { actionError, type ActionResponse } from "@/lib/types/action-response";
import {
  updateConversationTitleSchema,
  deleteConversationSchema,
} from "@/lib/validations/conversation";

export async function createNewConversation() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  const conversation = await createConversation(session.user.id);
  revalidatePath("/");
  redirect(`/chat/${conversation.id}`);
}

export async function deleteConversationAction(conversationId: string) {
  const validation = deleteConversationSchema.safeParse({ conversationId });
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversa não encontrada");
  }

  if (conversation.userId !== session.user.id) {
    throw new Error("Você não tem permissão para deletar esta conversa");
  }

  await deleteConversation(conversationId);
  revalidatePath("/");
  redirect("/");
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

    const session = await auth();

    if (!session?.user) {
      return actionError("Não autorizado");
    }

    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return actionError("Conversa não encontrada");
    }

    if (conversation.userId !== session.user.id) {
      return actionError("Você não tem permissão para editar esta conversa");
    }

    await updateConversationTitle(conversationId, validation.data.title);
    revalidatePath("/");
    revalidatePath(`/chat/${conversationId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating conversation title:", error);
    return actionError("Erro ao atualizar título da conversa");
  }
}
