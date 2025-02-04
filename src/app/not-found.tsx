import Link from "next/link";
import { Button } from "./_components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="p-6 text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-600 bg-clip-text text-9xl font-extrabold tracking-tight text-transparent">
          404
        </h1>
        <h3 className="mt-4 text-2xl font-semibold text-gray-950">
          Page Not Found
        </h3>
        <p className="mt-2 text-gray-400">
          Sorry, the page you are looking for doesn&apos;t exist.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">Back To Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
