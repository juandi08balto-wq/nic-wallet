"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { StoreList } from "@/components/wallet/StoreList";
import { CodeCard } from "@/components/wallet/CodeCard";
import { TransactionSuccess } from "@/components/wallet/TransactionSuccess";
import { cn } from "@/lib/utils";
import {
  currencyLabel,
  currencySymbol,
  formatMoney,
} from "@/lib/currency";
import { playError } from "@/lib/sound";
import type {
  Balance,
  Currency,
  TransactionWithParties,
} from "@/types/db";
import type { PartnerStore } from "@/lib/demo/stores";

export interface WithdrawFlowProps {
  userId: string;
  balances: Balance[];
}

type Stage = "select-store" | "enter-amount" | "show-code" | "success";

const TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

function generateWithdrawCode(): string {
  const n = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `NW-R-${n}`;
}

export function WithdrawFlow({ userId, balances }: WithdrawFlowProps) {
  const [stage, setStage] = useState<Stage>("select-store");
  const [store, setStore] = useState<PartnerStore | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("NIO");
  const [code, setCode] = useState("");
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
  const validAmount = amountNum > 0 && !overBalance;

  const goToCode = () => {
    if (!store || !validAmount) return;
    setCode(generateWithdrawCode());
    setStage("show-code");
  };

  const simulateComplete = async () => {
    if (!store || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/demo/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          currency,
          storeName: store.name,
          code,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (err.issues?.length) {
          console.error("[/retirar] validation issues:", err.issues);
        }
        if (err.error === "insufficient_funds") {
          playError();
          toast.error(
            `No tenés suficiente saldo en ${currencyLabel(currency)}`,
          );
          setSubmitting(false);
          return;
        }
        throw new Error(err.error ?? "withdraw_failed");
      }
      const data = (await res.json()) as {
        transaction: TransactionWithParties;
      };
      setTx(data.transaction);
      setStage("success");
    } catch (e) {
      console.error(e);
      playError();
      toast.error("No se pudo completar el retiro. Probá de nuevo.");
      setSubmitting(false);
    }
  };

  if (stage === "success" && tx) {
    return (
      <TransactionSuccess
        title="¡Retiro completado!"
        subtitle={`−${formatMoney(amountNum, currency)} de tu saldo`}
        tx={tx}
        userId={userId}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-3 py-3">
        {stage === "select-store" ? (
          <Link
            href="/pagos"
            aria-label="Volver"
            className="rounded-full p-2 text-foreground hover:bg-surface-muted"
          >
            <ArrowLeft size={20} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (stage === "enter-amount") setStage("select-store");
              else if (stage === "show-code") setStage("enter-amount");
            }}
            disabled={submitting}
            aria-label="Atrás"
            className="rounded-full p-2 text-foreground hover:bg-surface-muted disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold">Retirar efectivo</h1>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {stage === "select-store" && (
          <motion.div
            key="select-store"
            {...TRANSITION}
            className="flex flex-1 flex-col gap-4 px-4 pb-8"
          >
            <p className="text-sm text-muted-foreground">
              Elegí dónde querés retirar el efectivo. Te damos un código para
              mostrarle al cajero.
            </p>
            <StoreList
              selectedId={store?.id ?? null}
              onSelect={(s) => {
                setStore(s);
                setStage("enter-amount");
              }}
            />
          </motion.div>
        )}

        {stage === "enter-amount" && store && (
          <motion.div
            key="enter-amount"
            {...TRANSITION}
            className="flex flex-1 flex-col px-5"
          >
            <div className="flex items-center gap-3 pb-4">
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
              >
                <store.icon size={20} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{store.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {store.area}
                </p>
              </div>
            </div>

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

            <div
              className="pb-8"
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom), 2rem)",
              }}
            >
              <Button
                type="button"
                disabled={!validAmount}
                onClick={goToCode}
                className="w-full"
                size="lg"
              >
                Generar código
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "show-code" && store && (
          <motion.div
            key="show-code"
            {...TRANSITION}
            className="flex flex-1 flex-col gap-4 px-4 pb-8"
          >
            <CodeCard
              kicker="Retiro"
              codeLabel="Código de retiro"
              code={code}
              storeName={store.name}
              amount={amountNum}
              currency={currency}
              instructions="Mostrá este código al cajero. Te entregarán el efectivo y se descontará de tu wallet."
            />

            <div
              className="mt-auto space-y-2 pt-2"
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom), 2rem)",
              }}
            >
              <Button
                type="button"
                onClick={simulateComplete}
                disabled={submitting}
                variant="gold"
                className="w-full"
                size="lg"
              >
                <Sparkles size={18} />{" "}
                {submitting ? "Procesando…" : "Simular retiro completado"}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Solo para esta demo. En producción, el cajero confirmaría con
                el código.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
