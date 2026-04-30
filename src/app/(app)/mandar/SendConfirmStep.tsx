"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  currencyLabel,
  formatMoney,
} from "@/lib/currency";
import { formatNicaraguanPhone } from "@/lib/auth";
import { playError } from "@/lib/sound";
import type { Currency, TransactionWithParties } from "@/types/db";
import type { SendContact } from "./SendFlow";

export interface SendConfirmStepProps {
  contact: SendContact;
  amount: string;
  currency: Currency;
  message: string;
  onBack: () => void;
  onSuccess: (tx: TransactionWithParties) => void;
}

export function SendConfirmStep({
  contact,
  amount,
  currency,
  message,
  onBack,
  onSuccess,
}: SendConfirmStepProps) {
  const [submitting, setSubmitting] = useState(false);
  const amountNum = parseFloat(amount.replace(",", ".")) || 0;

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: contact.id,
          amount: amountNum,
          currency,
          message: message || null,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (err.issues?.length) {
          console.error("[/mandar] validation issues:", err.issues);
        }
        if (err.error === "insufficient_funds") {
          playError();
          toast.error(
            `No tenés suficiente saldo en ${currencyLabel(currency)}`,
          );
          setSubmitting(false);
          return;
        }
        if (err.error === "cannot_send_to_self") {
          playError();
          toast.error("No podés mandarte a vos mismo");
          setSubmitting(false);
          return;
        }
        throw new Error(err.error ?? "send_failed");
      }
      const data = (await res.json()) as {
        transaction: TransactionWithParties;
      };
      onSuccess(data.transaction);
    } catch (e) {
      console.error(e);
      playError();
      toast.error("No se pudo mandar. Probá de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe flex items-center gap-3 px-3 pb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          aria-label="Atrás"
          className="rounded-full p-2 text-foreground hover:bg-surface-muted disabled:opacity-50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">Confirmar</h1>
      </header>

      <div className="flex flex-1 flex-col px-5">
        <div className="pt-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Mandando a
          </p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
            <div
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-gold"
            >
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-base font-semibold leading-tight">
                {contact.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNicaraguanPhone(contact.phone)}
              </p>
            </div>
          </div>

          <p className="mt-10 text-5xl font-extrabold tabular-nums tracking-tight text-gold-dark dark:text-gold">
            {formatMoney(amountNum, currency)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {currencyLabel(currency)}
          </p>

          {message && (
            <p className="mx-auto mt-6 max-w-xs text-sm italic text-muted-foreground">
              “{message}”
            </p>
          )}
        </div>

        <div
          className="mt-auto space-y-2 pb-8 pt-6"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? "Mandando…" : "Mandar"}
          </Button>
          <Button
            type="button"
            onClick={onBack}
            disabled={submitting}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
