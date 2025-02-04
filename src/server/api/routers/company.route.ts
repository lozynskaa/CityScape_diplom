import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { companies, events, users } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

const companyRouterValidationSchema = {
  createCompany: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    description: z.string(),
    website: z.string().url().optional(),
    image: z.string().url().optional(),
  }),
  updateCompany: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    description: z.string(),
    website: z.string().url().optional(),
    image: z.string().url().optional(),
    id: z.string(),
  }),
  completeOnboarding: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    category: z.string(),
    description: z.string().optional(),
    companyImage: z.string().url().optional(),
    website: z.string().url().optional(),
    eventName: z.string().min(1),
    eventDescription: z.string().optional(),
    eventPurpose: z.string(),
    eventDate: z.date(),
    eventLocation: z.string(),
    includeDonations: z.boolean().default(false),
    eventImage: z.string().url().optional(),
    goalAmount: z.number().min(0).default(0).optional(),
    currency: z.string().default("USD").optional(),
  }),
  getRandomCompanies: z.object({
    limit: z.number().min(1).max(100).default(10),
  }),
  getCompany: z.object({
    id: z.string(),
  }),
};

export const companyRouter = createTRPCRouter({
  createCompany: protectedProcedure
    .input(companyRouterValidationSchema.createCompany)
    .mutation(async ({ input, ctx }) => {
      const { name, companyEmail, description, website, image } = input;

      if (!ctx.session.user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [existingUser] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, ctx.session.user.email));

      if (!existingUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: existingUser?.id,
          name,
          description,
          website,
          email: companyEmail,
          imageUrl: image,
        })
        .returning();

      return company;
    }),

  updateCompany: protectedProcedure
    .input(companyRouterValidationSchema.updateCompany)
    .mutation(async ({ input, ctx }) => {
      const { name, description, website, image, id, companyEmail } = input;

      const [company] = await ctx.db
        .update(companies)
        .set({
          name,
          description,
          website,
          imageUrl: image,
          email: companyEmail,
        })
        .where(eq(companies.id, id))
        .returning();

      return company;
    }),

  completeOnboarding: protectedProcedure
    .input(companyRouterValidationSchema.completeOnboarding)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        companyEmail,
        description,
        companyImage,
        website,
        eventName,
        eventDescription,
        eventPurpose,
        eventDate,
        eventLocation,
        includeDonations,
        eventImage,
        goalAmount,
        currency,
        category,
      } = input;

      const userId = ctx.session.user.id;

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: userId,
          name,
          description,
          website,
          email: companyEmail,
          imageUrl: companyImage,
        })
        .returning();

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const [event] = await ctx.db
        .insert(events)
        .values({
          companyId: company.id,
          name: eventName,
          description: eventDescription,
          purpose: eventPurpose,
          imageUrl: eventImage,
          date: eventDate,
          location: eventLocation,
          withoutDonations: !includeDonations,
          goalAmount: `${goalAmount}`,
          currency,
          category,
        })
        .returning();

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      await ctx.db
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, ctx.session.user.id));

      return { company, event };
    }),

  getUserCompanies: protectedProcedure.query(async ({ ctx }) => {
    const userCompanies = await ctx.db
      .select()
      .from(companies)
      .where(eq(companies.founderId, ctx.session.user.id));
    return userCompanies;
  }),

  getCompany: publicProcedure
    .input(companyRouterValidationSchema.getCompany)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const [company] = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, id));
      return company;
    }),

  deleteCompany: protectedProcedure
    .input(companyRouterValidationSchema.getCompany)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.db.delete(companies).where(eq(companies.id, id));
    }),

  getRandomCompanies: publicProcedure
    .input(companyRouterValidationSchema.getRandomCompanies)
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const randomCompanies = await ctx.db
        .select()
        .from(companies)
        .limit(limit);
      return randomCompanies;
    }),
});
