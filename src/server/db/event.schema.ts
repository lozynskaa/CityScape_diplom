import { relations, sql } from "drizzle-orm";
import { createTable } from "./table-create";
import {
  boolean,
  numeric,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { userEvents } from "./user-event.schema";
import { companies } from "./company.schema";
import { donations } from "./donations.schema";

export const events = createTable("event", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.getRandomValues(new Uint32Array()).toString()),
  companyId: varchar("company_id", { length: 255 })
    .notNull()
    .references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  goalAmount: numeric("goal_amount", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 255 }),
  purpose: varchar("purpose", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  location: varchar("location", { length: 255 }),
  withoutDonations: boolean("without_donations").default(false),
  // iBan: varchar("iban", { length: 34 }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export type Event = typeof events.$inferSelect;

export const eventRelations = relations(events, ({ many, one }) => ({
  donations: many(donations),
  volunteers: many(userEvents),
  company: one(companies, {
    fields: [events.companyId],
    references: [companies.id],
  }),
}));
