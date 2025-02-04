import { cn } from "~/lib/utils";

type Props = {
  category: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function CategoryBadge({ selected, category, onClick }: Props) {
  console.log("🚀 ~ CategoryBadge ~ selected:", selected, category);
  return (
    <span
      className={cn(
        "inline-block cursor-pointer rounded-full px-3 py-1 text-sm font-semibold text-gray-900",
        selected ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200",
      )}
      onClick={onClick}
    >
      {category}
    </span>
  );
}
