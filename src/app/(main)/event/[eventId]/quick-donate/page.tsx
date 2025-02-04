"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";
import DropIn from "braintree-web-drop-in-react";
import { type Dropin } from "braintree-web-drop-in";

export default function QuickDonatePage() {
  const [step, setStep] = useState(1);
  const [amountValue, setAmountValue] = useState<number>(0);
  const { eventId } = useParams<{ eventId: string }>();
  const braintreeInstanceRef = useRef<Dropin>();

  const { data: event, isFetching } = api.event.getEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: createBraintreeTransaction } =
    api.donation.createBraintreeTransaction.useMutation();
  const { data: clientToken } = api.donation.generateClientSecret.useQuery();

  if (isFetching) {
    return <Spinner />;
  }

  const handlePaymentSubmit = async () => {
    if (!braintreeInstanceRef.current || !event) return;

    // Request a nonce from the Drop-in UI
    braintreeInstanceRef.current.requestPaymentMethod(async (err, payload) => {
      if (err) {
        console.error("Payment method error:", err);
        return;
      }

      // Call the backend to create the transaction
      const result = await createBraintreeTransaction({
        amount: amountValue,
        currency: "USD", // Adjust currency if needed
        eventId,
        eventCompanyId: event.companyId,
        anonymous: false, // Adjust if you want to capture anonymous donations
        nonce: payload.nonce,
      });

      console.log("Transaction result:", result);
    });
  };

  return (
    <div className="w-full space-y-8 px-12 py-8">
      {step === 1 && (
        <div className="flex flex-col items-center justify-between gap-y-4">
          <h3 className="text-2xl font-bold">{event?.name}</h3>
          <Input
            type="number"
            name="amount"
            placeholder="Amount"
            label="Amount"
            onChange={(e) => setAmountValue(Number(e.target.value))}
            value={amountValue}
          />
          <Button
            className="w-22 rounded-full font-bold"
            onClick={() => setStep(2)}
          >
            Donate
          </Button>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center gap-y-4">
          <h1 className="text-4xl font-bold">{event?.name}</h1>
          <p className="text-2xl font-bold">Amount: ${amountValue}</p>
          <DropIn
            options={{ authorization: clientToken!.clientToken }}
            onInstance={(instance) => (braintreeInstanceRef.current = instance)}
          />
          <Button
            className="w-22 rounded-full font-bold"
            onClick={handlePaymentSubmit}
          >
            Donate
          </Button>
        </div>
      )}
    </div>
  );
}
