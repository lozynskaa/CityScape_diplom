import {
  desc,
  and,
  eq,
  sql,
  count,
  or,
  like,
  type SQLWrapper,
  gte,
  lte,
} from "drizzle-orm";
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
  type User,
  userEvents,
  users,
} from "~/server/db/schema";
import { type Event } from "~/server/db/event.schema";
import { TRPCError } from "@trpc/server";
import { type Company } from "~/server/db/company.schema";
import { createImageURL } from "~/lib/image";
import { hereMaps } from "~/server/maps/here-maps";
import { sgService } from "~/server/email/sendgrid";

const eventRouterValidationSchema = {
  createEvent: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    purpose: z.string(),
    date: z.date(),
    locationName: z.string(),
    locationId: z.string(),
    longitude: z.string(),
    latitude: z.string(),
    includeDonations: z.boolean().default(false),
    image: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
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
    locationName: z.string(),
    locationId: z.string(),
    longitude: z.string(),
    latitude: z.string(),
    includeDonations: z.boolean().default(false),
    image: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
    goalAmount: z.number().min(0).default(0).optional(),
    currency: z.string().default("USD").optional(),
    category: z.string(),
  }),
  getRandomEvents: z.object({
    limit: z.number().min(1).max(100).default(10),
  }),
  getClosestEvents: z.object({
    longitude: z.string(),
    latitude: z.string(),
    limit: z.number().min(1).max(100).default(10),
  }),
  getEvent: z.object({
    id: z.string(),
  }),
  getEventsWithFilters: z.object({
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    category: z.enum(["all", "new", "my_applies"]).default("all"),
    companyId: z.string().optional(),
    eventCategory: z.string().optional(),
    eventLocation: z.string().optional(),
    eventDate: z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }),
  }),
  autosuggestEventAddress: z.object({
    query: z.string(),
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
        locationName,
        locationId,
        includeDonations,
        image,
        goalAmount,
        currency,
        companyId,
        category,
        latitude,
        longitude,
      } = input;

      const userId = ctx.session?.user?.id;
      let imageUrl: string | undefined = undefined;
      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(`event-image-${uuid}`, image.file);
      }

      const [event] = await ctx.db
        .insert(events)
        .values({
          companyId,
          name,
          description,
          category,
          purpose,
          date,
          locationName,
          locationId,
          withoutDonations: !includeDonations,
          imageUrl,
          goalAmount: `${goalAmount ?? 0}`,
          currency,
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
        locationName,
        locationId,
        includeDonations,
        image,
        goalAmount,
        currency,
        category,
        latitude,
        longitude,
      } = input;

      let imageUrl: string | undefined = undefined;
      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(`event-image-${uuid}`, image.file);
      }

      const [event] = await ctx.db
        .update(events)
        .set({
          name,
          description,
          purpose,
          date,
          locationName,
          locationId,
          withoutDonations: !includeDonations,
          imageUrl,
          goalAmount: `${goalAmount ?? 0}`,
          currency,
          category,
          location: sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
        })
        .where(eq(events.id, id))
        .returning();

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const eventUsers = await ctx.db
        .select({
          id: users.id,
          email: users.email,
          eventName: events.name,
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .leftJoin(events, eq(donations.eventId, events.id))
        .where(eq(donations.eventId, id));

      const emailPromises: Promise<void>[] = [];

      for (const user of eventUsers) {
        if (user.email && user.eventName) {
          emailPromises.push(
            sgService.onEventUpdate(user.email, user.eventName, "update"),
          );
        }
      }

      Promise.all(emailPromises).catch((error) => {
        console.error("Error sending email:", error);
      });

      return event;
    }),

  getRandomEvents: publicProcedure
    .input(eventRouterValidationSchema.getRandomEvents)
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const userId = ctx.session?.user?.id;

      if (userId) {
        const randomEvents = await ctx.db
          .select({
            event: events,
            isUserApplied: sql<boolean>`CASE WHEN ${userEvents.userId} IS NOT NULL THEN true ELSE false END`,
            paymentEnabled: sql<boolean>`CASE WHEN ${events.withoutDonations} IS true THEN false ELSE true END`,
          })
          .from(events)
          .leftJoin(companies, eq(events.companyId, companies.id))
          .leftJoin(
            userEvents,
            and(
              eq(events.id, userEvents.eventId),
              eq(userEvents.userId, userId),
            ),
          )
          .limit(limit)
          .orderBy(desc(events.createdAt));
        return randomEvents.map((event) => ({
          ...event.event,
          paymentEnabled: !!event.paymentEnabled,
          isUserApplied: !!event.isUserApplied,
        }));
      }

      const randomEvents = await ctx.db
        .select()
        .from(events)
        .limit(limit)
        .orderBy(desc(events.createdAt));
      return randomEvents;
    }),

  getClosestEvents: publicProcedure
    .input(eventRouterValidationSchema.getClosestEvents)
    .query(async ({ input, ctx }) => {
      try {
        const { longitude, latitude, limit } = input;

        const closestEvents = await ctx.db
          .select({
            event: events,
            distance: sql`ST_Distance(${events.location}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))`,
          })
          .from(events)
          .orderBy(
            sql`${events.location} <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
          )
          .limit(limit); // Get the 5 closest events

        return closestEvents.map((event) => ({
          ...event.event,
        }));
      } catch (e) {
        console.log("Error fetching closest events", e);
      }
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
          status: donations.status,
          donationDate: donations.donationDate,
          eventName: events.name,
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .leftJoin(events, eq(donations.eventId, events.id))
        .where(
          and(eq(donations.eventId, id), eq(donations.status, "completed")),
        );

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

  getPrivateEvent: protectedProcedure
    .input(eventRouterValidationSchema.getEvent)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const [event] = await ctx.db
        .select()
        .from(events)
        .where(and(eq(events.id, id), eq(events.creatorId, userId)));

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
          status: donations.status,
          donationDate: donations.donationDate,
          eventName: events.name,
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .leftJoin(events, eq(donations.eventId, events.id))
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
      const userId = ctx.session?.user?.id;

      if (!userId) {
        return [];
      }

      const companyEvents = await ctx.db
        .select({
          event: events,
          isUserApplied: sql<boolean>`CASE WHEN ${userEvents.userId} IS NOT NULL THEN true ELSE false END`,
          paymentEnabled: sql<boolean>`CASE WHEN ${events.withoutDonations} IS true THEN false ELSE true END`,
        })
        .from(events)
        .leftJoin(companies, eq(events.companyId, companies.id))
        .leftJoin(
          userEvents,
          and(eq(events.id, userEvents.eventId), eq(userEvents.userId, userId)),
        )
        .where(eq(events.companyId, id));
      return companyEvents.map((event) => ({
        ...event.event,
        paymentEnabled: !!event.paymentEnabled || !event.event.withoutDonations,
        isUserApplied: !!event.isUserApplied,
      }));
    }),

  getEventsWithFilters: publicProcedure
    .input(eventRouterValidationSchema.getEventsWithFilters)
    .query(async ({ input, ctx }) => {
      const {
        search,
        page,
        limit,
        category,
        companyId,
        eventDate,
        eventCategory,
        eventLocation,
      } = input;
      let filterEvents: Array<{
        event: Event;
        company?: Company | null;
      }> = [];
      let eventsCount = 0;
      const userId = ctx.session?.user?.id;

      const whereStatement: Array<SQLWrapper | undefined> = [];

      if (companyId) {
        whereStatement.push(eq(events.companyId, companyId));
      }

      if (search) {
        whereStatement.push(
          or(
            like(events.name, `${search}%`),
            like(events.description, `${search}%`),
            like(events.purpose, `${search}%`),
          ),
        );
      }

      if (eventCategory) {
        whereStatement.push(eq(events.category, eventCategory));
      }

      if (eventLocation) {
        whereStatement.push(like(events.location, eventLocation));
      }

      if (eventDate.startDate) {
        whereStatement.push(gte(events.date, new Date(eventDate.startDate)));
      }

      if (eventDate.endDate) {
        whereStatement.push(lte(events.date, new Date(eventDate.endDate)));
      }

      switch (category) {
        case "new":
          filterEvents = await ctx.db
            .select()
            .from(events)
            .where(and(...whereStatement))
            .leftJoin(companies, eq(events.companyId, companies.id))
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(desc(events.createdAt));
          const [eventsCountData] = await ctx.db
            .select({ count: count() })
            .from(events)
            .where(and(...whereStatement));

          eventsCount = eventsCountData?.count ?? 0;
          break;
        case "my_applies":
          if (userId) {
            whereStatement.push(eq(userEvents.userId, userId));
          }
        case "all":
        default:
          const eventsQueryList = await ctx.db
            .select({
              event: events,
              userEventCount: count(userEvents.eventId),
              company: companies,
              count: count(),
            })
            .from(events)
            .where(and(...whereStatement))
            .leftJoin(companies, eq(events.companyId, companies.id))

            .leftJoin(userEvents, eq(events.id, userEvents.eventId))
            .groupBy(events.id, companies.id)
            .orderBy(desc(count(userEvents.eventId)))
            .limit(limit)
            .offset((page - 1) * limit);

          filterEvents = eventsQueryList.map(({ event, company }) => ({
            event,
            company,
          }));
          eventsCount = eventsQueryList?.[0]?.count ?? 0;
      }
      const mappedEvents = filterEvents.map(({ event }) => {
        return {
          ...event,
          paymentEnabled: !event.withoutDonations,
        };
      });
      return {
        page: input.page,
        limit: input.limit,
        events: mappedEvents,
        eventsCount,
      };
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categoryRows = await ctx.db
      .selectDistinct({
        category: events.category,
      })
      .from(events);
    const categories = categoryRows.map((row) => row.category);
    return categories ?? [];
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
      const eventUsers = await ctx.db
        .select({
          id: users.id,
          email: users.email,
          eventName: events.name,
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .leftJoin(events, eq(donations.eventId, events.id))
        .where(eq(donations.eventId, id));

      const emailPromises: Promise<void>[] = [];

      for (const user of eventUsers) {
        if (user.email && user.eventName) {
          emailPromises.push(
            sgService.onEventUpdate(user.email, user.eventName, "update"),
          );
        }
      }

      Promise.all(emailPromises).catch((error) => {
        console.error("Error sending email:", error);
      });
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

  autosuggestEventAddress: publicProcedure
    .input(eventRouterValidationSchema.autosuggestEventAddress)
    .query(async ({ input }) => {
      const { query } = input;

      const items = await hereMaps.autosuggestAddress(query);
      return items;
    }),
});
