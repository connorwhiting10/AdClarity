import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * admins — presence = admin. Grant by inserting profile uuid.
 * FK to profiles(id) added via SQL migration (cascade on delete).
 */
export const adminsTable = pgTable("admins", {
  userId: uuid("user_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Admin = typeof adminsTable.$inferSelect;
