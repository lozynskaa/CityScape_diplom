import { TRPCError } from "@trpc/server";
import { eq, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { companies } from "~/server/db/company.schema";
import { donations } from "~/server/db/donations.schema";
import { events } from "~/server/db/event.schema";
import { stripe } from "~/server/stripe";

const donationRouterValidationSchema = {
  createPaymentIntends: z.object({
    amount: z.number(),
    currency: z.string(),
    eventCompanyId: z.string(),
    eventId: z.string(),
    anonymous: z.boolean().optional().default(false),
  }),
  createDonation: z.object({
    amount: z.number(),
    currency: z.string(),
    anonymous: z.boolean().default(false),
    eventCompanyId: z.string(),
    paymentId: z.string(),
    userId: z.string().nullable(),
    status: z
      .enum(["pending", "completed", "failed"])
      .optional()
      .default("pending"),
    eventId: z.string(),
  }),
  updateDonationStatus: z.object({
    id: z.string(),
    status: z.enum(["pending", "completed", "failed"]).default("pending"),
  }),
  getSession: z.object({
    id: z.string(),
  }),
};

export const donationRouter = createTRPCRouter({
  createPaymentIntends: publicProcedure
    .input(donationRouterValidationSchema.createPaymentIntends)
    .mutation(async ({ input, ctx }) => {
      const { amount, currency, eventId, eventCompanyId, anonymous } = input;

      const userId = ctx?.session?.user.id;

      const [company] = await ctx.db
        .select({
          stripeAccountId: companies.stripeAccountId,
        })
        .from(companies)
        .where(eq(companies.id, eventCompanyId));

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(), // Change to your preferred currency
              product_data: {
                name: "Custom Donation",
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: Math.floor(amount * 0.05), // Example: 5% fee
          transfer_data: {
            destination: company.stripeAccountId, // Replace with your connected account ID
          },
        },
        metadata: {
          eventCompanyId,
          eventId,
          userId: userId ?? null,
          anonymous: (!userId || anonymous).toString(),
          amount: amount.toFixed(2),
        },
        ui_mode: "embedded",
        return_url: `http://localhost:3000/api/donation/handler?session_id={CHECKOUT_SESSION_ID}`,
        redirect_on_completion: "always",
      });
      return session;
    }),

  createDonation: publicProcedure
    .input(donationRouterValidationSchema.createDonation)
    .mutation(async ({ input, ctx }) => {
      const {
        amount,
        currency,
        anonymous,
        eventCompanyId,
        eventId,
        paymentId,
        status,
        userId,
      } = input;
      const [company] = await ctx.db
        .select({
          id: companies.id,
          stripeAccountId: companies.stripeAccountId,
        })
        .from(companies)
        .where(eq(companies.id, eventCompanyId));

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      await ctx.db
        .update(events)
        .set({
          currentAmount: sql`${events.currentAmount} + ${amount.toFixed(2)}`,
        })
        .where(eq(events.id, eventId));

      await ctx.db.insert(donations).values({
        amount: amount.toFixed(2),
        currency,
        anonymous,
        userId,
        eventId,
        // donationDate: new Date(),
        // receiptUrl: paymentTransfer.receipt_url,
        transactionId: paymentId,
        status: status as
          | "none"
          | "pending"
          | SQL<unknown>
          | "success"
          | "error",
      });
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
        .where(eq(donations.transactionId, id));
    }),

  getSession: publicProcedure
    .input(donationRouterValidationSchema.getSession)
    .query(async ({ input }) => {
      const { id } = input;
      const session = await stripe.checkout.sessions.retrieve(id);
      return session;
    }),
});
