import "server-only";

import { eq } from "drizzle-orm";
import { db } from "../index";
import { type Message, messages } from "../schema/messages";
import { conversations } from "../schema/conversations";

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
  confidenceScore?: number,
  sources?: string[]
) {
  try {
    const [message] = await db
      .insert(messages)
      .values({
        conversationId,
        role,
        content,
        confidenceScore,
        sources,
      })
      .returning();

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
