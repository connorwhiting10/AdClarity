import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * users — one row per authenticated user.
 *
 * `id` stores the Clerk user ID (e.g. "user_2abc123…").
 * It is provided by Clerk on first sign-in; never auto-generated here.
 *
 * Upserted by the API server on every sign-in via:
 *   db.insert(usersTable).values({ id: clerkUserId, ... })
 *     .onConflictDoUpdate({ target: usersTable.id, set: { ...profile, updatedAt: new Date() } })
 */
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
