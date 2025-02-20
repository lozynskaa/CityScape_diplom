import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyMap = {
  USD: {
    name: "USD",
    id: "USD",
    symbol: "$",
  },
  EUR: {
    name: "EUR",
    id: "EUR",
    symbol: "€",
  },
  GBP: {
    name: "GBP",
    id: "GBP",
    symbol: "£",
  },
  UAH: {
    name: "UAH",
    id: "UAH",
    symbol: "₴",
  },
  PLN: {
    name: "PLN",
    id: "PLN",
    symbol: "zł",
  },
};
