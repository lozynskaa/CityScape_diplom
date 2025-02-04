import Image from "next/image";
import Link from "next/link";
import DefaultCompanyImage from "~/assets/default-company-bg.png";

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
      <Image
        src={imageUrl ?? DefaultCompanyImage}
        alt={name}
        onError={(e) => (e.currentTarget.src = DefaultCompanyImage.src)}
        width={250}
        height={140}
        className="h-[140px] min-w-[100%] rounded-lg object-contain"
      />
      <div className="p-4">
        <p className="text-lg font-semibold text-gray-950">{name}</p>
        <p className="line-clamp-1 text-base text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
