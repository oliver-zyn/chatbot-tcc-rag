import "server-only";

import { eq, and, sql } from "drizzle-orm";
import { db } from "../index";
import { dailyUsage } from "../schema/usage";

const MAX_MESSAGES_PER_DAY = 50;

export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [usage] = await db
      .select()
      .from(dailyUsage)
      .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)));

    const currentCount = usage?.messageCount || 0;
    const remaining = Math.max(0, MAX_MESSAGES_PER_DAY - currentCount);

    return {
      allowed: currentCount < MAX_MESSAGES_PER_DAY,
      remaining,
      limit: MAX_MESSAGES_PER_DAY,
    };
  } catch (error) {
    console.error("Failed to check rate limit:", error);
    throw new Error("Failed to check rate limit");
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];

    await db
      .insert(dailyUsage)
      .values({
        userId,
        date: today,
        messageCount: 1,
      })
      .onConflictDoUpdate({
        target: [dailyUsage.userId, dailyUsage.date],
        set: {
          messageCount: sql`${dailyUsage.messageCount} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("Failed to increment usage:", error);
    throw new Error("Failed to increment usage");
  }
}

export async function getTodayUsage(userId: string): Promise<number> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [usage] = await db
      .select()
      .from(dailyUsage)
      .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)));

    return usage?.messageCount || 0;
  } catch (error) {
    console.error("Failed to get today usage:", error);
    throw new Error("Failed to get today usage");
  }
}
