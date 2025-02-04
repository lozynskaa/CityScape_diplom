import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { eq, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { companies } from "~/server/db/company.schema";
import { donations } from "~/server/db/donations.schema";
import { events } from "~/server/db/event.schema";
import { users } from "~/server/db/user.schema";
import { sgService } from "~/server/email/sendgrid";
import { checkoutService } from "~/server/payment/checkout";

const donationRouterValidationSchema = {
  initializePayment: z.object({
    amount: z.number(),
    currency: z.string(),
    eventId: z.string(),
    anonymous: z.boolean().optional().default(false),
  }),
  initializePayoutToCompany: z.object({
    donationId: z.string(),
    amount: z.number(),
    currency: z.string(),
  }),
  removeDonatedAmount: z.object({
    donationId: z.string(),
    amount: z.number().optional(),
  }),
  updateDonationStatus: z.object({
    id: z.string(),
    status: z.enum(["pending", "completed", "failed"]).default("pending"),
  }),
};

export const donationRouter = createTRPCRouter({
  initializePayment: publicProcedure
    .input(donationRouterValidationSchema.initializePayment)
    .mutation(async ({ input, ctx }) => {
      const { amount, currency, eventId, anonymous } = input;

      const userId = ctx?.session?.user.id;

      const [event] = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, eventId));

      const [donation] = await ctx.db
        .insert(donations)
        .values({
          amount: Number(amount).toFixed(2),
          currency,
          anonymous,
          userId,
          eventId,
          status: "pending",
          // donationDate: new Date(),
          // receiptUrl: paymentTransfer.receipt_url,
        })
        .returning();

      if (!donation || !event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Donation or donation event not found",
        });
      }

      const [company] = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, event?.companyId));

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const response = await checkoutService.createPaymentLink({
        amount: Number(amount) * 100,
        currency,
        country: company.country,
        eventTitle: event.name,
        eventId: event.id,
        userId,
        eventCompanyId: event.companyId,
        dateOfBirth: format(company.dateOfBirth, "yyyy-MM-dd"),
        iBan: company.iBan,
        refId: donation.id,
        firstName: company.firstName,
        lastName: company.lastName,
      });

      return response;
    }),

  removeDonatedAmount: publicProcedure
    .input(donationRouterValidationSchema.removeDonatedAmount)
    .mutation(async ({ input, ctx }) => {
      const { donationId, amount } = input;

      const [donation] = await ctx.db
        .select()
        .from(donations)
        .where(eq(donations.id, donationId));

      if (!donation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Donation not found",
        });
      }

      await ctx.db
        .update(events)
        .set({
          currentAmount: sql`${events.currentAmount} - ${amount ?? donation.amount}`,
        })
        .where(eq(events.id, donation.eventId));
    }),

  addDonatedAmount: publicProcedure
    .input(donationRouterValidationSchema.removeDonatedAmount)
    .mutation(async ({ input, ctx }) => {
      const { donationId, amount } = input;

      const [donation] = await ctx.db
        .select({
          donation: donations,
          event: events,
        })
        .from(donations)
        .leftJoin(events, eq(donations.eventId, events.id))
        .where(eq(donations.id, donationId));

      if (!donation?.donation || !donation?.event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Donation not found",
        });
      }

      const isDonationGoalReached =
        Number(donation.event.goalAmount) <=
        Number(donation.event.currentAmount) + Number(amount);

      if (isDonationGoalReached) {
        const [eventData] = await ctx.db
          .select({
            creatorEmail: users.email,
            companyEmail: companies.email,
            eventName: events.name,
          })
          .from(events)
          .leftJoin(companies, eq(events.companyId, companies.id))
          .leftJoin(users, eq(events.creatorId, users.id))
          .where(eq(events.id, donation.donation.eventId));

        if (eventData?.companyEmail && eventData.eventName) {
          sgService
            .onGoalReach(eventData.companyEmail, eventData.eventName)
            .catch((error) => {
              console.error("Error sending email:", error);
            });
        }

        if (eventData?.creatorEmail && eventData.eventName) {
          sgService
            .onGoalReach(eventData.creatorEmail, eventData.eventName)
            .catch((error) => {
              console.error("Error sending email:", error);
            });
        }
      }

      await ctx.db
        .update(events)
        .set({
          currentAmount: sql`${events.currentAmount} + ${amount ?? donation.donation.amount}`,
        })
        .where(eq(events.id, donation.donation.eventId));
    }),

  updateDonationStatus: publicProcedure
    .input(donationRouterValidationSchema.updateDonationStatus)
    .mutation(async ({ input, ctx }) => {
      const { id, status } = input;

      await ctx.db
        .update(donations)
        .set({
          status: status as
            | "none"
            | "pending"
            | SQL<unknown>
            | "success"
            | "error",
        })
        .where(eq(donations.id, id));
      return true;
    }),

  getUserDonations: protectedProcedure.query(async ({ ctx }) => {
    const userDonations = await ctx.db
      .select({
        donation: donations,
        event: events,
      })
      .from(donations)
      .where(eq(donations.userId, ctx.session.user.id))
      .leftJoin(events, eq(donations.eventId, events.id));
    return userDonations;
  }),
});
