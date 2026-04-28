"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  USD_TO_NIO,
  convert,
  currencyLabel,
  formatMoney,
} from "@/lib/currency";
import { playSuccess, playError } from "@/lib/sound";
import type { Currency } from "@/types/db";

export interface ConvertModalProps {
  open: boolean;
  onClose: () => void;
  usd: number;
  nio: number;
  defaultFrom: Currency;
}

export function ConvertModal({
  open,
  onClose,
  usd,
  nio,
  defaultFrom,
}: ConvertModalProps) {
  const router = useRouter();
  const [from, setFrom] = useState<Currency>(defaultFrom);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFrom(defaultFrom);
      setAmount("");
    }
  }, [open, defaultFrom]);

  const to: Currency = from === "USD" ? "NIO" : "USD";
  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const fromBalance = from === "USD" ? usd : nio;
  const converted = convert(amountNum, from, to);
  const valid = amountNum > 0 && amountNum <= fromBalance;

  const swap = () => setFrom((c) => (c === "USD" ? "NIO" : "USD"));

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/balance/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, fromCurrency: from }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        if (err.error === "insufficient_funds") {
          throw new Error("insufficient_funds");
        }
        throw new Error(err.error ?? "convert_failed");
      }
      playSuccess();
      toast.success(
        `Convertiste ${formatMoney(amountNum, from)} a ${formatMoney(converted, to)}`,
      );
      onClose();
      router.refresh();
    } catch (e) {
      playError();
      const msg =
        e instanceof Error && e.message === "insufficient_funds"
          ? "Saldo insuficiente"
          : "No se pudo convertir. Probá de nuevo.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Convertir">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface-muted p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Desde
            </span>
            <span className="text-xs text-muted-foreground">
              Disponible {formatMoney(fromBalance, from)}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium">{currencyLabel(from)}</p>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
            }
            placeholder="0.00"
            className="mt-2 h-14 text-center text-2xl font-bold"
            autoFocus
            invalid={amountNum > fromBalance && amount.length > 0}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={swap}
            aria-label="Invertir dirección"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold-dark ring-1 ring-gold/30 transition-transform hover:scale-105 active:scale-95 dark:text-gold"
          >
            <ArrowDown size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface-muted p-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            A
          </span>
          <p className="mt-0.5 text-sm font-medium">{currencyLabel(to)}</p>
          <p className="mt-2 text-center text-2xl font-bold tabular-nums text-gold-dark dark:text-gold">
            {formatMoney(converted, to)}
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Tasa: 1 USD = C$ {USD_TO_NIO.toFixed(2)}
        </p>

        <Button
          type="button"
          onClick={submit}
          disabled={!valid || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Convirtiendo…" : "Confirmar"}
        </Button>
      </div>
    </Modal>
  );
}
