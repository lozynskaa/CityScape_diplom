import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import If from "./ui/if";

type Props = {
  title: string;
  message: string;
  buttonText?: string;
  redirectUrl?: string;
};

export default function NoValues({
  title,
  message,
  buttonText,
  redirectUrl,
}: Props) {
  const router = useRouter();
  const handleRedirect = () => {
    if (!redirectUrl) return;
    router.push(redirectUrl);
  };
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-gray-600">{message}</p>
      <If condition={!!buttonText}>
        <Button
          className="w-22 rounded-full font-bold"
          formAction={handleRedirect}
        >
          {buttonText}
        </Button>
      </If>
    </div>
  );
}
