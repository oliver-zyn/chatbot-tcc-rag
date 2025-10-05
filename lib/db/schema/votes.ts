import type { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { messages } from "./messages";
import { user } from "./users";

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isUpvoted: boolean("is_upvoted").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Vote = InferSelectModel<typeof votes>;
