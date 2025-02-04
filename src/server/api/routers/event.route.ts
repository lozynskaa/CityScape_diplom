import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/root";
import { events, userEvents } from "~/server/db/schema";
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
      const randomEvents = await ctx.db
        .select()
        .from(events)
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
      return event;
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
});
