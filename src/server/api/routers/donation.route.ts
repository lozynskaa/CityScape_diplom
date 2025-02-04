import { TRPCError } from "@trpc/server";
import { eq, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { companies } from "~/server/db/company.schema";
import { donations } from "~/server/db/donations.schema";
import { events } from "~/server/db/event.schema";
import { wayforpay } from "~/server/payment/wayforpay";

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

      const response = await wayforpay.initPayment({
        merchantDomainName: "www.671d-178-212-96-198.ngrok-free.app",
        amount: amount.toFixed(2),
        // returnUrl: "http://localhost:3000/donation/success",
        serviceUrl:
          "https://671d-178-212-96-198.ngrok-free.app/webhooks/wayforpay",
        orderReference: donation.id,
        orderDate: `${Date.now()}`,
        currency,
        productName: [event.name],
        productPrice: [amount.toFixed(2)],
        productCount: [1],
      });

      return response;
    }),

  initializePayoutToCompany: publicProcedure
    .input(donationRouterValidationSchema.initializePayoutToCompany)
    .mutation(async ({ input, ctx }) => {
      const { donationId, amount, currency } = input;

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

      const [event] = await ctx.db
        .select()
        .from(events)
        .where(eq(events.id, donation.eventId));

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const [company] = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, event.companyId));

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      await ctx.db
        .update(donations)
        .set({
          amount: amount.toFixed(2),
          currency,
        })
        .where(eq(donations.id, donation.id));

      const payoutResult = await wayforpay.initMerchantPayout({
        orderReference: donationId,
        amount,
        currency,
        iban: company.iBan,
        okpo: company.okpo,
        accountName: company.name,
        description: `Donation to ${company.name}. Event: ${event.name}`,
      });

      return payoutResult;
    }),

  removeDonatedAmount: publicProcedure
    .input(donationRouterValidationSchema.removeDonatedAmount)
    .mutation(async ({ input, ctx }) => {
      const { donationId } = input;

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
          currentAmount: sql`${events.currentAmount} - ${donation.amount}`,
        })
        .where(eq(events.id, donation.eventId));
    }),

  addDonatedAmount: publicProcedure
    .input(donationRouterValidationSchema.removeDonatedAmount)
    .mutation(async ({ input, ctx }) => {
      const { donationId } = input;

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
          currentAmount: sql`${events.currentAmount} + ${donation.amount}`,
        })
        .where(eq(events.id, donation.eventId));
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
});
