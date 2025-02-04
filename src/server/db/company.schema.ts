import { text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "./table-create";
import { relations, sql } from "drizzle-orm";
import { posts } from "./post.schema";
import { events } from "./event.schema";
import { users } from "./user.schema";

//Company Table
export const companies = createTable("company", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  founderId: varchar("founder_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  iBan: varchar("iban", { length: 34 }).notNull(),
  okpo: varchar("okpo", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  merchantAccount: varchar("merchant_account", { length: 255 }).notNull(),
  secretKey: varchar("merchant_secret", { length: 255 }).notNull(),
});

export type Company = typeof companies.$inferSelect;

export const companyRelations = relations(companies, ({ many, one }) => ({
  posts: many(posts),
  events: many(events),
  founder: one(users, {
    fields: [companies.founderId],
    references: [users.id],
  }),
}));
