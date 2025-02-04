import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import { wayforpay } from "~/server/payment/wayforpay";

type WebhookData = {
  merchantAccount: string;
  orderReference: string;
  merchantSignature: string;
  amount: number;
  currency: string;
  authCode: string;
  email: string;
  phone: string;
  createdDate: number;
  processingDate: number;
  cardPan: string;
  cardType: string;
  issuerBankCountry: string;
  issuerBankName: string;
  recToken: string;
  transactionStatus: string;
  reason: string;
  reasonCode: string;
  fee: number;
  paymentSystem: string;
};

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw requests
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Get the raw body of the request

  const parsedBody: WebhookData = JSON.parse(rawBody);

  const signature = parsedBody?.merchantSignature;

  // Verify the signature
  const isValid = wayforpay.verifyWebhookSignature(parsedBody, signature);

  if (!isValid) {
    console.error("Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (parsedBody.transactionStatus === "Approved") {
    const paymentResult = await api.donation.initializePayoutToCompany({
      donationId: parsedBody.orderReference,
      amount: parsedBody.amount,
      currency: parsedBody.currency,
    });
    console.log("Payment successful");
    await api.donation.updateDonationStatus({
      id: parsedBody.orderReference,
      status:
        paymentResult.transactionStatus === "Approved" ? "completed" : "failed",
    });
    await api.donation.addDonatedAmount({
      donationId: parsedBody.orderReference,
    });
  } else {
    // Handle failed payment
    console.log("Payment failed");
    await api.donation.updateDonationStatus({
      id: parsedBody.orderReference,
      status: "failed",
    });
  }

  return NextResponse.json({ message: "Webhook processed successfully" });
}
