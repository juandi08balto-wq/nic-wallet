"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SenderHeader } from "./SenderHeader";
import {
  StepRecipient,
  type SenderRecipient,
} from "./StepRecipient";
import { StepAmount } from "./StepAmount";
import { StepPayment, type PaymentMethod } from "./StepPayment";
import { StepConfirm } from "./StepConfirm";
import { StepSuccess } from "./StepSuccess";
import type { TransactionWithParties } from "@/types/db";

type Stage = "recipient" | "amount" | "payment" | "confirm" | "success";

const STAGE_NUMBER: Record<Exclude<Stage, "success">, number> = {
  recipient: 1,
  amount: 2,
  payment: 3,
  confirm: 4,
};

export function SenderFlow() {
  const [stage, setStage] = useState<Stage>("recipient");
  const [phone, setPhone] = useState("");
  const [recipient, setRecipient] = useState<SenderRecipient | null>(null);
  const [usdAmount, setUsdAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [result, setResult] = useState<TransactionWithParties | null>(null);

  const reset = () => {
    setStage("recipient");
    setPhone("");
    setRecipient(null);
    setUsdAmount("");
    setSenderName("");
    setPaymentMethod(null);
    setResult(null);
  };

  if (stage === "success" && recipient && result) {
    return (
      <StepSuccess
        recipient={recipient}
        usdAmount={parseFloat(usdAmount.replace(",", ".")) || 0}
        senderName={senderName}
        onSendAnother={reset}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SenderHeader currentStep={STAGE_NUMBER[stage as Exclude<Stage, "success">]} />

      <AnimatePresence mode="wait" initial={false}>
        {stage === "recipient" && (
          <StepRecipient
            key="recipient"
            initialPhone={phone}
            initialRecipient={recipient}
            onContinue={(p, r) => {
              setPhone(p);
              setRecipient(r);
              setStage("amount");
            }}
          />
        )}
        {stage === "amount" && recipient && (
          <StepAmount
            key="amount"
            recipient={recipient}
            initialUsdAmount={usdAmount}
            initialSenderName={senderName}
            onBack={() => setStage("recipient")}
            onContinue={(amount, name) => {
              setUsdAmount(amount);
              setSenderName(name);
              setStage("payment");
            }}
          />
        )}
        {stage === "payment" && recipient && (
          <StepPayment
            key="payment"
            initialMethod={paymentMethod}
            onBack={() => setStage("amount")}
            onContinue={(method) => {
              setPaymentMethod(method);
              setStage("confirm");
            }}
          />
        )}
        {stage === "confirm" && recipient && paymentMethod && (
          <StepConfirm
            key="confirm"
            recipient={recipient}
            usdAmount={usdAmount}
            senderName={senderName}
            paymentMethod={paymentMethod}
            onBack={() => setStage("payment")}
            onSuccess={(tx) => {
              setResult(tx);
              setStage("success");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
