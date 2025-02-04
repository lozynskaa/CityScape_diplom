"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function QuickDonatePage() {
  const [step, setStep] = useState(1);
  const [amountValue, setAmountValue] = useState<number>(0);
  const { eventId } = useParams<{ eventId: string }>();
  const [embeddedFormHTML, setEmbeddedFormHTML] = useState<string>("");

  const { data: event, isLoading } = api.event.getEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: createTransactionForm } =
    api.donation.createTransactionForm.useMutation();

  const handlePaymentCreate = async () => {
    if (!event?.currency) return;

    // Call the backend to create the transaction
    const formHTML = await createTransactionForm({
      amount: amountValue,
      currency: event.currency,
      eventId,
      eventCompanyId: event.companyId,
      anonymous: false,
    });
    setEmbeddedFormHTML(formHTML);
    setStep(2);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
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
              onClick={handlePaymentCreate}
            >
              Donate
            </Button>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center gap-y-4">
            <h1 className="text-4xl font-bold">{event?.name}</h1>
            <p className="text-2xl font-bold">Amount: ${amountValue}</p>
            <div dangerouslySetInnerHTML={{ __html: embeddedFormHTML }}></div>
          </div>
        )}
      </div>
    </>
  );
}
