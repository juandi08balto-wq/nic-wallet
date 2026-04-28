"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/lib/currency";
import type { Currency } from "@/types/db";

export interface CodeCardProps {
  /** Top-right kicker, e.g. "Depósito" / "Retiro". */
  kicker: string;
  /** Section label above the code. */
  codeLabel: string;
  /** The big monospaced code itself. */
  code: string;
  storeName: string;
  amount: number;
  currency: Currency;
  /** Total countdown in seconds (default 30 minutes). */
  countdownSeconds?: number;
  /** Spanish instruction text shown above the perforation. */
  instructions: string;
}

const DEFAULT_SECONDS = 30 * 60;

function formatTimer(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Boarding-pass / ticket style. Two halves separated by a dashed
// perforation; gold accents on the brand and code; white-on-navy.
export function CodeCard({
  kicker,
  codeLabel,
  code,
  storeName,
  amount,
  currency,
  countdownSeconds = DEFAULT_SECONDS,
  instructions,
}: CodeCardProps) {
  const [secsLeft, setSecsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (secsLeft <= 0) return;
    const id = setInterval(() => {
      setSecsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [secsLeft]);

  const expired = secsLeft <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white shadow-lg ring-1 ring-primary-800"
    >
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gold text-sm font-extrabold text-primary-900"
          >
            N
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gold/80">
            Nic Wallet
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
          {kicker}
        </span>
      </div>

      <div className="px-6 pt-6 pb-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold/70">
          {codeLabel}
        </p>
        <p className="mt-2 break-all font-mono text-3xl font-extrabold tracking-[0.18em] text-gold">
          {code}
        </p>
        <p className="mx-auto mt-4 max-w-[260px] text-xs leading-snug text-white/75">
          {instructions}
        </p>
      </div>

      <div
        aria-hidden
        className="relative mx-4 border-t border-dashed border-white/20"
      >
        <span className="absolute -left-6 -top-2 h-4 w-4 rounded-full bg-background" />
        <span className="absolute -right-6 -top-2 h-4 w-4 rounded-full bg-background" />
      </div>

      <div className="px-6 py-5">
        <Row label="Comercio">
          <span className="font-medium">{storeName}</span>
        </Row>
        <Row label="Monto">
          <span className="font-bold tabular-nums text-gold">
            {formatMoney(amount, currency)}
          </span>
        </Row>
        <Row label="Expira en">
          <span
            className={
              expired
                ? "font-mono font-bold tabular-nums text-coral"
                : "font-mono font-bold tabular-nums text-white"
            }
          >
            {expired ? "Expirado" : formatTimer(secsLeft)}
          </span>
        </Row>
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
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
