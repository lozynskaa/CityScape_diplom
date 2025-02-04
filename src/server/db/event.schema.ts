import { relations, sql } from "drizzle-orm";
import { createTable } from "./table-create";
import {
  boolean,
  geometry,
  index,
  numeric,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { userEvents } from "./user-event.schema";
import { companies } from "./company.schema";
import { donations } from "./donations.schema";

export const events = createTable(
  "event",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.getRandomValues(new Uint32Array(1)).toString()),
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
    date: timestamp("date", {
      mode: "date",
      withTimezone: true,
    }),
    creatorId: varchar("creator_id", { length: 255 }).notNull(),
    location: geometry("location", { type: "point", srid: 4326 }).notNull(),
    locationName: varchar("location_name", { length: 255 }),
    locationId: varchar("location_id", { length: 255 }),
    withoutDonations: boolean("without_donations").default(false),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    spatialIndex: index("spatial_index").using("gist", t.location),
  }),
);

export type Event = typeof events.$inferSelect;

export const eventRelations = relations(events, ({ many, one }) => ({
  donations: many(donations),
  volunteers: many(userEvents),
  company: one(companies, {
    fields: [events.companyId],
    references: [companies.id],
  }),
}));
