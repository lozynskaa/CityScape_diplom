import { and, count, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { companies, events, users } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { type Company } from "~/server/db/company.schema";
import { stripe } from "~/server/stripe";
import { createImageURL } from "~/lib/createImageURL";

const companyRouterValidationSchema = {
  createCompany: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    description: z.string(),
    website: z.string().url().optional(),
    image: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
    stripeAccountId: z.string(),
  }),
  updateCompany: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    description: z.string(),
    website: z.string().url().optional(),
    image: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
    id: z.string(),
  }),
  createStripeCompany: z.object({
    email: z.string().email(),
  }),
  linkStripeCompany: z.object({
    stripeAccountId: z.string(),
    id: z.string(),
  }),
  linkWebhookTrigger: z.object({
    stripeAccountId: z.string(),
  }),
  completeOnboarding: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    category: z.string(),
    description: z.string().optional(),
    companyImage: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
    website: z.string().url().optional(),
    eventName: z.string().min(1),
    eventDescription: z.string().optional(),
    eventPurpose: z.string(),
    eventDate: z.date(),
    eventLocation: z.string(),
    includeDonations: z.boolean().default(false),
    eventImage: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
    goalAmount: z.number().min(0).default(0).optional(),
    currency: z.string().default("USD").optional(),
    stripeAccountId: z.string(),
  }),
  getRandomCompanies: z.object({
    limit: z.number().min(1).max(100).default(10),
  }),
  getCompany: z.object({
    id: z.string(),
  }),
  getCompaniesWithFilters: z.object({
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    category: z.enum(["All", "Featured", "New", "Trending"]).default("All"),
  }),
};

export const companyRouter = createTRPCRouter({
  createCompany: protectedProcedure
    .input(companyRouterValidationSchema.createCompany)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        companyEmail,
        description,
        website,
        image,
        stripeAccountId,
      } = input;

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

      let imageUrl: string | undefined = undefined;

      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(
          `company-image-${uuid}-${image.fileName}`,
          image.file,
        );
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: existingUser?.id,
          name,
          description,
          website,
          email: companyEmail,
          imageUrl,
          stripeAccountId,
        })
        .returning();

      return company;
    }),

  updateCompany: protectedProcedure
    .input(companyRouterValidationSchema.updateCompany)
    .mutation(async ({ input, ctx }) => {
      const { name, description, website, image, id, companyEmail } = input;

      let imageUrl: string | undefined = undefined;

      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(
          `company-image-${uuid}-${image.fileName}`,
          image.file,
        );
      }

      const [company] = await ctx.db
        .update(companies)
        .set({
          name,
          description,
          website,
          imageUrl,
          email: companyEmail,
        })
        .where(eq(companies.id, id))
        .returning();

      return company;
    }),

  createStripeCompany: protectedProcedure
    .input(companyRouterValidationSchema.createStripeCompany)
    .mutation(async ({ input }) => {
      const { email } = input;
      const companyAccount = await stripe.accounts.create({
        type: "express", // You can also choose 'standard' or 'custom' depending on your needs
        country: "US", // Specify the company’s country
        email, // The business email
        business_type: "individual", // You can adjust depending on the business type
      });

      return {
        companyAccount,
      };
    }),

  linkStripeCompany: protectedProcedure
    .input(companyRouterValidationSchema.linkStripeCompany)
    .mutation(async ({ input }) => {
      const { stripeAccountId, id } = input;

      const companyAccountLinkage = await stripe.accountLinks.create({
        type: "account_onboarding", // You can also choose 'standard' or 'custom' depending on your needs
        account: stripeAccountId,
        return_url: `http://localhost:3000/settings/company/${id}`,
        refresh_url: `http://localhost:3000/settings/company/${id}`,
      });

      return companyAccountLinkage;
    }),

  linkWebhookTrigger: protectedProcedure
    .input(companyRouterValidationSchema.linkWebhookTrigger)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { stripeAccountId } = input;

      await ctx.db
        .update(companies)
        .set({
          stripeLinked: true,
        })
        .where(
          and(
            eq(companies.founderId, userId),
            eq(companies.stripeAccountId, stripeAccountId),
          ),
        );

      return {
        success: true,
      };
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
        stripeAccountId,
      } = input;

      const userId = ctx.session.user.id;

      let companyImageURL: string | undefined = undefined;
      let eventImageURL: string | undefined = undefined;
      if (companyImage) {
        const uuid = crypto.randomUUID();
        companyImageURL = await createImageURL(
          `company-image-${uuid}-${companyImage.fileName}`,
          companyImage.file,
        );
      }
      if (eventImage) {
        const uuid = crypto.randomUUID();
        eventImageURL = await createImageURL(
          `event-image-${uuid}-${eventImage.fileName}`,
          eventImage.file,
        );
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: userId,
          name,
          description,
          website,
          email: companyEmail,
          imageUrl: companyImageURL,
          stripeAccountId: stripeAccountId,
        })
        .returning();

      if (!company) {
        await stripe.accounts.del(stripeAccountId);
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
          imageUrl: eventImageURL,
          date: eventDate,
          location: eventLocation,
          withoutDonations: !includeDonations,
          goalAmount: `${goalAmount}`,
          currency,
          category,
          creatorId: userId,
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

  getPrivateCompany: protectedProcedure
    .input(companyRouterValidationSchema.getCompany)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const [company] = await ctx.db
        .select()
        .from(companies)
        .where(and(eq(companies.id, id), eq(companies.founderId, userId)));
      return company;
    }),

  deleteCompany: protectedProcedure
    .input(companyRouterValidationSchema.getCompany)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.db.delete(companies).where(eq(companies.id, id));
    }),

  getCompaniesWithFilters: publicProcedure
    .input(companyRouterValidationSchema.getCompaniesWithFilters)
    .query(async ({ ctx, input }) => {
      let filterCompanies: Company[] = [];
      let companiesCount = 0;

      switch (input.category) {
        default:
          filterCompanies = await ctx.db
            .select()
            .from(companies)
            .where(
              input.search
                ? or(
                    like(companies.name, `${input.search}%`),
                    like(companies.description, `${input.search}%`),
                  )
                : undefined,
            )
            .limit(input.limit)
            .offset((input.page - 1) * input.limit);
          const countQuery = await ctx.db
            .select({ count: count() })
            .from(companies);
          companiesCount = countQuery?.[0]?.count ?? 0;
          break;
      }
      return {
        page: input.page,
        limit: input.limit,
        companies: filterCompanies,
        companiesCount,
      };
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
