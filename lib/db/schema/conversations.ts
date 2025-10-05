import type { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "./users";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull().default("Nova Conversa"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Conversation = InferSelectModel<typeof conversations>;
