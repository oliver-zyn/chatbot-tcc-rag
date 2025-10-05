import "server-only";

import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { votes } from "../schema/votes";

export async function getVoteByMessageId(messageId: string, userId: string) {
  try {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.messageId, messageId), eq(votes.userId, userId)));

    return vote || null;
  } catch (error) {
    console.error("Failed to get vote:", error);
    return null;
  }
}

export async function createOrUpdateVote(
  messageId: string,
  userId: string,
  isUpvoted: boolean
) {
  try {
    const existingVote = await getVoteByMessageId(messageId, userId);

    if (existingVote) {
      // Update existing vote
      const [updatedVote] = await db
        .update(votes)
        .set({ isUpvoted, updatedAt: new Date() })
        .where(eq(votes.id, existingVote.id))
        .returning();

      return updatedVote;
    } else {
      // Create new vote
      const [newVote] = await db
        .insert(votes)
        .values({
          messageId,
          userId,
          isUpvoted,
        })
        .returning();

      return newVote;
    }
  } catch (error) {
    console.error("Failed to create/update vote:", error);
    throw new Error("Failed to create/update vote");
  }
}

export async function deleteVote(messageId: string, userId: string) {
  try {
    await db
      .delete(votes)
      .where(and(eq(votes.messageId, messageId), eq(votes.userId, userId)));
  } catch (error) {
    console.error("Failed to delete vote:", error);
    throw new Error("Failed to delete vote");
  }
}
