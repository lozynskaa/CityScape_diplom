import axios, { type AxiosInstance } from "axios";
import crypto from "crypto";

type PaymentLinkResponse = {
  id: string; // Must match the pattern ^pl_[A-Za-z0-9_-]{12}$
  _links: {
    self: {
      href: string; // The link URL
    };
    redirect: {
      href: string; // The link URL
    };
  };
  expires_on?: string; // ISO 8601 date-time format, optional
  reference?: string; // Optional reference identifier
  warnings?: Array<{
    code: string; // The reason for the warning
    description: string; // The description of the warning code
    value:
      | "card"
      | "sofort"
      | "ideal"
      | "knet"
      | "bancontact"
      | "eps"
      | "p24"
      | "multibanco"; // Enum of payment methods
  }>;
};

class CheckoutService {
  private signatureSecretKey: string = process.env.CHECKOUT_SIGNATURE_SECRET!;
  private checkout: AxiosInstance;

  constructor() {
    this.checkout = axios.create({
      baseURL: "https://api.sandbox.checkout.com",
      headers: {
        Authorization: process.env.CHECKOUT_PRIVATE_KEY,
      },
    });
  }

  async createPaymentLink(data: {
    amount: number;
    currency: string;
    country: string; //use for billing.address
    eventTitle: string; //use as display_name
    eventId: string;
    userId?: string;
    eventCompanyId: string;
    dateOfBirth: string;
    iBan: string;
    refId: string;
    firstName: string;
    lastName: string;
  }) {
    const {
      amount,
      currency,
      country,
      eventTitle,
      eventId,
      userId,
      eventCompanyId,
      dateOfBirth,
      iBan,
      refId,
      firstName,
      lastName,
    } = data;
    try {
      const response = await this.checkout.post<PaymentLinkResponse>(
        "/payment-links",
        {
          amount: amount,
          currency: currency,
          payment_type: "Regular",
          billing: {
            address: {
              country: country,
            },
          },
          processing_channel_id: "pc_jdqqmongbnqeljbi54whdzenmi",
          reference: refId,
          description: "Donation for event: " + eventTitle,
          display_name: eventTitle,
          expires_in: 604800,
          recipient: {
            zip: "79000",
            first_name: firstName,
            last_name: lastName,
            dob: dateOfBirth,
            account_number: iBan,
          },
          allow_payment_methods: ["card", "applepay", "googlepay"],
          disabled_payment_methods: ["eps", "ideal", "knet"],
          metadata: {
            eventId: eventId,
            userId: userId,
            eventCompanyId: eventCompanyId,
          },
          return_url: `${process.env.NEXTAUTH_URL}/donation/success`,
          locale: "en-GB",
          capture: true,
          capture_on: "2019-08-24T14:15:22Z",
        },
      );
      return response.data;
    } catch (error) {
      console.log("🚀 ~ CheckoutService ~ error:", error);
    }
  }

  validateSignature(signature: string, data: object) {
    const localSignature = crypto
      .createHmac("sha256", this.signatureSecretKey)
      .update(JSON.stringify(data))
      .digest("hex");

    return signature === localSignature;
  }
}

export const checkoutService = new CheckoutService();
