import { LoaderPinwheel } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      <div className="animate-spin">
        <LoaderPinwheel />
      </div>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-[calc(100vh-4rem-74px)] w-full items-center justify-center">
      <div className="animate-spin">
        <LoaderPinwheel />
      </div>
    </div>
  );
}
