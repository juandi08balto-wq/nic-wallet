"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Repeat, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, currencyLabel } from "@/lib/currency";
import type { Balance, Currency } from "@/types/db";
import { ConvertModal } from "./ConvertModal";

export interface BalanceCardsProps {
  balances: Balance[];
}

// Cash App-style balance: ONE big primary number centered, secondary
// currency rendered smaller below as a tap target that swaps which is
// primary. Convert pill below.
export function BalanceCards({ balances }: BalanceCardsProps) {
  const [primary, setPrimary] = useState<Currency>("USD");
  const [convertOpen, setConvertOpen] = useState(false);

  const usd = Number(balances.find((b) => b.currency === "USD")?.amount ?? 0);
  const nio = Number(balances.find((b) => b.currency === "NIO")?.amount ?? 0);

  const primaryAmount = primary === "USD" ? usd : nio;
  const secondary: Currency = primary === "USD" ? "NIO" : "USD";
  const secondaryAmount = secondary === "USD" ? usd : nio;

  const swap = () =>
    setPrimary((c) => (c === "USD" ? "NIO" : "USD"));

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[var(--radius-card)] bg-surface p-6 text-center ring-1 ring-border"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {currencyLabel(primary)}
        </p>
        <motion.p
          key={primary}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-5xl font-extrabold tabular-nums tracking-tight text-gold-dark dark:text-gold"
        >
          {formatMoney(primaryAmount, primary)}
        </motion.p>

        <button
          type="button"
          onClick={swap}
          aria-label={`Cambiar a ${currencyLabel(secondary)}`}
          className={cn(
            "group mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
            "hover:bg-surface-muted active:bg-surface-muted/70",
          )}
        >
          <ArrowDownUp
            size={14}
            className="text-muted-foreground transition-colors group-hover:text-foreground"
          />
          <span className="text-base font-semibold tabular-nums text-foreground/85">
            {formatMoney(secondaryAmount, secondary)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {currencyLabel(secondary)}
          </span>
        </button>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setConvertOpen(true)}
            aria-label="Convertir"
            className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-dark ring-1 ring-gold/30 transition-all hover:bg-gold/20 active:scale-95 dark:text-gold"
          >
            <Repeat size={16} strokeWidth={2.5} />
            Convertir
          </button>
        </div>
      </motion.section>

      <ConvertModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        usd={usd}
        nio={nio}
        defaultFrom={primary}
      />
    </>
  );
}
