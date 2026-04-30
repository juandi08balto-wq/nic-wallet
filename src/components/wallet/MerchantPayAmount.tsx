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
import type { DemoMerchant } from "@/lib/demo/merchants";

export interface MerchantPayAmountProps {
  merchant: DemoMerchant;
  balances: Balance[];
  initialAmount: string;
  initialCurrency: Currency;
  initialMessage: string;
  onClose: () => void;
  onContinue: (amount: string, currency: Currency, message: string) => void;
}

export function MerchantPayAmount({
  merchant,
  balances,
  initialAmount,
  initialCurrency,
  initialMessage,
  onClose,
  onContinue,
}: MerchantPayAmountProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [message, setMessage] = useState(initialMessage);

  const balance = Number(
    balances.find((b) => b.currency === currency)?.amount ?? 0,
  );
  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const overBalance = amountNum > balance;
  const valid = amountNum > 0 && !overBalance;
  const Icon = merchant.icon;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe flex items-center gap-3 px-3 pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Atrás"
          className="rounded-full p-2 text-foreground hover:bg-surface-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
          >
            <Icon size={18} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">
              {merchant.name}
            </h1>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {merchant.category}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5">
        <div className="flex flex-1 flex-col items-center justify-end pb-8">
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
            placeholder="Nota (opcional)"
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
            Pagar
          </Button>
        </div>
      </div>
    </div>
  );
}
