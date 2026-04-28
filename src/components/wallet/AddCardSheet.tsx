"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface AddCardSheetProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function AddCardSheet({ open, onClose, onAdded }: AddCardSheetProps) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNumber("");
      setExpiry("");
      setCvv("");
      setNickname("");
    }
  }, [open]);

  const numberDigits = number.replace(/\D/g, "");
  const expiryDigits = expiry.replace(/\D/g, "");
  const validNumber = numberDigits.length === 16;
  const validExpiry = expiryDigits.length === 4;
  const validCvv = cvv.length === 3;
  const valid = validNumber && validExpiry && validCvv;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: numberDigits,
          expiry: expiryDigits,
          cvv,
          nickname: nickname.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(err.error ?? "add_card_failed");
      }
      toast.success("Tarjeta agregada");
      onAdded();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo agregar la tarjeta. Probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Agregar tarjeta">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="card-number">Número de tarjeta</Label>
          <Input
            id="card-number"
            inputMode="numeric"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            autoComplete="cc-number"
            maxLength={19}
            invalid={numberDigits.length > 0 && !validNumber}
            autoFocus
          />
          <p className="text-[11px] text-muted-foreground">
            {numberDigits.length}/16 dígitos
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="card-expiry">Vencimiento</Label>
            <Input
              id="card-expiry"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              autoComplete="cc-exp"
              maxLength={5}
              invalid={expiryDigits.length > 0 && !validExpiry}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-cvv">CVV</Label>
            <Input
              id="card-cvv"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="123"
              autoComplete="cc-csc"
              maxLength={3}
              invalid={cvv.length > 0 && !validCvv}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="card-nickname">Apodo (opcional)</Label>
          <Input
            id="card-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 30))}
            placeholder="Personal, BAC, etc."
            maxLength={30}
          />
        </div>

        <Button
          type="button"
          onClick={submit}
          disabled={!valid || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Guardando…" : "Guardar tarjeta"}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Solo para esta demo. Los datos no se procesan ni se envían a ningún
          procesador.
        </p>
      </div>
    </Sheet>
  );
}
