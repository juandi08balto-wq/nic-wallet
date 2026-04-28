"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import type { Currency } from "@/types/db";

export interface CollectAmountSheetProps {
  open: boolean;
  onClose: () => void;
  phone: string;
}

export function CollectAmountSheet({
  open,
  onClose,
  phone,
}: CollectAmountSheetProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("NIO");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setCurrency("NIO");
      setNote("");
    }
  }, [open]);

  const amountNum = parseFloat(amount.replace(",", ".")) || 0;
  const hasAmount = amountNum > 0;

  const params = new URLSearchParams({
    to: phone,
    amount: amountNum.toString(),
    currency,
  });
  if (note.trim()) params.set("note", note.trim());
  const payUrl = `nicwallet://pay?${params.toString()}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payUrl);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const share = async () => {
    const text = `Pagame ${formatMoney(amountNum, currency)} en Nic Wallet${
      note.trim() ? ` — ${note.trim()}` : ""
    }: ${payUrl}`;
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ text });
        return;
      }
    } catch {
      // user cancelled — fall through
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Mensaje copiado");
    } catch {
      toast.error("No se pudo compartir");
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Cobrar monto específico">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Monto
          </label>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
            }
            placeholder="0.00"
            className="h-14 text-center text-2xl font-bold"
            autoFocus
          />
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-surface-muted p-1 ring-1 ring-border">
            {(["USD", "NIO"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  currency === c
                    ? "bg-primary-700 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Mensaje (opcional)
          </label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 60))}
            placeholder="Para qué?"
            maxLength={60}
          />
        </div>

        {hasAmount && (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-muted p-4 ring-1 ring-border">
            <div className="rounded-2xl bg-white p-3 ring-1 ring-border">
              <QRCodeSVG
                value={payUrl}
                size={160}
                fgColor="#0F2A6B"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>
            <p className="text-center text-sm font-semibold tabular-nums text-gold-dark dark:text-gold">
              {formatMoney(amountNum, currency)}
            </p>
            <p className="break-all text-center text-[10px] text-muted-foreground">
              {payUrl}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={copy}
            disabled={!hasAmount}
            className="flex-1"
            size="lg"
          >
            <Copy size={16} /> Copiar enlace
          </Button>
          <Button
            type="button"
            onClick={share}
            disabled={!hasAmount}
            className="flex-1"
            size="lg"
          >
            <Share2 size={16} /> Compartir
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
