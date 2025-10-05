import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { type Conversation, conversations } from "../schema/conversations";
import { messages } from "../schema/messages";

export type ConversationWithLastMessage = Conversation & {
  lastMessage?: {
    content: string;
    createdAt: Date;
  } | null;
};

export async function getConversationsByUserId(userId: string): Promise<ConversationWithLastMessage[]> {
  try {
    const result = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        userId: conversations.userId,
        isPinned: conversations.isPinned,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        lastMessageContent: messages.content,
        lastMessageCreatedAt: messages.createdAt,
      })
      .from(conversations)
      .leftJoin(
        messages,
        sql`${messages.conversationId} = ${conversations.id} AND ${messages.id} = (
          SELECT id FROM messages
          WHERE conversation_id = ${conversations.id}
          ORDER BY created_at DESC
          LIMIT 1
        )`
      )
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.isPinned), desc(conversations.updatedAt));

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      userId: row.userId,
      isPinned: row.isPinned,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastMessage: row.lastMessageContent
        ? {
            content: row.lastMessageContent,
            createdAt: row.lastMessageCreatedAt!,
          }
        : null,
    }));
  } catch (error) {
    console.error("Failed to get conversations:", error);
    throw new Error("Failed to get conversations");
  }
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  try {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || null;
  } catch (error) {
    console.error("Failed to get conversation:", error);
    throw new Error("Failed to get conversation");
  }
}

export async function createConversation(userId: string, title?: string) {
  try {
    const [conversation] = await db
      .insert(conversations)
      .values({
        userId,
        title: title || "Nova Conversa",
      })
      .returning();
    return conversation;
  } catch (error) {
    console.error("Failed to create conversation:", error);
    throw new Error("Failed to create conversation");
  }
}

export async function deleteConversation(id: string) {
  try {
    await db.delete(conversations).where(eq(conversations.id, id));
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw new Error("Failed to delete conversation");
  }
}

export async function updateConversationTitle(id: string, title: string) {
  try {
    await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  } catch (error) {
    console.error("Failed to update conversation title:", error);
    throw new Error("Failed to update conversation title");
  }
}

export async function toggleConversationPin(id: string, isPinned: boolean) {
  try {
    await db
      .update(conversations)
      .set({ isPinned, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  } catch (error) {
    console.error("Failed to toggle conversation pin:", error);
    throw new Error("Failed to toggle conversation pin");
  }
}
