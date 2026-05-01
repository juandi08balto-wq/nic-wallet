"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { USD_TO_NIO } from "@/lib/currency";
import type { SenderRecipient } from "./StepRecipient";

const MIN_USD = 10;

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

export interface StepAmountProps {
  recipient: SenderRecipient;
  initialUsdAmount: string;
  initialSenderName: string;
  onBack: () => void;
  onContinue: (usdAmount: string, senderName: string) => void;
}

export function StepAmount({
  recipient,
  initialUsdAmount,
  initialSenderName,
  onBack,
  onContinue,
}: StepAmountProps) {
  const [amount, setAmount] = useState(initialUsdAmount);
  const [senderName, setSenderName] = useState(initialSenderName);

  const amountNum = useMemo(
    () => parseFloat(amount.replace(",", ".")) || 0,
    [amount],
  );
  const nioAmount = amountNum * USD_TO_NIO;
  const belowMin = amountNum > 0 && amountNum < MIN_USD;
  const validAmount = amountNum >= MIN_USD;
  const validName = senderName.trim().length >= 2;
  const valid = validAmount && validName;

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

      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
        Sending to
      </p>
      <p className="text-base font-semibold">{recipient.name}</p>

      <div className="mt-6">
        <Label htmlFor="usd-amount">Amount in USD</Label>
        <div className="mt-2 flex items-baseline gap-1">
          <span
            className={`text-4xl font-bold ${
              belowMin ? "text-muted-foreground" : "text-gold-dark dark:text-gold"
            }`}
          >
            $
          </span>
          <input
            id="usd-amount"
            inputMode="decimal"
            autoFocus
            value={amount}
            placeholder="0"
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            aria-label="Amount in USD"
            className={`w-full border-0 bg-transparent text-5xl font-extrabold tabular-nums tracking-tight outline-none focus:outline-none focus:ring-0 ${
              belowMin
                ? "text-muted-foreground"
                : "text-gold-dark dark:text-gold"
            }`}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Minimum $10</p>
        {belowMin && (
          <p className="mt-1 text-xs font-medium text-error">
            The minimum is $10
          </p>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-gold/15 p-4 ring-1 ring-gold/30">
        <Sparkles
          size={18}
          className="mt-0.5 shrink-0 text-gold-dark dark:text-gold"
          aria-hidden
        />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-foreground">
            {recipient.name.split(" ")[0] || "They"} gets{" "}
            <span className="text-gold-dark dark:text-gold">
              {formatNIO(nioAmount)}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Rate: 1 USD = C$ {USD_TO_NIO.toFixed(2)} · No fees
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Label htmlFor="sender-name">Your name</Label>
        <Input
          id="sender-name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value.slice(0, 60))}
          placeholder="e.g. Mom in Miami"
          maxLength={60}
          autoComplete="name"
          className="mt-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          We'll show this to {recipient.name.split(" ")[0]} so they know it's
          from you.
        </p>
      </div>

      <div className="mt-auto pt-8">
        <Button
          type="button"
          disabled={!valid}
          onClick={() => onContinue(amount, senderName.trim())}
          className="w-full"
          size="lg"
        >
          {validAmount
            ? `Continue · ${formatUSD(amountNum)}`
            : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
