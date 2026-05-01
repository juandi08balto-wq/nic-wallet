"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PaymentMethod = "ach" | "card" | "cash";

interface MethodOption {
  id: PaymentMethod;
  icon: LucideIcon;
  label: string;
  desc: string;
}

const METHODS: MethodOption[] = [
  {
    id: "ach",
    icon: Building2,
    label: "Bank transfer (ACH)",
    desc: "1–2 business days · Lowest fees",
  },
  {
    id: "card",
    icon: CreditCard,
    label: "Debit card",
    desc: "Instant · Standard fees",
  },
  {
    id: "cash",
    icon: Store,
    label: "Cash at CVS or Walmart",
    desc: "Pay in person · Show this code at checkout",
  },
];

export interface StepPaymentProps {
  initialMethod: PaymentMethod | null;
  onBack: () => void;
  onContinue: (method: PaymentMethod) => void;
}

export function StepPayment({
  initialMethod,
  onBack,
  onContinue,
}: StepPaymentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col px-5 pt-6 pb-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 inline-flex items-center gap-1 self-start rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="mt-3 text-base font-semibold">How do you want to pay?</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        This is a demo — no real payment is processed.
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        {METHODS.map(({ id, icon: Icon, label, desc }) => {
          const active = id === initialMethod;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onContinue(id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left transition-all",
                  active
                    ? "ring-2 ring-primary-700"
                    : "ring-1 ring-border hover:ring-primary-300 active:scale-[0.99]",
                )}
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
                >
                  <Icon size={22} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
                {active && (
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-primary-700 dark:text-gold"
                    aria-hidden
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-8">
        <Button
          type="button"
          disabled={!initialMethod}
          onClick={() => initialMethod && onContinue(initialMethod)}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
