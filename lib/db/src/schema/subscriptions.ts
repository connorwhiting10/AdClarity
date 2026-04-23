import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { planEnum } from "./profiles";

/**
 * subscriptions — Stripe state per user. Writes only via service_role (webhooks).
 */
export const subscriptionsTable = pgTable("subscriptions", {
  userId: uuid("user_id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  plan: planEnum("plan"),
  status: text("status"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
