"use client";
import { type MutableRefObject } from "react";

import CreateEventForm, {
  type CreateEventDetails,
} from "~/app/_components/create-event-form";

type Props = {
  details: MutableRefObject<CreateEventDetails>;
  disabledCallback: (state: CreateEventDetails) => boolean;
  setDisabled: (state: boolean) => void;
};

export function SecondStep({ details, disabledCallback, setDisabled }: Props) {
  return (
    <CreateEventForm
      eventDetailsRef={details}
      disabledCallback={disabledCallback}
      setDisabled={setDisabled}
    />
  );
}
