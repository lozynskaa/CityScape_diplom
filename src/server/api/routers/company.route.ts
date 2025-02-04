import { and, count, eq, like, or, sum } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  companies,
  donations,
  events,
  userEvents,
  users,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { type Company } from "~/server/db/company.schema";
import { createImageURL } from "~/lib/createImageURL";
import { gateway } from "~/server/payment/braintree";

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
  linkWebhookTrigger: z.object({
    braintreeAccountId: z.string(),
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
      const { name, companyEmail, description, website, image } = input;

      if (!ctx.session.user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      //TODO: add form for all this data here
      const [firstName = "", lastName = ""] = name.split(" ");
      const companyAccount = await gateway.merchantAccount.create({
        individual: {
          firstName, // Example, use actual data
          lastName,
          email: companyEmail,
          dateOfBirth: "1980-01-01", // Example, adjust as necessary
          ssn: "123-45-6789", // Example, adjust as necessary
          address: {
            streetAddress: "123 Main St",
            locality: "Chicago",
            region: "IL",
            postalCode: "60622",
          },
        },
        funding: {
          destination: "bank", // Destination type, can be 'bank' or 'paypal'
          email: companyEmail, // Bank email for payouts
          mobilePhone: "123-456-7890", // Example, use actual number
        },
        masterMerchantAccountId: process.env.BRAINTREE_MERCHANT_ID!,
        tosAccepted: true, // Terms of Service acceptance flag
      });

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
          braintreeAccountId: companyAccount.merchantAccount.id,
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

  linkWebhookTrigger: protectedProcedure
    .input(companyRouterValidationSchema.linkWebhookTrigger)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const { braintreeAccountId } = input;

      await ctx.db
        .update(companies)
        .set({
          braintreeLinked: true,
        })
        .where(
          and(
            eq(companies.founderId, userId),
            eq(companies.braintreeAccountId, braintreeAccountId),
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

      const [firstName = "", lastName = ""] = name.split(" ");

      const companyAccount = await gateway.merchantAccount.create({
        individual: {
          firstName, // Example, use actual data
          lastName,
          email: companyEmail,
          dateOfBirth: "1980-01-01", // Example, adjust as necessary
          ssn: "123-45-6789", // Example, adjust as necessary
          address: {
            streetAddress: "123 Main St",
            locality: "Chicago",
            region: "IL",
            postalCode: "60622",
          },
        },
        funding: {
          destination: "bank", // Destination type, can be 'bank' or 'paypal'
          email: companyEmail, // Bank email for payouts
          mobilePhone: "123-456-7890", // Example, use actual number
        },
        masterMerchantAccountId: process.env.BRAINTREE_MERCHANT_ID!,
        tosAccepted: true, // Terms of Service acceptance flag
      });

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: userId,
          name,
          description,
          website,
          email: companyEmail,
          imageUrl: companyImageURL,
          braintreeAccountId: companyAccount.merchantAccount.id,
        })
        .returning();

      if (!company) {
        // await gateway.merchantAccount.update(companyAccount.merchantAccount.id, {
        //   status: 'inactive', // Set status to inactive to deactivate the account
        // });
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
      const [companyData] = await ctx.db
        .select({
          company: companies,
          totalRaised: sum(events.goalAmount).as("totalRaised"),
          totalDonations: sum(donations.amount).as("totalDonations"),
          totalApplicants: count(userEvents.userId).as("totalApplicants"),
        })
        .from(companies)
        .leftJoin(events, eq(companies.id, events.companyId))
        .leftJoin(donations, eq(events.id, donations.eventId))
        .leftJoin(userEvents, eq(events.id, userEvents.eventId))
        .where(and(eq(companies.id, id), eq(companies.founderId, userId)))
        .groupBy(companies.id);

      if (!companyData?.company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }
      return {
        ...companyData?.company,
        totalRaised: companyData?.totalRaised ?? 0,
        totalDonations: companyData?.totalDonations ?? 0,
        totalApplicants: companyData?.totalApplicants ?? 0,
      };
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
