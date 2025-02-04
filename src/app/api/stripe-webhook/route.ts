import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "~/server/stripe";
import { api } from "~/trpc/server";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw requests
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event;

  try {
    const rawBody = await req.text(); // Read the raw body
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    if (err instanceof Error) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
    }
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle specific event types
  if (event.type === "account.updated") {
    const account: Stripe.Account = event.data.object;
    if (account.details_submitted) {
      console.log(`Account ${account.id} onboarding completed!`);
      void api.company.linkWebhookTrigger({ stripeAccountId: account.id });
    }
  }

  if (
    event.type === "checkout.session.completed" &&
    event.data.object?.metadata?.eventId &&
    event.data.object?.payment_intent
  ) {
    const session: Stripe.Checkout.Session = event.data.object;
    const { eventCompanyId, anonymous, userId, eventId } = session.metadata as {
      eventId: string;
      anonymous: string;
      userId: string | null;
      eventCompanyId: string;
    };

    await api.donation.createDonation({
      amount: Number(session.amount_total) / 100,
      currency: session.currency!,
      anonymous: anonymous === "true",
      eventCompanyId: eventCompanyId,
      eventId,
      paymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent.toString()
          : "",
      status: "pending",
      userId,
    });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent: Stripe.PaymentIntent = event.data.object;

    await api.donation.updateDonationStatus({
      id: paymentIntent.id,
      status: "completed",
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent: Stripe.PaymentIntent = event.data.object;

    await api.donation.updateDonationStatus({
      id: paymentIntent.id,
      status: "failed",
    });
  }
  return NextResponse.json({ received: true });
}
