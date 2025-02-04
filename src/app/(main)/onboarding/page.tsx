"use client";

import { useRef, useState } from "react";
import { FirstStep } from "./step_1";
import { Button } from "~/app/_components/ui/button";
import { SecondStep } from "./step_2";
import { api } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/app/_components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { type CreateCompanyDetails } from "~/app/_components/create-company-form";
import { type CreateEventDetails } from "~/app/_components/create-event-form";

type ContentData = {
  component: typeof FirstStep | typeof SecondStep;
  description: string;
  title: string;
  disabled: (state: CreateCompanyDetails | CreateEventDetails) => boolean;
};

const contentByStep = new Map<number, ContentData>();

contentByStep.set(1, {
  component: FirstStep,
  description:
    "Let's get started by setting up your company profile and creating a fundraising event. Once you've completed these steps, you'll be able to take part in city-wide charity events.",
  title: "Welcome to CityScape!",
  disabled: (state: CreateCompanyDetails) =>
    !state.name ||
    !state.email ||
    !state.iBan ||
    state.iBan.length > 34 ||
    !state.phone ||
    !state.okpo ||
    !state.website ||
    !state.firstName ||
    !state.lastName ||
    !state.dateOfBirth ||
    !state.country,
});
contentByStep.set(2, {
  component: SecondStep,
  description:
    "Let's get started by setting up your company profile and creating a fundraising event. Once you've completed these steps, you'll be able to take part in city-wide charity events.",
  title: "Create you first fundraising event!",
  disabled: (state: CreateEventDetails) =>
    !state.category ||
    !state.purpose ||
    !state.name ||
    !state.currency ||
    !state.location ||
    !state.date,
});

const defaultBirthday = new Date();
defaultBirthday.setFullYear(defaultBirthday.getFullYear() - 22);

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [disabled, setDisabled] = useState(true);

  const companyDetailsRef = useRef<CreateCompanyDetails>({});
  const eventDetailsRef = useRef<CreateEventDetails>({});

  const { mutate: completeOnboarding } =
    api.company.completeOnboarding.useMutation();

  const {
    component: StepContent,
    description,
    title,
    disabled: disabledCallback,
  } = contentByStep.get(step) ?? ({} as ContentData);

  const handleNextStep = async () => {
    if (step === 2) {
      const filledCompanyDetails =
        companyDetailsRef.current as Required<CreateCompanyDetails>;
      const companyInfo = {
        name: filledCompanyDetails.name,
        website: filledCompanyDetails.website ?? "",
        okpo: filledCompanyDetails.okpo,
        dateOfBirth: filledCompanyDetails.dateOfBirth,
        firstName: filledCompanyDetails.firstName,
        lastName: filledCompanyDetails.lastName,
        country: filledCompanyDetails.country,
        companyEmail: filledCompanyDetails.email,
        companyIBAN: filledCompanyDetails.iBan,
        phoneNumber: filledCompanyDetails.phone,
        companyImage: filledCompanyDetails.imageFile,
        description: filledCompanyDetails.description ?? "",
      };

      const filledEventDetails =
        eventDetailsRef.current as Required<CreateEventDetails>;
      const eventInfo = {
        category: filledEventDetails.category,
        eventName: filledEventDetails.name,
        eventDescription: filledEventDetails.description ?? "",
        eventDate: filledEventDetails.date ?? new Date(),
        eventLocation: filledEventDetails.location ?? "",
        eventImage: filledEventDetails.imageFile,
        eventPurpose: filledEventDetails.purpose ?? "",
        goalAmount: Number(filledEventDetails.goalAmount),
        currency: filledEventDetails.currency ?? "USD",
        includeDonations: !filledEventDetails.withoutDonations,
      };
      completeOnboarding({
        company: companyInfo,
        event: eventInfo,
      });
      return router.push("/");
    }
    setStep((prev) => prev + 1);
  };

  const handleSkipOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skipOnboarding", "true");
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-y-8 py-10">
      <div className="w-2/3 space-y-2">
        <p className="text-base font-medium text-gray-950">Onboarding</p>
        <div className="h-3 w-full rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full bg-primary"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
        <p className="text-sm font-medium text-gray-400">Step {step} of 2</p>
      </div>
      <div className="flex flex-col items-center gap-y-4">
        <h1 className="text-2xl font-bold text-gray-950">{title}</h1>
        <p className="w-2/3 text-center text-base font-medium text-gray-950">
          {description}
        </p>
      </div>
      <StepContent
        details={step === 1 ? companyDetailsRef : eventDetailsRef}
        disabledCallback={disabledCallback}
        setDisabled={setDisabled}
      />
      <footer className="flex w-96 flex-row items-center justify-center gap-x-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="flex-1 rounded-full text-sm font-bold"
              variant="ghost"
            >
              Skip
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSkipOnboarding}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          className="flex-1 rounded-full text-sm font-bold"
          disabled={disabled}
          onClick={handleNextStep}
        >
          Continue
        </Button>
      </footer>
    </div>
  );
}
