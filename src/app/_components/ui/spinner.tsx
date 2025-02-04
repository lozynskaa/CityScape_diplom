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
