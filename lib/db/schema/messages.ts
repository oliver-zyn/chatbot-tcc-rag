import type { InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  confidenceScore: integer("confidence_score"),
  sources: json("sources").$type<string[]>(),
  contextDocument: text("context_document"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Message = InferSelectModel<typeof messages>;
