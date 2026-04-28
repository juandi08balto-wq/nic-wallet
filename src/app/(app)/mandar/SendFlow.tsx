"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SendContactStep } from "./SendContactStep";
import { SendAmountStep } from "./SendAmountStep";
import { SendConfirmStep } from "./SendConfirmStep";
import { SendSuccessStep } from "./SendSuccessStep";
import type { Balance, Currency, TransactionWithParties } from "@/types/db";

export interface SendContact {
  id: string;
  name: string;
  phone: string;
  wallet_tag: string | null;
}

export interface SendFlowProps {
  userId: string;
  contacts: SendContact[];
  balances: Balance[];
}

type Stage = "contact" | "amount" | "confirm" | "success";

const TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function SendFlow({ userId, contacts, balances }: SendFlowProps) {
  const [stage, setStage] = useState<Stage>("contact");
  const [contact, setContact] = useState<SendContact | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<TransactionWithParties | null>(null);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {stage === "contact" && (
        <motion.div key="contact" {...TRANSITION}>
          <SendContactStep
            contacts={contacts}
            onSelect={(c) => {
              setContact(c);
              setStage("amount");
            }}
          />
        </motion.div>
      )}
      {stage === "amount" && contact && (
        <motion.div key="amount" {...TRANSITION}>
          <SendAmountStep
            contact={contact}
            balances={balances}
            initialAmount={amount}
            initialCurrency={currency}
            initialMessage={message}
            onBack={() => setStage("contact")}
            onContinue={(a, c, m) => {
              setAmount(a);
              setCurrency(c);
              setMessage(m);
              setStage("confirm");
            }}
          />
        </motion.div>
      )}
      {stage === "confirm" && contact && (
        <motion.div key="confirm" {...TRANSITION}>
          <SendConfirmStep
            contact={contact}
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
          <SendSuccessStep tx={result} userId={userId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
