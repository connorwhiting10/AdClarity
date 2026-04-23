import { date, integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

/**
 * usage — monthly report counts for freemium enforcement.
 * Written by the report_inserted trigger, never by clients directly.
 */
export const usageTable = pgTable(
  "usage",
  {
    userId: uuid("user_id").notNull(),
    month: date("month").notNull(),
    reportCount: integer("report_count").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.month] }),
  }),
);

export type Usage = typeof usageTable.$inferSelect;
