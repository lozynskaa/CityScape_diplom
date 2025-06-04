import Image from "next/image";
import Link from "next/link";

type Props = {
  imageUrl: string;
  name: string;
  description: string;
  link: string;
};

export default function ExploreCard({
  imageUrl,
  name,
  description,
  link,
}: Props) {
  return (
    <Link
      href={link}
      className="block w-full min-w-[100%] rounded-lg bg-white shadow"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          loading={"lazy"}
          width={250}
          height={140}
          className="h-[140px] min-w-[100%] rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-[140px] w-full items-center justify-center rounded-2xl bg-gray-200 text-center text-3xl font-bold uppercase">
          {name.charAt(0)}
        </div>
      )}
      <div className="p-4">
        <p className="text-lg font-semibold text-gray-950">{name}</p>
        <p className="line-clamp-1 text-base text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
