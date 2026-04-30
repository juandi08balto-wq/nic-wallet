"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { TransactionSuccess } from "@/components/wallet/TransactionSuccess";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { playError } from "@/lib/sound";
import { digitsOnly } from "@/lib/auth";
import {
  MOBILE_CARRIERS,
  TOPUP_MIN_AMOUNT,
  TOPUP_QUICK_AMOUNTS,
  type MobileCarrier,
} from "@/lib/demo/carriers";
import type { Balance, TransactionWithParties } from "@/types/db";

export interface TopupFlowProps {
  userId: string;
  balances: Balance[];
  userPhone?: string;
}

type Stage = "select-carrier" | "enter-details" | "confirm" | "success";

const TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

export function TopupFlow({ userId, balances, userPhone }: TopupFlowProps) {
  const [stage, setStage] = useState<Stage>("select-carrier");
  const [carrier, setCarrier] = useState<MobileCarrier | null>(null);
  const [phone, setPhone] = useState(userPhone ? `+505 ${userPhone}` : "+505 ");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tx, setTx] = useState<TransactionWithParties | null>(null);

  const nioBalance = Number(
    balances.find((b) => b.currency === "NIO")?.amount ?? 0,
  );
  const phoneDigits = digitsOnly(phone).replace(/^505/, "");
  const validPhone = phoneDigits.length === 8;
  const amountNum = useMemo(
    () => parseFloat(amount.replace(",", ".")) || 0,
    [amount],
  );
  const overBalance = amountNum > nioBalance;
  const belowMin = amountNum > 0 && amountNum < TOPUP_MIN_AMOUNT;
  const validAmount = amountNum >= TOPUP_MIN_AMOUNT && !overBalance;
  const valid = validPhone && validAmount;

  const submit = async () => {
    if (!carrier || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierName: carrier.name,
          phoneNumber: phoneDigits,
          amount: amountNum,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (err.issues?.length) {
          console.error("[/recargar] validation issues:", err.issues);
        }
        if (err.error === "insufficient_funds") {
          playError();
          toast.error("No tenés suficiente saldo en Córdobas");
          setSubmitting(false);
          return;
        }
        throw new Error(err.error ?? "topup_failed");
      }
      const data = (await res.json()) as {
        transaction: TransactionWithParties;
      };
      setTx(data.transaction);
      setStage("success");
    } catch (e) {
      console.error(e);
      playError();
      toast.error("No se pudo recargar. Probá de nuevo.");
      setSubmitting(false);
    }
  };

  if (stage === "success" && tx) {
    return (
      <TransactionSuccess
        title="¡Recarga realizada!"
        subtitle={`${carrier?.name ?? ""} · ${formatMoney(amountNum, "NIO")}`}
        tx={tx}
        userId={userId}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe flex items-center gap-2 px-3 pb-3">
        {stage === "select-carrier" ? (
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
              if (stage === "enter-details") setStage("select-carrier");
              else if (stage === "confirm") setStage("enter-details");
            }}
            disabled={submitting}
            aria-label="Atrás"
            className="rounded-full p-2 text-foreground hover:bg-surface-muted disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold">Recargar saldo</h1>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {stage === "select-carrier" && (
          <motion.div
            key="select-carrier"
            {...TRANSITION}
            className="flex flex-1 flex-col gap-3 px-4 pb-8"
          >
            <p className="text-sm text-muted-foreground">
              Elegí la operadora del celular que vas a recargar.
            </p>
            <ul className="flex flex-col gap-2">
              {MOBILE_CARRIERS.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCarrier(c);
                        setStage("enter-details");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition-all hover:ring-primary-300 active:scale-[0.99]"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                          c.accent,
                        )}
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Recarga celular
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

        {stage === "enter-details" && carrier && (
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
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  carrier.accent,
                )}
              >
                <carrier.icon size={20} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{carrier.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Recarga en Córdobas
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="topup-phone">Número de celular</Label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>

            <div className="mt-auto flex flex-col items-center pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Córdobas · disponible {formatMoney(nioBalance, "NIO")}
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-3xl font-bold",
                    overBalance ? "text-error" : "text-gold-dark dark:text-gold",
                  )}
                >
                  C$
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
              {belowMin && (
                <p className="mt-2 text-xs font-medium text-error">
                  El mínimo es {formatMoney(TOPUP_MIN_AMOUNT, "NIO")}
                </p>
              )}
              {overBalance && (
                <p className="mt-2 text-xs font-medium text-error">
                  No tenés suficiente saldo en Córdobas
                </p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {TOPUP_QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary-300"
                  >
                    C$ {q}
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

        {stage === "confirm" && carrier && (
          <motion.div
            key="confirm"
            {...TRANSITION}
            className="flex flex-1 flex-col px-5"
          >
            <div className="pt-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recargando con
              </p>
              <div className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    carrier.accent,
                  )}
                >
                  <carrier.icon size={22} strokeWidth={2.2} />
                </span>
                <div className="text-left">
                  <p className="text-base font-semibold leading-tight">
                    {carrier.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{phone}</p>
                </div>
              </div>

              <p className="mt-10 text-5xl font-extrabold tabular-nums tracking-tight text-gold-dark dark:text-gold">
                {formatMoney(amountNum, "NIO")}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                Córdobas
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
                {submitting ? "Procesando…" : "Confirmar recarga"}
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
