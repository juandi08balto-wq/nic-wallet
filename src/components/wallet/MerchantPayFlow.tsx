"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MerchantPayAmount } from "./MerchantPayAmount";
import { MerchantPayConfirm } from "./MerchantPayConfirm";
import { MerchantPaySuccess } from "./MerchantPaySuccess";
import type { Balance, Currency, TransactionWithParties } from "@/types/db";
import type { DemoMerchant } from "@/lib/demo/merchants";

export interface MerchantPayFlowProps {
  merchant: DemoMerchant;
  balances: Balance[];
  userId: string;
  onClose: () => void;
}

type Stage = "amount" | "confirm" | "success";

const TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

export function MerchantPayFlow({
  merchant,
  balances,
  userId,
  onClose,
}: MerchantPayFlowProps) {
  const [stage, setStage] = useState<Stage>("amount");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<TransactionWithParties | null>(null);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {stage === "amount" && (
        <motion.div key="amount" {...TRANSITION}>
          <MerchantPayAmount
            merchant={merchant}
            balances={balances}
            initialAmount={amount}
            initialCurrency={currency}
            initialMessage={message}
            onClose={onClose}
            onContinue={(a, c, m) => {
              setAmount(a);
              setCurrency(c);
              setMessage(m);
              setStage("confirm");
            }}
          />
        </motion.div>
      )}
      {stage === "confirm" && (
        <motion.div key="confirm" {...TRANSITION}>
          <MerchantPayConfirm
            merchant={merchant}
            amount={amount}
            currency={currency}
            message={message}
            onBack={() => setStage("amount")}
            onSuccess={(tx) => {
              setResult(tx);
              setStage("success");
            }}
          />
        </motion.div>
      )}
      {stage === "success" && result && (
        <motion.div key="success" {...TRANSITION}>
          <MerchantPaySuccess tx={result} userId={userId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
