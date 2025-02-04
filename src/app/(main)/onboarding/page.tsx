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
import { useRouter } from "next/navigation";

export type CompanyInfoState = {
  //company
  company: {
    name: string;
    description?: string;
    companyEmail: string;
    website: string;
    companyIBAN: string;
    companyImage?: {
      file: string;
      fileName: string;
    };
    okpo: string;
    phoneNumber: string;
  };
  //event
  event: {
    category: string;
    eventName: string;
    eventDescription?: string;
    eventDate: Date;
    eventPurpose: string;
    eventLocation: string;
    eventImage?: {
      file: string;
      fileName: string;
    };
    goalAmount: number;
    includeDonations: boolean;
    currency: string;
  };
};

type ContentData = {
  component: typeof FirstStep | typeof SecondStep;
  loadFileKey: "companyImage" | "eventImage";
  description: string;
  title: string;
  stateKey: keyof CompanyInfoState;
  disabled: (state: CompanyInfoState) => boolean;
};

const contentByStep = new Map<number, ContentData>();

contentByStep.set(1, {
  component: FirstStep,
  loadFileKey: "companyImage",
  stateKey: "company",
  description:
    "Let's get started by setting up your company profile and creating a fundraising event. Once you've completed these steps, you'll be able to take part in city-wide charity events.",
  title: "Welcome to CityScape!",
  disabled: (state: CompanyInfoState) =>
    !state.company.name ||
    !state.company.companyEmail ||
    !state.company.companyIBAN ||
    state.company.companyIBAN.length > 34 ||
    !state.company.phoneNumber ||
    !state.company.okpo ||
    !state.company.website,
});
contentByStep.set(2, {
  component: SecondStep,
  loadFileKey: "eventImage",
  stateKey: "event",
  description:
    "Let's get started by setting up your company profile and creating a fundraising event. Once you've completed these steps, you'll be able to take part in city-wide charity events.",
  title: "Create you first fundraising event!",
  disabled: (state: CompanyInfoState) =>
    !state.event.eventPurpose ||
    !state.event.eventName ||
    !state.event.currency ||
    !state.event.eventLocation ||
    !state.event.eventDate,
});

const DEFAULT_STATE: CompanyInfoState = {
  //company
  company: {
    name: "",
    description: "",
    companyEmail: "",
    website: "",
    companyIBAN: "",
    okpo: "",
    phoneNumber: "",
  },
  //event
  event: {
    category: "",
    eventName: "",
    eventDescription: "",
    eventLocation: "",
    eventDate: new Date(),
    eventPurpose: "",
    goalAmount: 0,
    includeDonations: false,
    currency: "USD",
  },
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoState["company"]>(
    DEFAULT_STATE.company,
  );
  const [eventInfo, setEventInfo] = useState<CompanyInfoState["event"]>(
    DEFAULT_STATE.event,
  );

  const { mutate: completeOnboarding } =
    api.company.completeOnboarding.useMutation();

  const {
    component: StepContent,
    description,
    title,
    loadFileKey,
    stateKey,
    disabled,
  } = contentByStep.get(step) ?? ({} as ContentData);

  const handleNextStep = async () => {
    if (step === 2) {
      completeOnboarding({
        company: companyInfo,
        event: eventInfo,
      });
      return router.push("/");
    }
    setStep((prev) => prev + 1);
  };

  const handleLoadFile =
    (key: "eventImage" | "companyImage") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
          const base64Data = reader.result as string; // e.g., "data:image/png;base64,..."

          const parsedFile = {
            file: base64Data,
            fileName: file.name,
          };
          setCompanyInfo((prev) => ({ ...prev, [key]: parsedFile }));
        };
      }
    };

  const handleSkipOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skipOnboarding", "true");
      window.location.href = "/";
    }
  };

  const stateByKey = {
    company: {
      state: companyInfo,
      setState: setCompanyInfo,
    },
    event: {
      state: eventInfo,
      setState: setEventInfo,
    },
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
        companyDetails={stateByKey[stateKey].state}
        setCompanyDetails={stateByKey[stateKey].setState}
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
          className="flex-1 rounded-full text-sm font-bold"
          disabled={disabled({
            company: companyInfo,
            event: eventInfo,
          })}
          onClick={handleNextStep}
        >
          Continue
        </Button>
      </footer>
    </div>
  );
}
