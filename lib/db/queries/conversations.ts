import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "../index";
import { type Conversation, conversations } from "../schema/conversations";

export async function getConversationsByUserId(userId: string): Promise<Conversation[]> {
  try {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
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
