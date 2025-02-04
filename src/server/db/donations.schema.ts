import {
  boolean,
  numeric,
  pgEnum,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable } from "./table-create";
import { users } from "./user.schema";
import { events } from "./event.schema";
import { relations, sql } from "drizzle-orm";

export const donationTypes = pgEnum("donation_type", ["card", "crypto"]);

export const donations = createTable("donation", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }),
  eventId: varchar("event_id", { length: 255 }).notNull(),
  anonymous: boolean("anonymous").default(false),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  donationDate: timestamp("donation_date", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  donationType: donationTypes("donation_type").notNull(),
  receiptUrl: varchar("receipt_url", { length: 255 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
});

export type Donation = typeof donations.$inferSelect;

export const donationRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [donations.eventId],
    references: [events.id],
  }),
}));
