import axios, { type AxiosResponse, type AxiosInstance } from "axios";
import crypto from "crypto";

export class WayForPay {
  private merchantAccount: string;
  private secretKey: string;
  private axios: AxiosInstance;

  constructor(merchantAccount: string, secretKey: string) {
    this.merchantAccount = merchantAccount;
    this.secretKey = secretKey;
    this.axios = axios.create({
      baseURL: "https://api.wayforpay.com",
    });
  }

  public createSignature(
    data: Record<string, string | number | (string | number)[]>,
    requiredKeys: string[],
  ): string {
    const joinedParameters = requiredKeys.reduce(
      (acc: string, key: string, index: number) => {
        if (!data[key]) throw new Error("Key is missing:" + key);
        if (Array.isArray(data[key])) {
          acc += `${data[key].join(";")}`;
          if (index !== requiredKeys.length - 1) acc += ";";
        } else {
          acc += `${data[key]}`;
          if (index !== requiredKeys.length - 1) acc += ";";
        }
        return acc;
      },
      "",
    );

    return crypto
      .createHmac("md5", this.secretKey)
      .update(joinedParameters)
      .digest("hex");
  }

  public verifyWebhookSignature(
    data: Record<string, string | number | Array<string | number>>,
    signature: string,
  ): boolean {
    const requiredKeys = [
      "merchantAccount",
      "orderReference",
      "amount",
      "currency",
      "authCode",
      "cardPan",
      "transactionStatus",
      "reasonCode",
    ];
    const localSignature = this.createSignature(data, requiredKeys);

    return localSignature === signature;
  }

  async addMerchantAccount(data: {
    site: string;
    phone: string;
    email: string;
    description: string;
    compensationCardHolder: string;
    compensationAccount: string;
    compensationAccountMfo: string;
    compensationAccountOkpo: string;
    compensationAccountName: string;
    merchantAccount?: string;
  }) {
    const requiredKeys = ["merchantAccount", "site", "phone", "email"];

    const payload = {
      ...data,
      merchantAccount: this.merchantAccount,
      signature: "",
    };

    const signature = this.createSignature(data, requiredKeys);

    payload.signature = signature;

    const response = await this.axios.post<
      AxiosResponse<{
        reason: string;
        reasonCode: string;
        merchantAccount: string;
        secretKey: string;
      }>
    >("/mms/addMerchant.php", payload);
    return response.data;
  }

  async initPayment(data: {
    merchantDomainName: string;
    orderReference: string;
    orderDate: string;
    amount: string;
    currency: string;
    productName: string[];
    productPrice: string[];
    productCount: number[];
    clientAccountId?: string;
    returnUrl?: string;
    serviceUrl?: string;
  }): Promise<string> {
    const requiredKeys = [
      "merchantAccount",
      "merchantDomainName",
      "orderReference",
      "orderDate",
      "amount",
      "currency",
      "productName",
      "productCount",
      "productPrice",
    ];
    const filledData = {
      ...data,
      merchantAccount: this.merchantAccount,
      merchantTransactionSecureType: "AUTO",
      merchantAuthType: "SimpleSignature",
    };
    const signature = this.createSignature(filledData, requiredKeys);

    let formHtml = `<form action="https://secure.wayforpay.com/pay" method="post" accept-charset="utf-8">`;

    Object.keys(filledData).forEach((key) => {
      const typedKey = key as keyof Required<typeof filledData>;
      if (Array.isArray(filledData[typedKey])) {
        filledData[typedKey].forEach((item: string | number) => {
          formHtml += `<input type=\"hidden\" name=\"${key}[]\" value=\"${item}\" />`;
        });
      } else {
        formHtml += `<input type=\"hidden\" name=\"${key}\" value=\"${filledData[typedKey]}\" />`;
      }
    });

    formHtml += `<input type=\"hidden\" name=\"merchantSignature\" value=\"${signature}\" />`;
    formHtml += `<button type=\"submit\">Proceed</button>`;
    formHtml += `</form>`;

    return formHtml;
  }

  async initMerchantPayout(data: {
    orderReference: string;
    amount: number;
    currency: string;
    iban: string;
    okpo: string;
    accountName: string;
    description: string;
  }) {
    const requiredKeys = [
      "merchantAccount",
      "orderReference",
      "amount",
      "currency",
      "iban",
      "okpo",
      "accountName",
    ];

    const filledData = {
      ...data,
      transactionType: "P2P_ACCOUNT",
      merchantAccount: "test_merch_p2p",
      signature: "",
      apiVersion: 1,
    };

    const signature = this.createSignature(filledData, requiredKeys);

    filledData.signature = signature;

    const response = await this.axios.post<{
      merchantAccount: string;
      orderReference: string;
      merchantSignature: string;
      amount: number;
      currency: string;
      createdDate: number;
      processingDate: number;
      transactionStatus: string;
      reason: string;
      reasonCode: number;
    }>("/api", filledData);

    return response.data;
  }
}

export const wayforpay = new WayForPay(
  process.env.WAYFORPAY_LOGIN!,
  process.env.WAYFORPAY_PRIVATE_KEY!,
);
