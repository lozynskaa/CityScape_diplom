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
  const [amountValue, setAmountValue] = useState<number>();
  const [anonymous, setAnonymous] = useState(false);
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading } = api.event.getEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: initializePayment, isPending } =
    api.donation.initializePayment.useMutation();

  const handlePaymentCreate = async () => {
    if (
      !event?.currency ||
      !Number.isFinite(amountValue) ||
      Number.isNaN(amountValue)
    )
      return;

    try {
      const paymentData = await initializePayment({
        amount: amountValue!,
        currency: event.currency,
        eventId,
        anonymous,
      });

      if (paymentData) {
        const redirectUrl = paymentData._links.redirect.href;
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-center text-3xl font-bold">{event?.name}</h1>
        <Input
          disabled={isPending}
          type="number"
          name="amount"
          placeholder="Enter donation amount"
          label="Donation Amount"
          value={amountValue}
          onChange={(e) => setAmountValue(Number(e.target.value))}
          wrapperClassName="w-full"
        />
        <LabeledItem label="Donate Anonymously">
          <Switch checked={anonymous} onCheckedChange={setAnonymous} />
        </LabeledItem>
        <div>
          <p>
            Total Donated:{" "}
            <span className="font-bold">
              {event?.currentAmount}/{event?.goalAmount} {event?.currency}
            </span>
          </p>
        </div>
        <Button
          disabled={isPending || !amountValue || amountValue <= 0}
          className="w-full rounded-lg font-bold"
          type="button"
          onClick={handlePaymentCreate}
        >
          {isPending ? "Processing..." : "Donate"}
        </Button>
      </div>
    </div>
  );
}
