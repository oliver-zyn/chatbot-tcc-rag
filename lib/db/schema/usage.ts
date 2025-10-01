import { pgTable, uuid, integer, date, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./users";

export const dailyUsage = pgTable("daily_usage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  messageCount: integer("message_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdDateUnique: unique().on(table.userId, table.date),
}));

export type DailyUsage = typeof dailyUsage.$inferSelect;
