"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  currencyLabel,
  currencySymbol,
  formatMoney,
} from "@/lib/currency";
import type { Balance, Currency } from "@/types/db";
import type { SendContact } from "./SendFlow";

export interface SendAmountStepProps {
  contact: SendContact;
  balances: Balance[];
  initialAmount: string;
  initialCurrency: Currency;
  initialMessage: string;
  onBack: () => void;
  onContinue: (amount: string, currency: Currency, message: string) => void;
}

export function SendAmountStep({
  contact,
  balances,
  initialAmount,
  initialCurrency,
  initialMessage,
  onBack,
  onContinue,
}: SendAmountStepProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [message, setMessage] = useState(initialMessage);

  const balance = Number(
    balances.find((b) => b.currency === currency)?.amount ?? 0,
  );
  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const overBalance = amountNum > balance;
  const valid = amountNum > 0 && !overBalance;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Atrás"
          className="rounded-full p-2 text-foreground hover:bg-surface-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-gold"
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="truncate text-sm font-semibold">{contact.name}</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5">
        <div className="flex flex-1 flex-col items-center justify-center pb-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {currencyLabel(currency)} · disponible{" "}
            {formatMoney(balance, currency)}
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-4xl font-bold",
                overBalance ? "text-error" : "text-gold-dark dark:text-gold",
              )}
            >
              {currencySymbol(currency)}
            </span>
            <input
              inputMode="decimal"
              autoFocus
              value={amount}
              placeholder="0"
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
              }
              aria-label="Monto"
              className={cn(
                "w-[60vw] max-w-[280px] border-0 bg-transparent text-center text-6xl font-extrabold tabular-nums tracking-tight outline-none focus:outline-none focus:ring-0",
                overBalance ? "text-error" : "text-gold-dark dark:text-gold",
              )}
            />
          </div>

          {overBalance && (
            <p className="mt-2 text-xs font-medium text-error">
              No tenés suficiente saldo en {currencyLabel(currency)}
            </p>
          )}

          <div className="mt-5 inline-flex rounded-full bg-surface-muted p-1 ring-1 ring-border">
            {(["USD", "NIO"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  currency === c
                    ? "bg-primary-700 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pb-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 80))}
            placeholder="Para qué? (opcional)"
            maxLength={80}
          />
        </div>

        <div
          className="pb-8"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Button
            type="button"
            disabled={!valid}
            onClick={() => onContinue(amount, currency, message.trim())}
            className="w-full"
            size="lg"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
