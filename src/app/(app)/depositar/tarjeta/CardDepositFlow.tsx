"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { AddCardSheet } from "@/components/wallet/AddCardSheet";
import { TransactionSuccess } from "@/components/wallet/TransactionSuccess";
import { formatMoney } from "@/lib/currency";
import { playError } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { LinkedCard, TransactionWithParties } from "@/types/db";

export interface CardDepositFlowProps {
  userId: string;
  initialCards: LinkedCard[];
}

type Stage = "select-card" | "enter-amount" | "confirm" | "success";

const TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

const MIN_USD = 5;

const CARD_LABEL: Record<LinkedCard["card_type"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  other: "Tarjeta",
};

export function CardDepositFlow({
  userId,
  initialCards,
}: CardDepositFlowProps) {
  const [cards, setCards] = useState(initialCards);
  const [stage, setStage] = useState<Stage>("select-card");
  const [card, setCard] = useState<LinkedCard | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tx, setTx] = useState<TransactionWithParties | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const amountNum = useMemo(
    () => parseFloat(amount.replace(",", ".")) || 0,
    [amount],
  );
  const belowMin = amountNum > 0 && amountNum < MIN_USD;
  const validAmount = amountNum >= MIN_USD;

  const refetchCards = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("linked_cards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setCards((data ?? []) as LinkedCard[]);
  }, [userId]);

  const submit = async () => {
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/demo/card-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, amount: amountNum }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (err.issues?.length) {
          console.error("[/depositar/tarjeta] validation issues:", err.issues);
        }
        throw new Error(err.error ?? "card_deposit_failed");
      }
      const data = (await res.json()) as {
        transaction: TransactionWithParties;
      };
      setTx(data.transaction);
      setStage("success");
    } catch (e) {
      console.error(e);
      playError();
      toast.error("No se pudo completar el depósito. Probá de nuevo.");
      setSubmitting(false);
    }
  };

  if (stage === "success" && tx) {
    return (
      <TransactionSuccess
        title="¡Depósito recibido!"
        subtitle={`+${formatMoney(amountNum, "USD")} desde tu tarjeta`}
        tx={tx}
        userId={userId}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe flex items-center gap-2 px-3 pb-3">
        {stage === "select-card" ? (
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
              if (stage === "enter-amount") setStage("select-card");
              else if (stage === "confirm") setStage("enter-amount");
            }}
            disabled={submitting}
            aria-label="Atrás"
            className="rounded-full p-2 text-foreground hover:bg-surface-muted disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold">Depositar con tarjeta</h1>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {stage === "select-card" && (
          <motion.div
            key="select-card"
            {...TRANSITION}
            className="flex flex-1 flex-col gap-3 px-4 pb-8"
          >
            <p className="text-sm text-muted-foreground">
              Elegí una tarjeta para hacer el depósito en USD.
            </p>

            {cards.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-surface p-8 text-center ring-1 ring-border">
                <CreditCard
                  size={32}
                  className="text-muted-foreground"
                  aria-hidden
                />
                <p className="text-sm font-semibold">No tenés tarjetas</p>
                <p className="text-xs text-muted-foreground">
                  Agregá una tarjeta para depositar saldo.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {cards.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCard(c);
                        setStage("enter-amount");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition-all hover:ring-primary-300 active:scale-[0.99]"
                    >
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
                      >
                        <CreditCard size={20} strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {CARD_LABEL[c.card_type]} •••• {c.last_four}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.nickname ?? "Tarjeta vinculada"}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setAddOpen(true)}
              className="w-full"
            >
              <Plus size={18} /> Agregar tarjeta
            </Button>
          </motion.div>
        )}

        {stage === "enter-amount" && card && (
          <motion.div
            key="enter-amount"
            {...TRANSITION}
            className="flex flex-1 flex-col px-5"
          >
            <CardHeaderRow card={card} />

            <div className="flex flex-1 flex-col items-center justify-end pb-8">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Dólares · mínimo {formatMoney(MIN_USD, "USD")}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gold-dark dark:text-gold">
                  $
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
                  className="w-[60vw] max-w-[280px] border-0 bg-transparent text-center text-6xl font-extrabold tabular-nums tracking-tight text-gold-dark outline-none focus:outline-none focus:ring-0 dark:text-gold"
                />
              </div>
              {belowMin && (
                <p className="mt-2 text-xs font-medium text-error">
                  El mínimo es {formatMoney(MIN_USD, "USD")}
                </p>
              )}
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
                onClick={() => setStage("confirm")}
                className="w-full"
                size="lg"
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {stage === "confirm" && card && (
          <motion.div
            key="confirm"
            {...TRANSITION}
            className="flex flex-1 flex-col px-5"
          >
            <div className="pt-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Depositando desde
              </p>
              <div className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
                >
                  <CreditCard size={22} strokeWidth={2.2} />
                </span>
                <div className="text-left">
                  <p className="text-base font-semibold leading-tight">
                    {CARD_LABEL[card.card_type]} •••• {card.last_four}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.nickname ?? "Tarjeta vinculada"}
                  </p>
                </div>
              </div>

              <p className="mt-10 text-5xl font-extrabold tabular-nums tracking-tight text-gold-dark dark:text-gold">
                {formatMoney(amountNum, "USD")}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                Dólares
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
                {submitting ? "Procesando…" : "Confirmar depósito"}
              </Button>
              <Button
                type="button"
                onClick={() => setStage("enter-amount")}
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

      <AddCardSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={refetchCards}
      />
    </div>
  );
}

function CardHeaderRow({ card }: { card: LinkedCard }) {
  return (
    <div className="flex items-center gap-3 pb-4">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
      >
        <CreditCard size={20} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {CARD_LABEL[card.card_type]} •••• {card.last_four}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {card.nickname ?? "Tarjeta vinculada"}
        </p>
      </div>
    </div>
  );
}
