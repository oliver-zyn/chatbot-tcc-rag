import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "./index";
import { type User, user } from "./schema/users";
import { type Conversation, conversations } from "./schema/conversations";
import { type Message, messages } from "./schema/messages";
import { generateHashedPassword } from "./utils";

// ==================== USER QUERIES ====================

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user by email:", error);
    throw new Error("Failed to get user by email");
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user");
  }
}

// ==================== CONVERSATION QUERIES ====================

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

// ==================== MESSAGE QUERIES ====================

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  try {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  } catch (error) {
    console.error("Failed to get messages:", error);
    throw new Error("Failed to get messages");
  }
}

export async function createMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  confidenceScore?: number
) {
  try {
    const [message] = await db
      .insert(messages)
      .values({
        conversationId,
        role,
        content,
        confidenceScore,
      })
      .returning();

    // Atualiza o updatedAt da conversa
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return message;
  } catch (error) {
    console.error("Failed to create message:", error);
    throw new Error("Failed to create message");
  }
}
