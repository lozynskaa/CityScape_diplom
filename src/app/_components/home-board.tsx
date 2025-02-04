import { Search } from "lucide-react";
import HomeBg from "../../assets/home-bg.png";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type Props = {
  handleSearchEvents: (formData: FormData) => void;
};

export default function HomeBoard({ handleSearchEvents }: Props) {
  return (
    <div
      className={`flex h-[600px] w-full flex-col items-center justify-center gap-y-4 rounded-2xl bg-cover bg-center bg-no-repeat`}
      style={{
        backgroundImage: `url(${HomeBg.src})`,
      }}
    >
      <h1 className="text-center text-2xl font-extrabold text-white md:text-4xl lg:text-6xl">
        Help out at our latest events
      </h1>
      <p className="text-center text-sm text-white md:text-base">
        Be a part of the change you want to see in your community
      </p>
      <form
        className="mt-8 flex w-3/4 flex-row items-center rounded-xl bg-white px-2 py-1 md:w-1/2 md:px-4 md:py-2 lg:w-1/3"
        action={handleSearchEvents}
      >
        <Search className="h-6 w-6 font-bold text-gray-500 md:h-8 md:w-8" />
        <Input
          name="search"
          className="h-10 flex-1 border-none focus:border-none focus:outline-none focus:ring-offset-0 focus-visible:ring-0 md:h-16"
          placeholder="Search for events"
        />
        <Button
          type="submit"
          className="h-8 w-16 rounded-lg text-sm font-bold md:h-12 md:w-24 md:rounded-full"
        >
          Search
        </Button>
      </form>
    </div>
  );
}
