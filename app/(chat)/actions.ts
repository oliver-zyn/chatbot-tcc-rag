"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import {
  createConversation,
  deleteConversation,
  updateConversationTitle,
} from "@/lib/db/queries";

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
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  await deleteConversation(conversationId);
  revalidatePath("/");
  redirect("/");
}

export async function updateConversationTitleAction(
  conversationId: string,
  title: string
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  await updateConversationTitle(conversationId, title);
  revalidatePath("/");
  revalidatePath(`/chat/${conversationId}`);
}
