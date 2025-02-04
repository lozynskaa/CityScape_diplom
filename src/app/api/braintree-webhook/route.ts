import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import { gateway } from "~/server/payment/braintree";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw requests
  },
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get("bt-signature") ?? "";
  //   const webhookSecret = process.env.BRAINTREE_WEBHOOK_SECRET ?? "";

  let webhookNotification;

  try {
    const rawBody = await req.text(); // Read the raw body

    // Verifying the webhook signature
    webhookNotification = await gateway.webhookNotification.parse(
      signature,
      rawBody,
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
    }
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle specific event types
  if (webhookNotification.kind === "sub_merchant_account_approved") {
    const account = webhookNotification.merchantAccount;
    if (account.id) {
      console.log(`Account ${account.id} onboarding completed!`);
      void api.company.linkWebhookTrigger({ braintreeAccountId: account.id });
    }
  }

  if (webhookNotification.kind === "transaction_settled") {
    const transaction = webhookNotification.transaction;

    await api.donation.updateDonationStatus({
      id: transaction.id,
      status: "completed",
    });

    return NextResponse.redirect("http://localhost:3000/donation/success");
  }

  if (webhookNotification.kind === "transaction_disbursed") {
    const transaction = webhookNotification.transaction;

    await api.donation.updateDonationStatus({
      id: transaction.id,
      status: "failed",
    });

    return NextResponse.redirect("http://localhost:3000/donation/failure");
  }

  return NextResponse.json({ received: true });
}
