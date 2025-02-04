import { and, count, eq, like, or, sql, sum } from "drizzle-orm";
import { optional, z } from "zod";
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
import { createImageURL } from "~/lib/image";

const companyRouterValidationSchema = {
  createCompany: z.object({
    company: z.object({
      name: z.string().min(1),
      companyEmail: z.string().email(),
      description: z.string(),
      website: z.string().url(),
      image: z
        .object({
          file: z.string(), // Bun's File object
          fileName: z.string(),
        })
        .optional(),
      companyIBAN: z.string().max(34),
      okpo: z.string(),
      phoneNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.date(),
      country: z.string(),
    }),
  }),
  updateCompany: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    description: z.string(),
    website: z.string().url(),
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
    company: z.object({
      name: z.string().min(1),
      companyEmail: z.string().email(),
      description: z.string().optional(),
      companyImage: z
        .object({
          file: z.string(), // Bun's File object
          fileName: z.string(),
        })
        .optional(),
      website: z.string().url(),
      companyIBAN: z.string().max(34),
      okpo: z.string(),
      phoneNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.date(),
      country: z.string(),
    }),
    event: z.object({
      eventName: z.string().min(1),
      eventDescription: z.string().optional(),
      eventPurpose: z.string(),
      eventDate: z.date(),
      eventLocation: z.string(),
      eventLocationId: z.string(),
      includeDonations: z.boolean().default(false),
      eventImage: z
        .object({
          file: z.string(), // Bun's File object
          fileName: z.string(),
        })
        .optional(),
      goalAmount: z.number().min(0).default(0).optional(),
      currency: z.string().default("USD").optional(),
      category: z.string(),
      longitude: z.string().nullable(),
      latitude: z.string().nullable(),
    }),
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
        companyIBAN: iBan,
        okpo,
        phoneNumber: phone,
        firstName,
        lastName,
        dateOfBirth,
        country,
      } = input.company;

      const userId = ctx.session.user.id;

      let imageUrl: string | undefined = undefined;

      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(`company-image-${uuid}`, image.file);
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: userId,
          name,
          description,
          website,
          email: companyEmail,
          imageUrl,
          iBan,
          okpo,
          phone,
          dateOfBirth,
          firstName,
          lastName,
          country,
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
        imageUrl = await createImageURL(`company-image-${uuid}`, image.file);
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

  completeOnboarding: protectedProcedure
    .input(companyRouterValidationSchema.completeOnboarding)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        companyEmail,
        description,
        website,
        companyImage,
        companyIBAN: iBan,
        okpo,
        phoneNumber: phone,
        firstName,
        lastName,
        dateOfBirth,
        country,
      } = input.company;

      const {
        category,
        eventImage,
        eventName,
        eventDescription,
        eventPurpose,
        eventDate,
        eventLocation,
        eventLocationId,
        goalAmount,
        includeDonations,
        currency,
        longitude,
        latitude,
      } = input.event;

      const userId = ctx.session.user.id;

      let companyImageURL: string | undefined = undefined;
      let eventImageURL: string | undefined = undefined;
      if (companyImage) {
        const uuid = crypto.randomUUID();
        companyImageURL = await createImageURL(
          `company-image-${uuid}`,
          companyImage.file,
        );
      }
      if (eventImage) {
        const uuid = crypto.randomUUID();
        eventImageURL = await createImageURL(
          `event-image-${uuid}`,
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
          iBan,
          okpo,
          phone,
          dateOfBirth,
          firstName,
          lastName,
          country,
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
          imageUrl: eventImageURL,
          date: eventDate,
          locationName: eventLocation,
          locationId: eventLocationId,
          withoutDonations: !includeDonations,
          goalAmount: `${goalAmount}`,
          currency,
          category,
          creatorId: userId,
          location: sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`, // Longitude, Latitude
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
