"use client";

import { useState } from "react";
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

export type CompanyInfoState = {
  //company
  name: string;
  description?: string;
  companyEmail: string;
  category: string;
  website?: string;
  companyImage?: string;
  //event
  eventName: string;
  eventDescription?: string;
  eventDate: Date;
  eventPurpose: string;
  eventLocation: string;
  eventImage?: string;
  goalAmount: number;
  includeDonations: boolean;
  currency: string;
};

type ContentData = {
  component: typeof FirstStep | typeof SecondStep;
  loadFileKey: "companyImage" | "eventImage";
  description: string;
  title: string;
  disabled: (state: CompanyInfoState) => boolean;
};

const contentByStep = new Map<number, ContentData>();

contentByStep.set(1, {
  component: FirstStep,
  loadFileKey: "companyImage",
  description:
    "Let's get started by setting up your company profile and creating a fundraising event. Once you've completed these steps, you'll be able to take part in city-wide charity events.",
  title: "Welcome to CityScape!",
  disabled: (state: CompanyInfoState) =>
    !state.category || !state.name || !state.companyEmail,
});
contentByStep.set(2, {
  component: SecondStep,
  loadFileKey: "eventImage",
  description:
    "Let's get started by setting up your company profile and creating a fundraising event. Once you've completed these steps, you'll be able to take part in city-wide charity events.",
  title: "Create you first fundraising event!",
  disabled: (state: CompanyInfoState) =>
    !state.eventPurpose ||
    !state.eventName ||
    !state.currency ||
    !state.eventLocation ||
    !state.eventDate,
});

const DEFAULT_STATE: CompanyInfoState = {
  //company
  name: "",
  description: "",
  companyEmail: "",
  category: "",
  website: "",
  companyImage: "",
  //event
  eventName: "",
  eventDescription: "",
  eventLocation: "",
  eventDate: new Date(),
  eventPurpose: "",
  goalAmount: 0,
  includeDonations: false,
  currency: "USD",
  eventImage: "",
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [companyInfo, setCompanyInfo] =
    useState<CompanyInfoState>(DEFAULT_STATE);

  const { mutate: completeOnboarding } =
    api.company.completeOnboarding.useMutation();

  const {
    component: StepContent,
    description,
    title,
    loadFileKey,
    disabled,
  } = contentByStep.get(step) ?? ({} as ContentData);

  const handleNextStep = async () => {
    if (step === 2) {
      completeOnboarding({
        //company
        category: companyInfo.category,
        companyEmail: companyInfo.companyEmail,
        currency: companyInfo.currency,
        description: companyInfo.description,
        name: companyInfo.name,
        website: companyInfo.website,
        companyImage: companyInfo.companyImage,
        //event
        eventDate: companyInfo.eventDate,
        eventDescription: companyInfo.eventDescription,
        eventLocation: companyInfo.eventLocation,
        eventPurpose: companyInfo.eventPurpose,
        eventName: companyInfo.eventName,
        eventImage: companyInfo.eventImage,
        goalAmount: companyInfo.goalAmount,
        includeDonations: companyInfo.includeDonations,
      });
      return setStep(1);
    }
    setStep((prev) => prev + 1);
  };

  const handleLoadFile =
    (key: "eventImage" | "companyImage") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const fileUrl = URL.createObjectURL(file!);
      if (file && fileUrl) {
        setCompanyInfo((prev) => ({ ...prev, [key]: fileUrl }));
      }
    };

  const handleSkipOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skipOnboarding", "true");
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-y-8 pt-10">
      <div className="w-2/3 space-y-2">
        <p className="text-base font-medium text-gray-950">Onboarding</p>
        <div className="h-3 w-full rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full bg-emerald-400"
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
        companyDetails={companyInfo}
        setCompanyDetails={setCompanyInfo}
        handleLoadFile={handleLoadFile(loadFileKey)}
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
          className="flex-1 rounded-full bg-emerald-400 text-sm font-bold text-gray-950 hover:bg-emerald-500 focus:bg-emerald-500 active:bg-emerald-500"
          disabled={disabled(companyInfo)}
          onClick={handleNextStep}
        >
          Continue
        </Button>
      </footer>
    </div>
  );
}
