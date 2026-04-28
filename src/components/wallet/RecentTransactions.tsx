"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TxRow } from "./TxRow";
import { Sheet } from "@/components/ui/Sheet";
import { TransactionReceipt, copyReceipt } from "./TransactionReceipt";
import { Button } from "@/components/ui/Button";
import type { TransactionWithParties } from "@/types/db";

export interface RecentTransactionsProps {
  transactions: TransactionWithParties[];
  userId: string;
}

export function RecentTransactions({
  transactions,
  userId,
}: RecentTransactionsProps) {
  const [open, setOpen] = useState<TransactionWithParties | null>(null);

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-border"
      >
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-semibold tracking-tight">
            Movimientos recientes
          </h2>
        </div>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay movimientos
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id}>
                <button
                  type="button"
                  onClick={() => setOpen(tx)}
                  className="-mx-2 flex w-[calc(100%+1rem)] rounded-2xl px-2 text-left transition-colors hover:bg-surface-muted active:bg-surface-muted/70"
                >
                  <TxRow tx={tx} userId={userId} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <Sheet
        open={!!open}
        onClose={() => setOpen(null)}
        title="Detalle del movimiento"
      >
        {open && (
          <div className="space-y-3">
            <TransactionReceipt tx={open} userId={userId} />
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => copyReceipt(open, userId)}
            >
              Compartir recibo
            </Button>
          </div>
        )}
      </Sheet>
    </>
  );
}
