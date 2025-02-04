import { type Donation } from "~/server/db/donations.schema";
import { type User } from "~/server/db/user.schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import If from "./ui/if";

export type DonationItemType = Pick<User, "name" | "email" | "image"> & {
  donationAmount: Donation["amount"];
  currency: Donation["currency"];
};
type Props = {
  donation: DonationItemType;
};

export default function DonorItem({ donation }: Props) {
  const [firstName = "U", lastName = "U"] = donation?.name
    ? donation.name.split(" ")
    : ["U", "U"];

  const initials = firstName.charAt(0) + lastName.charAt(0);
  return (
    <div className="flex flex-row items-center gap-x-4">
      <Avatar className="h-12 w-12 cursor-pointer">
        <AvatarImage src={donation.image ?? ""} alt="@shadcn" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-bold">{donation.name ?? "Anonymous"}</h3>
        <If condition={!Number.isNaN(+donation.donationAmount)}>
          <p className="text-sm text-gray-600">
            {donation.donationAmount} {donation.currency}
          </p>
        </If>
      </div>
    </div>
  );
}
