import StatusCard from "~/app/_components/status-card";

export default function FailurePage() {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      <StatusCard
        status="error"
        title="Failure"
        message="Your donation was failed."
      />
    </div>
  );
}
