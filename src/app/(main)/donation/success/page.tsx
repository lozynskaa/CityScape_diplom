import StatusCard from "~/app/_components/status-card";

export default function SuccessPage() {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      <StatusCard
        status="success"
        title="Success"
        message="Your donation was successful."
      />
    </div>
  );
}
