import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useWritableSearchParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.length) params.set(name, value);
      else params.delete(name);

      router.push(pathname + "?" + params.toString());
    },
    [searchParams],
  );
  const createMultipleQueryString = useCallback(
    (allParams: Record<string, string>) => {
      const params = new URLSearchParams(allParams);
      router.push(pathname + "?" + params.toString());
    },
    [searchParams],
  );
  return {
    searchParams,
    set: createQueryString,
    setAll: createMultipleQueryString,
    delete: (name: string) => createQueryString(name, ""),
  };
};

export type WritableSearchParamsType = ReturnType<
  typeof useWritableSearchParams
>;
