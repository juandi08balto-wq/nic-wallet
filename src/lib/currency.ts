import type { Currency } from "@/types/db";

// Nominal demo rate (1 USD = 36.80 NIO). Not pulled from any feed.
export const USD_TO_NIO = 36.8;

export function formatMoney(amount: number, currency: Currency): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "USD" ? `$${formatted}` : `C$ ${formatted}`;
}

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const raw = from === "USD" ? amount * USD_TO_NIO : amount / USD_TO_NIO;
  return Math.round(raw * 100) / 100;
}

export function currencySymbol(currency: Currency): string {
  return currency === "USD" ? "$" : "C$";
}

export function currencyLabel(currency: Currency): string {
  return currency === "USD" ? "Dólares" : "Córdobas";
}
