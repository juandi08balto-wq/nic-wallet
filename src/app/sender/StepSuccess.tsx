"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { USD_TO_NIO } from "@/lib/currency";
import { playSuccess } from "@/lib/sound";
import type { SenderRecipient } from "./StepRecipient";

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

export interface StepSuccessProps {
  recipient: SenderRecipient;
  usdAmount: number;
  senderName: string;
  onSendAnother: () => void;
}

export function StepSuccess({
  recipient,
  usdAmount,
  senderName,
  onSendAnother,
}: StepSuccessProps) {
  const nioAmount = usdAmount * USD_TO_NIO;
  const firstName = recipient.name.split(" ")[0] || recipient.name;

  useEffect(() => {
    playSuccess();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-success/5">
      <div className="pt-safe-lg bg-success px-5 pb-12 text-center text-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30"
        >
          <Check size={40} strokeWidth={3} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mt-4 text-2xl font-bold tracking-tight"
        >
          Sent! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-1 text-sm text-white/85"
        >
          {firstName} just got a notification on their phone
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="-mt-8 flex flex-1 flex-col gap-4 rounded-t-3xl bg-background px-5 py-6"
      >
        <div className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-border">
          <div className="border-b border-border pb-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              You sent
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">
              {formatUSD(usdAmount)}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {firstName} received
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gold-dark dark:text-gold">
              {formatNIO(nioAmount)}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3 text-sm">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium">{recipient.name}</span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1.5 text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{senderName}</span>
          </div>
        </div>

        <div
          className="mt-auto pt-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Button
            type="button"
            onClick={onSendAnother}
            variant="gold"
            className="w-full"
            size="lg"
          >
            Send another
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
