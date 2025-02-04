import { text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "./table-create";
import { relations, sql } from "drizzle-orm";
import { companies } from "./company.schema";
import { users } from "./user.schema";

// Posts Table
export const posts = createTable("post", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.getRandomValues(new Uint32Array(1)).toString()),
  companyId: varchar("company_id", { length: 255 })
    .notNull()
    .references(() => companies.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  imageUrls: text("image_urls")
    .array()
    .notNull()
    .default(sql`ARRAY[]::TEXT[]`),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export type Post = typeof posts.$inferSelect;

export const postRelations = relations(posts, ({ one }) => ({
  company: one(companies, {
    fields: [posts.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
