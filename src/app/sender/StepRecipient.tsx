"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { digitsOnly } from "@/lib/auth";

export interface SenderRecipient {
  id: string;
  name: string;
  phone: string;
}

export interface StepRecipientProps {
  initialPhone: string;
  initialRecipient: SenderRecipient | null;
  onContinue: (phone: string, recipient: SenderRecipient) => void;
}

export function StepRecipient({
  initialPhone,
  initialRecipient,
  onContinue,
}: StepRecipientProps) {
  const [phone, setPhone] = useState(initialPhone || "+505 ");
  const [recipient, setRecipient] = useState<SenderRecipient | null>(
    initialRecipient,
  );
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const local = digitsOnly(phone).replace(/^505/, "");
  const validPhone = local.length === 8;

  const find = async () => {
    if (!validPhone || searching) return;
    setSearching(true);
    setNotFound(false);
    try {
      const res = await fetch("/api/remittance/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("lookup_failed");
      const data = (await res.json()) as
        | { found: true; profile: SenderRecipient }
        | { found: false };
      if (!data.found) {
        setRecipient(null);
        setNotFound(true);
        return;
      }
      setRecipient(data.profile);
      setNotFound(false);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't search right now. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const onPhoneChange = (v: string) => {
    setPhone(v);
    if (recipient) setRecipient(null);
    if (notFound) setNotFound(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col px-5 pt-6 pb-8"
    >
      <label
        htmlFor="recipient-phone"
        className="text-sm font-semibold text-foreground"
      >
        Nicaragua phone number
      </label>
      <p className="mt-1 text-xs text-muted-foreground">
        We'll find your family member's Nic Wallet account.
      </p>

      <div className="mt-3 flex items-stretch gap-2">
        <div className="flex-1">
          <PhoneInput
            id="recipient-phone"
            value={phone}
            onChange={onPhoneChange}
            autoFocus
          />
        </div>
        <Button
          type="button"
          onClick={find}
          disabled={!validPhone || searching}
          size="lg"
          className="px-5"
        >
          <Search size={18} />
          {searching ? "…" : "Find"}
        </Button>
      </div>

      {recipient && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-center gap-3 rounded-2xl bg-success/10 p-4 ring-1 ring-success/30"
        >
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-700 text-lg font-bold text-gold"
          >
            {recipient.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold leading-tight">
              {recipient.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Has a Nic Wallet account
            </p>
          </div>
          <CheckCircle2
            size={20}
            className="shrink-0 text-success"
            aria-hidden
          />
        </motion.div>
      )}

      {notFound && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-start gap-3 rounded-2xl bg-error/10 p-4 ring-1 ring-error/30"
        >
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-error"
            aria-hidden
          />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              No Nic Wallet account found
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Double-check the number, or ask them to download Nic Wallet first.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mt-auto pt-8">
        <Button
          type="button"
          disabled={!recipient}
          onClick={() => recipient && onContinue(phone, recipient)}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
