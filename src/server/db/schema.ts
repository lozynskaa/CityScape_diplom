import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `work-diplom_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  profilePhoto: varchar("profile_photo", { length: 255 }),
  bio: text("bio"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

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

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
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

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  donations: many(donations),
  userCompanies: many(companyUsers),
}));

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
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const companyRelations = relations(companies, ({ many, one }) => ({
  posts: many(posts),
  jars: many(jars),
  founder: one(users, {
    fields: [companies.founderId],
    references: [users.id],
  }),
  companyUsers: many(companyUsers),
}));

// CompanyUser Table (Associating Users and Companies)
export const companyUsers = createTable(
  "company_user",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    companyId: varchar("company_id", { length: 255 })
      .notNull()
      .references(() => companies.id),
    role: varchar("role", { length: 50 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.companyId] }),
  }),
);

export const userCompanyRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

// Posts Table
export const posts = createTable("post", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 255 })
    .notNull()
    .references(() => companies.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  imageUrl: varchar("image_url", { length: 255 }),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

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

// Jars Table
export const jars = createTable("jar", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 255 })
    .notNull()
    .references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  goalAmount: numeric("goal_amount", { precision: 10, scale: 2 }),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 }).default(
    "0",
  ),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const jarRelations = relations(jars, ({ many, one }) => ({
  donations: many(donations),
  company: one(companies, {
    fields: [jars.companyId],
    references: [companies.id],
  }),
}));

// Donations Table
export const donationTypes = pgEnum("donation_type", [
  "cash",
  "card",
  "crypto",
]);

export const donations = createTable("donation", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  jarId: varchar("jar_id", { length: 255 })
    .notNull()
    .references(() => jars.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  donationDate: timestamp("donation_date", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  donationType: donationTypes("donation_type").notNull(),
  receiptUrl: varchar("receipt_url", { length: 255 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
});

export const donationRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  jar: one(jars, {
    fields: [donations.jarId],
    references: [jars.id],
  }),
}));
