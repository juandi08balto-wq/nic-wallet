"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  TransactionReceipt,
  copyReceipt,
} from "@/components/wallet/TransactionReceipt";
import { playSuccess } from "@/lib/sound";
import type { TransactionWithParties } from "@/types/db";

export interface MerchantPaySuccessProps {
  tx: TransactionWithParties;
  userId: string;
}

export function MerchantPaySuccess({ tx, userId }: MerchantPaySuccessProps) {
  const router = useRouter();

  useEffect(() => {
    playSuccess();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-success/5">
      <div className="bg-success px-5 pb-12 pt-12 text-center text-white">
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
          ¡Pago realizado!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-1 text-sm text-white/85"
        >
          {tx.merchant_name ?? "Pago completado"}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="-mt-8 flex flex-1 flex-col gap-4 rounded-t-3xl bg-background px-5 py-6"
      >
        <TransactionReceipt tx={tx} userId={userId} />

        <div
          className="mt-auto space-y-2 pt-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => copyReceipt(tx, userId)}
            className="w-full"
            size="lg"
          >
            Compartir recibo
          </Button>
          <Button
            type="button"
            onClick={() => {
              router.refresh();
              router.push("/inicio");
            }}
            className="w-full"
            size="lg"
          >
            Volver al inicio
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
