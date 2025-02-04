import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import { LiqPay } from "~/server/payment/liqpay";

const liqpay = new LiqPay(
  process.env.LIQPAY_PUBLIC_KEY,
  process.env.LIQPAY_PRIVATE_KEY,
);

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw requests
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Get the raw body of the request
  const dataParams = new URLSearchParams(rawBody);
  const data = dataParams.get("data");
  const signature = dataParams.get("signature");

  // Verify the signature
  const expectedSignature = liqpay.str_to_sign(
    process.env.LIQPAY_PRIVATE_KEY! + data + process.env.LIQPAY_PRIVATE_KEY!,
  );

  if (signature !== expectedSignature || !data) {
    console.error("Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsedData = JSON.parse(Buffer.from(data, "base64").toString());

  // Handle payment status
  const paymentStatus = parsedData?.status;
  const paymentAction = parsedData?.action;

  switch (paymentAction) {
    case "pay":
      const [eventId, eventCompanyId, userId, anonymous, donationId] =
        parsedData?.order_id?.split("/") || [];
      if (paymentStatus === "success") {
        console.log("Payment successful");
        const amount = parsedData?.amount;
        const currency = parsedData?.currency;

        const newDonation = await api.donation.updateDonation({
          donationId,
          eventId,
          eventCompanyId,
          amount: Number(amount),
          currency,
          transactionId: `${parsedData.payment_id}`,
        });
        await api.donation.initializePayoutToCompany({
          orderData: parsedData.order_id,
          transactionId: `${parsedData.payment_id}/${newDonation?.id}`,
          amount: Number(amount),
          currency,
        });
      } else {
        console.log("Payment failed. Reason:" + parsedData?.err_description);
        await api.donation.updateDonationStatus({
          id: donationId,
          status: "failed",
        });
      }
      break;

    case "p2pcredit":
      const [transactionId, donationPayoutId] =
        parsedData?.payment_id?.split("/") || [];
      if (paymentStatus === "success") {
        console.log("Payout successful");
        await api.donation.updateDonationStatus({
          id: donationPayoutId,
          status: "completed",
        });
      } else {
        console.log("Payout failed. Reason:" + parsedData?.err_description);
        await api.donation.removeDonatedAmount({
          donationId: donationPayoutId,
        });
        await api.donation.updateDonationStatus({
          id: donationPayoutId,
          status: "failed",
        });
      }
      break;
    default:
      break;
  }

  if (paymentStatus === "success") {
    // Handle successful payment
  } else if (paymentStatus === "failure") {
    // Handle failed payment
    console.log("Payment failed");
    // TODO: Update database, send notification, etc.
  } else {
    console.log("Unknown payment status");
  }

  return NextResponse.json({ message: "Webhook processed successfully" });
}
