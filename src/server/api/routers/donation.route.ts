import { TRPCError } from "@trpc/server";
import { eq, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { companies } from "~/server/db/company.schema";
import { donations } from "~/server/db/donations.schema";
import { events } from "~/server/db/event.schema";
import { gateway } from "~/server/payment/braintree";

const donationRouterValidationSchema = {
  createBraintreeTransaction: z.object({
    amount: z.number(),
    currency: z.string(),
    eventCompanyId: z.string(),
    eventId: z.string(),
    anonymous: z.boolean().optional().default(false),
    nonce: z.string(),
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
  createBraintreeTransaction: publicProcedure
    .input(donationRouterValidationSchema.createBraintreeTransaction)
    .mutation(async ({ input, ctx }) => {
      const { amount, currency, eventId, eventCompanyId, anonymous, nonce } =
        input;

      const userId = ctx?.session?.user.id;

      const [company] = await ctx.db
        .select({
          braintreeAccountId: companies.braintreeAccountId,
        })
        .from(companies)
        .where(eq(companies.id, eventCompanyId));

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const transactionRequest = {
        amount: amount.toFixed(2), // Total amount to be charged
        currencyIsoCode: currency.toUpperCase(), // Currency code (Braintree expects uppercase)
        paymentMethodNonce: nonce, // Payment method nonce (obtained from the client)
        options: {
          submitForSettlement: true, // Automatically submit the payment
        },
        merchantAccountId: company.braintreeAccountId, // The connected sub-merchant account
        customFields: {
          eventCompanyId,
          eventId,
          userId: userId ?? null,
          anonymous: (!userId || anonymous).toString(),
          amount: amount.toFixed(2),
        },
        // Adding the platform fee (5% fee, similar to Stripe's application_fee_amount)
        serviceFeeAmount: Math.floor(amount * 0.05).toFixed(2), // 5% service fee
      };

      try {
        const result = await gateway.transaction.sale(transactionRequest);
        if (result.success) {
          console.log(
            "Transaction created successfully:",
            result.transaction.id,
          );
          return result.transaction; // Handle the successful transaction (you can return the transaction ID)
        } else {
          console.error("Transaction failed:", result.message);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.message,
          });
        }
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating transaction",
        });
      }
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
          braintreeAccountId: companies.braintreeAccountId,
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

  generateClientSecret: publicProcedure.query(async () => {
    return await gateway.clientToken.generate({});
  }),
});
