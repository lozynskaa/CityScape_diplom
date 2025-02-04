"use client";

import { useRouter } from "next/navigation";
import { ItemSelectBlock } from "~/app/_components/item-select";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function CompanySelect() {
  const { data: companies = [], isFetching } =
    api.company.getUserCompanies.useQuery();

  const router = useRouter();

  if (isFetching) {
    return <Spinner />;
  }

  const handleSelectCompany = (companyId: string) => {
    router.push(`/settings/company/${companyId}`);
  };

  return (
    <div className="mx-auto flex h-full flex-1 flex-col items-center justify-center">
      <p className="mb-4 text-center text-sm text-gray-600">
        Company not selected, please select it to continue.
      </p>
      <ItemSelectBlock
        set={handleSelectCompany}
        items={companies}
        title="Select company"
      />
    </div>
  );
}
