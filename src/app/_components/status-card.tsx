import { CircleAlert, CircleCheck, CircleX } from "lucide-react";

type Props = {
  status: "success" | "pending" | "error";
  title: string;
  message: string;
};

const icons = {
  success: <CircleCheck className="h-6 w-6 text-white" />,
  pending: <CircleAlert className="h-6 w-6 text-white" />,
  error: <CircleX className="h-6 w-6 text-white" />,
};

export default function StatusCard({ status, title, message }: Props) {
  const iconComponent = icons[status];
  return (
    <div className="mb-[200px] flex h-full flex-col items-center justify-center rounded-lg bg-white p-4 shadow md:w-2/3">
      <div
        className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${status === "success" ? "bg-green-500" : status === "pending" ? "bg-yellow-500" : "bg-red-500"}`}
      >
        {iconComponent}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}
