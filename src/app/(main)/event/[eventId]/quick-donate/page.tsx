"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import EmbeddedUIProvider from "~/app/_components/stripe/embedded-ui-provider";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function QuickDonatePage() {
  const [step, setStep] = useState(1);
  const [amountValue, setAmountValue] = useState<number>(0);
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isFetching } = api.event.getEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: createPaymentIntends } =
    api.donation.createPaymentIntends.useMutation();

  if (isFetching) {
    return <Spinner />;
  }

  const handleCreateIntend = async () => {
    const paymentSession = await createPaymentIntends({
      amount: amountValue,
      currency: "usd",
      eventCompanyId: event!.companyId,
      eventId: event!.id,
    });
    return paymentSession.client_secret!;
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
          <EmbeddedUIProvider fetchClientSecret={handleCreateIntend} />
        </div>
      )}
    </div>
  );
}
