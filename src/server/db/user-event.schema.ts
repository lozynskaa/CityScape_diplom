import { primaryKey, varchar } from "drizzle-orm/pg-core";
import { createTable } from "./table-create";
import { users } from "./user.schema";
import { relations } from "drizzle-orm";
import { events } from "./event.schema";

export const userEvents = createTable(
  "user_event",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    eventId: varchar("company_id", { length: 255 })
      .notNull()
      .references(() => events.id),
    role: varchar("role", { length: 50 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.eventId] }),
  }),
);

export type UserEvent = typeof userEvents.$inferSelect;

export const userEventsRelations = relations(userEvents, ({ one }) => ({
  user: one(users, {
    fields: [userEvents.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [userEvents.eventId],
    references: [events.id],
  }),
}));
