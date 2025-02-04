import { desc, and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  donations,
  events,
  type User,
  userEvents,
  users,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

const eventRouterValidationSchema = {
  createEvent: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    purpose: z.string(),
    date: z.date(),
    location: z.string(),
    includeDonations: z.boolean().default(false),
    imageUrl: z.string().optional(),
    goalAmount: z.number().min(0).default(0).optional(),
    currency: z.string().default("USD").optional(),
    companyId: z.string(),
    category: z.string(),
  }),
  updateEvent: z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
    purpose: z.string(),
    date: z.date(),
    location: z.string(),
    includeDonations: z.boolean().default(false),
    imageUrl: z.string().optional(),
    goalAmount: z.number().min(0).default(0).optional(),
    currency: z.string().default("USD").optional(),
    category: z.string(),
  }),
  getRandomEvents: z.object({
    limit: z.number().min(1).max(100).default(10),
  }),
  getEvent: z.object({
    id: z.string(),
  }),
};

export const eventRouter = createTRPCRouter({
  createEvent: protectedProcedure
    .input(eventRouterValidationSchema.createEvent)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        description,
        purpose,
        date,
        location,
        includeDonations,
        imageUrl,
        goalAmount,
        currency,
        companyId,
        category,
      } = input;

      const [event] = await ctx.db
        .insert(events)
        .values({
          companyId,
          name,
          description,
          category,
          purpose,
          date,
          location,
          withoutDonations: !includeDonations,
          imageUrl,
          goalAmount: `${goalAmount ?? 0}`,
          currency,
        })
        .returning();

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }
      return event;
    }),

  updateEvent: protectedProcedure
    .input(eventRouterValidationSchema.updateEvent)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        description,
        purpose,
        date,
        location,
        includeDonations,
        imageUrl,
        goalAmount,
        currency,
        category,
      } = input;

      const [event] = await ctx.db
        .update(events)
        .set({
          name,
          description,
          purpose,
          date,
          location,
          withoutDonations: !includeDonations,
          imageUrl,
          goalAmount: `${goalAmount ?? 0}`,
          currency,
          category,
        })
        .where(eq(events.id, id))
        .returning();

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }
      return event;
    }),

  getRandomEvents: publicProcedure
    .input(eventRouterValidationSchema.getRandomEvents)
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const userId = ctx.session!.user.id;

      const randomEvents = await ctx.db
        .select({
          id: events.id,
          name: events.name,
          createdAt: events.createdAt,
          description: events.description,
          purpose: events.purpose,
          location: events.location,
          imageUrl: events.imageUrl,
          goalAmount: events.goalAmount,
          date: events.date,
          companyId: events.companyId,
          currentAmount: events.currentAmount,
          currency: events.currency,
          category: events.category,
          withoutDonations: events.withoutDonations,
          isUserApplied: sql<boolean>`CASE WHEN ${userEvents.userId} IS NOT NULL THEN true ELSE false END`,
        })
        .from(events)
        .leftJoin(
          userEvents,
          and(eq(events.id, userEvents.eventId), eq(userEvents.userId, userId)),
        )
        .limit(limit)
        .orderBy(desc(events.createdAt));
      return randomEvents;
    }),

  getEvent: publicProcedure
    .input(eventRouterValidationSchema.getEvent)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const [event] = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, id));

      if (!event) {
        throw new Error("Event not found");
      }

      // Get the list of users who donated
      const donationUsers = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          donationAmount: donations.amount,
          currency: donations.currency,
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .where(eq(donations.eventId, id));

      const eventUsers = (await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(userEvents)
        .where(eq(userEvents.eventId, id))
        .leftJoin(users, eq(userEvents.userId, users.id))) as User[];

      // Combine results
      return {
        ...event,
        donationUsers: donationUsers || [],
        eventUsers: eventUsers || [],
      };
    }),

  getEventsByCompany: publicProcedure
    .input(eventRouterValidationSchema.getEvent)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const companyEvents = await ctx.db
        .select()
        .from(events)
        .where(eq(events.companyId, id));
      return companyEvents;
    }),

  applyToEvent: protectedProcedure
    .input(eventRouterValidationSchema.getEvent)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const [userEvent] = await ctx.db
        .insert(userEvents)
        .values({
          userId,
          eventId: id,
        })
        .returning();
      return userEvent;
    }),

  deleteEvent: protectedProcedure
    .input(eventRouterValidationSchema.getEvent)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.db.delete(events).where(eq(events.id, id));
    }),

  getRandomEvent: publicProcedure
    .input(eventRouterValidationSchema.getRandomEvents)
    .query(async ({ ctx, input }) => {
      const { limit } = input;
      const randomEvent = await ctx.db
        .select()
        .from(events)
        .limit(limit)
        .orderBy(desc(events.createdAt));
      return randomEvent;
    }),
});
