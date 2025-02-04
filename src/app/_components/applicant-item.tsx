import { type User } from "~/server/db/user.schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export type ApplicantItemType = Pick<User, "id" | "name" | "email" | "image">;
type Props = {
  applicant: ApplicantItemType;
};

export default function ApplicantItem({ applicant }: Props) {
  const [firstName = "U", lastName = "U"] = applicant?.name
    ? applicant.name.split(" ")
    : ["U", "U"];

  const initials = firstName.charAt(0) + lastName.charAt(0);
  return (
    <div className="flex flex-row items-center gap-x-4">
      <Avatar className="h-12 w-12 cursor-pointer">
        <AvatarImage src={applicant.image ?? ""} alt="@shadcn" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-bold">{applicant.name ?? "Anonymous"}</h3>
    </div>
  );
}
