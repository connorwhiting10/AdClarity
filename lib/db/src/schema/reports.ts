import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * reports — one row per uploaded/parsed XLSX report. user_id FK to profiles(id).
 * Inserts gated by RLS policy calling can_create_report(auth.uid()).
 */
export const reportsTable = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    filename: text("filename"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
    analysis: jsonb("analysis"),
    summary: jsonb("summary"),
    dateRange: text("date_range"),
  },
  (t) => ({
    byUserUploadedAt: index("reports_user_uploaded_idx").on(t.userId, t.uploadedAt.desc()),
  }),
);

export type Report = typeof reportsTable.$inferSelect;
export type UpsertReport = typeof reportsTable.$inferInsert;
