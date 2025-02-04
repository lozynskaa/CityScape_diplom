"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Spinner } from "~/app/_components/ui/spinner";
import { Switch } from "~/app/_components/ui/switch";
import { api } from "~/trpc/react";

export default function QuickDonatePage() {
  const [amountValue, setAmountValue] = useState<number>(0);
  const [anonymous, setAnonymous] = useState(false);
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading } = api.event.getEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: initializePayment, isPending } =
    api.donation.initializePayment.useMutation();

  const handlePaymentCreate = async () => {
    if (!event?.currency) return;

    // Call the backend to create the transaction
    const paymentData = await initializePayment({
      amount: amountValue,
      currency: event.currency,
      eventId,
      anonymous,
    });
    if (!paymentData) return;
    const urlToRedirect = paymentData._links.redirect.href;
    window.location.href = urlToRedirect;
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="w-full space-y-8 px-12 py-8">
        <div className="flex flex-col items-center justify-between gap-y-4">
          <h3 className="text-2xl font-bold">{event?.name}</h3>
          <Input
            disabled={isPending}
            type="number"
            name="amount"
            placeholder="Amount"
            label="Amount"
            onChange={(e) => setAmountValue(Number(e.target.value))}
            value={amountValue}
          />
          <LabeledItem label="Include Donations">
            <Switch checked={anonymous} onCheckedChange={setAnonymous} />
          </LabeledItem>
          <Button
            disabled={isPending}
            className="w-22 rounded-full font-bold"
            type="submit"
            onClick={handlePaymentCreate}
          >
            Donate
          </Button>
        </div>
      </div>
    </>
  );
}
