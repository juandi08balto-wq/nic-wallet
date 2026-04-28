"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { TransactionSuccess } from "@/components/wallet/TransactionSuccess";
import { cn } from "@/lib/utils";
import {
  currencyLabel,
  currencySymbol,
  formatMoney,
} from "@/lib/currency";
import { playError } from "@/lib/sound";
import { BILL_PROVIDERS, type BillProvider } from "@/lib/demo/bills";
import type { Balance, Currency, TransactionWithParties } from "@/types/db";

export interface BillPayFlowProps {
  userId: string;
  balances: Balance[];
}

type Stage = "select-provider" | "enter-details" | "confirm" | "success";

const TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

export function BillPayFlow({ userId, balances }: BillPayFlowProps) {
  const [stage, setStage] = useState<Stage>("select-provider");
  const [provider, setProvider] = useState<BillProvider | null>(null);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("NIO");
  const [submitting, setSubmitting] = useState(false);
  const [tx, setTx] = useState<TransactionWithParties | null>(null);

  const balance = Number(
    balances.find((b) => b.currency === currency)?.amount ?? 0,
  );
  const amountNum = useMemo(
    () => parseFloat(amount.replace(",", ".")) || 0,
    [amount],
  );
  const overBalance = amountNum > balance;
  const validAccount = account.trim().length > 0;
  const validAmount = amountNum > 0 && !overBalance;
  const valid = validAccount && validAmount;

  const submit = async () => {
    if (!provider || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions/bill-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: provider.name,
          accountNumber: account.trim(),
          amount: amountNum,
          currency,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (err.issues?.length) {
          console.error("[/facturas] validation issues:", err.issues);
        }
        if (err.error === "insufficient_funds") {
          playError();
          toast.error(
            `No tenés suficiente saldo en ${currencyLabel(currency)}`,
          );
          setSubmitting(false);
          return;
        }
        throw new Error(err.error ?? "bill_pay_failed");
      }
      const data = (await res.json()) as {
        transaction: TransactionWithParties;
      };
      setTx(data.transaction);
      setStage("success");
    } catch (e) {
      console.error(e);
      playError();
      toast.error("No se pudo pagar la factura. Probá de nuevo.");
      setSubmitting(false);
    }
  };

  if (stage === "success" && tx) {
    return (
      <TransactionSuccess
        title="¡Factura pagada!"
        subtitle={`${provider?.name ?? ""} · ${formatMoney(amountNum, currency)}`}
        tx={tx}
        userId={userId}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-3 py-3">
        {stage === "select-provider" ? (
          <Link
            href="/servicios"
            aria-label="Volver"
            className="rounded-full p-2 text-foreground hover:bg-surface-muted"
          >
            <ArrowLeft size={20} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (stage === "enter-details") setStage("select-provider");
              else if (stage === "confirm") setStage("enter-details");
            }}
            disabled={submitting}
            aria-label="Atrás"
            className="rounded-full p-2 text-foreground hover:bg-surface-muted disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold">Facturas</h1>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {stage === "select-provider" && (
          <motion.div
            key="select-provider"
            {...TRANSITION}
            className="flex flex-1 flex-col gap-3 px-4 pb-8"
          >
            <p className="text-sm text-muted-foreground">
              Elegí qué factura querés pagar.
            </p>
            <ul className="flex flex-col gap-2">
              {BILL_PROVIDERS.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setProvider(p);
                        setStage("enter-details");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition-all hover:ring-primary-300 active:scale-[0.99]"
                    >
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning"
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.category}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {stage === "enter-details" && provider && (
          <motion.form
            key="enter-details"
            {...TRANSITION}
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) setStage("confirm");
            }}
            className="flex flex-1 flex-col gap-5 px-5"
          >
            <div className="flex items-center gap-3 pt-1">
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning"
              >
                <provider.icon size={20} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{provider.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {provider.category}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account">{provider.accountLabel}</Label>
              <Input
                id="account"
                value={account}
                onChange={(e) => setAccount(e.target.value.slice(0, 40))}
                placeholder="Ej. 12345678"
                autoFocus
                inputMode="numeric"
              />
            </div>

            <div className="flex flex-col items-center pt-2">
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
                  value={amount}
                  placeholder="0"
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                  }
                  aria-label="Monto"
                  className={cn(
                    "w-[60vw] max-w-[280px] border-0 bg-transparent text-center text-5xl font-extrabold tabular-nums tracking-tight outline-none focus:outline-none focus:ring-0",
                    overBalance ? "text-error" : "text-gold-dark dark:text-gold",
                  )}
                />
              </div>
              {overBalance && (
                <p className="mt-2 text-xs font-medium text-error">
                  No tenés suficiente saldo en {currencyLabel(currency)}
                </p>
              )}
              <div className="mt-4 inline-flex rounded-full bg-surface-muted p-1 ring-1 ring-border">
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

            <div
              className="mt-auto pb-8 pt-2"
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom), 2rem)",
              }}
            >
              <Button
                type="submit"
                disabled={!valid}
                className="w-full"
                size="lg"
              >
                Continuar
              </Button>
            </div>
          </motion.form>
        )}

        {stage === "confirm" && provider && (
          <motion.div
            key="confirm"
            {...TRANSITION}
            className="flex flex-1 flex-col px-5"
          >
            <div className="pt-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Pagando factura de
              </p>
              <div className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 text-warning"
                >
                  <provider.icon size={22} strokeWidth={2.2} />
                </span>
                <div className="text-left">
                  <p className="text-base font-semibold leading-tight">
                    {provider.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cuenta: {account}
                  </p>
                </div>
              </div>

              <p className="mt-10 text-5xl font-extrabold tabular-nums tracking-tight text-gold-dark dark:text-gold">
                {formatMoney(amountNum, currency)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {currencyLabel(currency)}
              </p>
            </div>

            <div
              className="mt-auto space-y-2 pb-8 pt-6"
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom), 2rem)",
              }}
            >
              <Button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? "Procesando…" : "Pagar factura"}
              </Button>
              <Button
                type="button"
                onClick={() => setStage("enter-details")}
                disabled={submitting}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
