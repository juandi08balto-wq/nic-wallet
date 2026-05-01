"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, CreditCard, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { USD_TO_NIO } from "@/lib/currency";
import { playError } from "@/lib/sound";
import type { SenderRecipient } from "./StepRecipient";
import type { PaymentMethod } from "./StepPayment";
import type { TransactionWithParties } from "@/types/db";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  ach: "Bank transfer (ACH)",
  card: "Debit card",
  cash: "Cash at CVS or Walmart",
};

const METHOD_ICONS: Record<PaymentMethod, typeof Building2> = {
  ach: Building2,
  card: CreditCard,
  cash: Store,
};

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNIO(amount: number): string {
  return `C$ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface StepConfirmProps {
  recipient: SenderRecipient;
  usdAmount: string;
  senderName: string;
  paymentMethod: PaymentMethod;
  onBack: () => void;
  onSuccess: (tx: TransactionWithParties) => void;
}

export function StepConfirm({
  recipient,
  usdAmount,
  senderName,
  paymentMethod,
  onBack,
  onSuccess,
}: StepConfirmProps) {
  const [submitting, setSubmitting] = useState(false);
  const amountNum = parseFloat(usdAmount.replace(",", ".")) || 0;
  const nioAmount = amountNum * USD_TO_NIO;
  const MethodIcon = METHOD_ICONS[paymentMethod];

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/remittance/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: recipient.id,
          usdAmount: amountNum,
          senderName,
          paymentMethod,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (err.issues?.length) {
          console.error("[/sender] validation issues:", err.issues);
        }
        throw new Error(err.error ?? "remittance_failed");
      }
      const data = (await res.json()) as {
        transaction: TransactionWithParties;
      };
      onSuccess(data.transaction);
    } catch (e) {
      console.error(e);
      playError();
      toast.error("We couldn't send this right now. Please try again.");
      setSubmitting(false);
    }
  };

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
        disabled={submitting}
        className="-ml-2 inline-flex items-center gap-1 self-start rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="mt-3 text-base font-semibold">Review your transfer</h2>

      <div className="mt-4 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-border">
        <div className="border-b border-border pb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            You send
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">
            {formatUSD(amountNum)}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            They receive
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gold-dark dark:text-gold">
            {formatNIO(nioAmount)}
          </p>
        </div>

        <Row label="Recipient">{recipient.name}</Row>
        <Row label="From">{senderName}</Row>
        <Row label="Payment method">
          <span className="inline-flex items-center gap-1.5">
            <MethodIcon
              size={14}
              className="text-muted-foreground"
              aria-hidden
            />
            {METHOD_LABEL[paymentMethod]}
          </span>
        </Row>
        <Row label="Exchange rate">1 USD = C$ {USD_TO_NIO.toFixed(2)}</Row>
        <Row label="Fees">
          <span className="text-success">No fees</span>
        </Row>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo only — no real payment is processed.
      </p>

      <div className="mt-auto pt-6">
        <Button
          type="button"
          onClick={submit}
          disabled={submitting}
          variant="gold"
          className="w-full"
          size="lg"
        >
          {submitting ? "Sending…" : `Send ${formatUSD(amountNum)}`}
        </Button>
      </div>
    </motion.div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{children}</span>
    </div>
  );
}
