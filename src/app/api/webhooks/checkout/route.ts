import { type NextRequest, NextResponse } from "next/server";
import { checkoutService } from "~/server/payment/checkout";
import { api } from "~/trpc/server";

interface Event {
  id: string;
  type: string;
  version: string;
  created_on: string;
  data: PaymentData;
  _links: Links;
}

interface PaymentData {
  id: string;
  action_id: string;
  reference: string;
  amount: number;
  auth_code: string;
  currency: string;
  customer: Customer;
  payment_type: string;
  processed_on: string;
  processing: Processing;
  response_code: string;
  response_summary: string;
  risk: Risk;
  scheme_id: string;
  source: Source;
  balances: Balances;
  event_links: EventLinks;
  pan_type_processed: string;
  cko_network_token_available: boolean;
  payment_ip: string;
}

interface Customer {
  id: string;
  email: string;
}

interface Processing {
  acquirer_transaction_id: string;
  retrieval_reference_number: string;
  aft: string;
  scheme: string;
}

interface Risk {
  flagged: boolean;
  score: number;
}

interface Source {
  id: string;
  type: string;
  billing_address: BillingAddress;
  expiry_month: number;
  expiry_year: number;
  name: string;
  scheme: string;
  last_4: string;
  fingerprint: string;
  bin: string;
  card_type: string;
  card_category: string;
  issuer: string;
  issuer_country: string;
  product_type: string;
  avs_check: string;
  cvv_check: string;
}

interface BillingAddress {
  line1: string;
  line2: string;
  town_city: string;
  state: string;
  zip: string;
  country: string;
}

interface Balances {
  total_authorized: number;
  total_voided: number;
  available_to_void: number;
  total_captured: number;
  available_to_capture: number;
  total_refunded: number;
  available_to_refund: number;
}

interface EventLinks {
  payment: string;
  payment_actions: string;
  capture: string;
  void: string;
}

interface Links {
  self: Link;
  subject: Link;
  payment_actions: Link;
  capture: Link;
  payment: Link;
  void: Link;
}

interface Link {
  href: string;
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw requests
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Get the raw body of the request
  const headers = req.headers;

  const signature = headers.get("cko-signature");
  const authorization = headers.get("authorization");

  if (authorization !== process.env.CHECKOUT_AUTHORIZATION) {
    console.error("Invalid authorization");
    return NextResponse.json(
      { error: "Invalid authorization" },
      { status: 401 },
    );
  }
  const parsedBody: Event = JSON.parse(rawBody);

  const isValidSignature = checkoutService.validateSignature(
    signature!,
    parsedBody,
  );

  if (!signature || !isValidSignature) {
    console.error("Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = parsedBody?.type;

  if (
    (eventType === "payment_approved" || eventType === "payment_captured") &&
    parsedBody.data.response_summary === "Approved"
  ) {
    console.log("Payment successful");
    await api.donation.updateDonationStatus({
      id: parsedBody.data.reference,
      status: "completed",
    });
    await api.donation.addDonatedAmount({
      donationId: parsedBody.data.reference,
      amount: parsedBody.data.amount,
    });
  } else {
    // Handle failed payment
    console.log("Payment failed");
    await api.donation.updateDonationStatus({
      id: parsedBody.data.reference,
      status: "failed",
    });
  }

  return NextResponse.json({ message: "Webhook processed successfully" });
}
