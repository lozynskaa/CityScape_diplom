import {
  boolean,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createTable } from "./table-create";
import { relations, sql } from "drizzle-orm";
import { type AdapterAccount } from "next-auth/adapters";
import { posts } from "./post.schema";
import { donations } from "./donations.schema";
import { userEvents } from "./user-event.schema";

//User Table
export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  image: varchar("image", { length: 255 }),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
});

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  donations: many(donations),
  accounts: many(accounts),
  userEvents: many(userEvents),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export type User = typeof users.$inferSelect;
