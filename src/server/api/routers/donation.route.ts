import { TRPCError } from "@trpc/server";
import { eq, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { parseIban } from "~/lib/iban";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { companies } from "~/server/db/company.schema";
import { donations } from "~/server/db/donations.schema";
import { events } from "~/server/db/event.schema";
import { users } from "~/server/db/user.schema";
import { liqpay } from "~/server/payment/liqpay";

const donationRouterValidationSchema = {
  createTransactionForm: z.object({
    amount: z.number(),
    currency: z.string(),
    eventCompanyId: z.string(),
    eventId: z.string(),
    anonymous: z.boolean().optional().default(false),
  }),
  updateDonation: z.object({
    amount: z.number(),
    currency: z.string(),
    eventCompanyId: z.string(),
    transactionId: z.string(),
    eventId: z.string(),
    donationId: z.string(),
  }),
  initializePayoutToCompany: z.object({
    orderData: z.string(),
    transactionId: z.string(),
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
  createTransactionForm: publicProcedure
    .input(donationRouterValidationSchema.createTransactionForm)
    .mutation(async ({ input, ctx }) => {
      const { amount, currency, eventId, eventCompanyId, anonymous } = input;

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
          // donationDate: new Date(),
          // receiptUrl: paymentTransfer.receipt_url,
        })
        .returning();

      const formHTML = liqpay.cnb_form({
        action: "pay",
        amount: amount,
        currency: currency,
        description: `Donation for event ${event?.name}.`,
        order_id: `${eventId}/${eventCompanyId}/${userId}/${anonymous}/${donation?.id}`,
        version: "3",
        return_url: process.env.LIQPAY_WEBHOOK_BASE_URL + "/donation/success",
        server_url:
          process.env.LIQPAY_WEBHOOK_BASE_URL + "/api/webhooks/liqpay",
      });

      return formHTML;
    }),

  initializePayoutToCompany: publicProcedure
    .input(donationRouterValidationSchema.initializePayoutToCompany)
    .mutation(async ({ input, ctx }) => {
      const { transactionId, orderData, amount, currency } = input;
      const [eventId, eventCompanyId, userId, anonymous, donationId] =
        orderData.split("/");

      if (!eventId || !eventCompanyId || !userId || !anonymous || !donationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid order data",
        });
      }

      const [company] = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, eventCompanyId));

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      const [firstName = "UNKNOWN", lastName = "USER"] =
        user?.name.split(" ") ?? [];

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const { mfo, account } = parseIban(company.iBan);

      try {
        const payoutData = await liqpay.api("request", {
          action: "p2pcredit",
          version: "3",
          amount: amount,
          currency: currency,
          description: `Donation for event ${company.name}. Payout to ${company.name}.`,
          order_id: `${transactionId}/${donationId}`,
          receiver_last_name: firstName,
          receiver_first_name: lastName,
          receiver_card: "4242424242424242",
          // receiver_company: company.iBan,
          // receiver_account: account,
          // receiver_okpo: company.okpo,
          // receiver_mfo: mfo,
          receiver_email: company.email,
        });
        console.log("🚀 ~ .mutation ~ payoutData:", payoutData);
      } catch (error) {
        console.log("🚀 ~ .mutation ~ error:", error);
      }

      return true;
    }),

  updateDonation: publicProcedure
    .input(donationRouterValidationSchema.updateDonation)
    .mutation(async ({ input, ctx }) => {
      const { amount, currency, transactionId, eventId, donationId } = input;

      await ctx.db
        .update(events)
        .set({
          currentAmount: sql`${events.currentAmount} + ${amount.toFixed(2)}`,
        })
        .where(eq(events.id, eventId));

      try {
        const [donation] = await ctx.db
          .update(donations)
          .set({
            transactionId,
            status: "pending",
            amount: Number(amount).toFixed(2),
            currency,
          })
          .where(eq(donations.id, donationId))
          .returning();
        return donation;
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating transaction",
        });
      }
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
