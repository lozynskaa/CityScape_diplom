import Image from "next/image";
import If from "./ui/if";

type Props = {
  title?: string | null;
  content?: string | null;
  images?: Array<{ fileName: string; file: string } | string>;
};

export default function Post({ title, content, images = [] }: Props) {
  return (
    <div className="space-y-2 rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-950">
        {title?.length ? title : "Unknown title"}
      </h2>
      <p className="text-sm text-gray-600">
        {content?.length ? content : "Unknown content"}
      </p>
      <If condition={images.length > 0}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <Image
              key={index}
              src={typeof image === "string" ? image : image.file}
              alt={`Post image ${index + 1}`}
              width={0}
              height={0}
              className="h-auto w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </If>
    </div>
  );
}
