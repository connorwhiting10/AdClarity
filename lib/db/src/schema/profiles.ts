import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan_enum", ["free", "basic", "pro"]);

/**
 * profiles — one row per authenticated user, FK to auth.users(id).
 * Auto-created by the handle_new_user trigger on auth.users insert.
 */
export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  plan: planEnum("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Profile = typeof profilesTable.$inferSelect;
export type UpsertProfile = typeof profilesTable.$inferInsert;
