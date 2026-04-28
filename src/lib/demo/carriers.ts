import { Smartphone, type LucideIcon } from "lucide-react";

export interface MobileCarrier {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon-circle accent. */
  accent: string;
}

export const MOBILE_CARRIERS: MobileCarrier[] = [
  {
    id: "claro",
    name: "Claro",
    icon: Smartphone,
    accent: "bg-error/15 text-error",
  },
  {
    id: "tigo",
    name: "Tigo",
    icon: Smartphone,
    accent: "bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold",
  },
];

export const TOPUP_QUICK_AMOUNTS = [20, 50, 100, 200];
export const TOPUP_MIN_AMOUNT = 20;
