"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/utils";
import { formatNicaraguanPhone } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import type { Currency, Profile } from "@/types/db";

export interface ReceiveContentProps {
  profile: Profile;
}

export function ReceiveContent({ profile }: ReceiveContentProps) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("NIO");
  const [note, setNote] = useState("");

  const phoneFormatted = formatNicaraguanPhone(profile.phone);
  const initial = profile.name.charAt(0).toUpperCase() || "N";
  const amountNum = parseFloat(amount.replace(",", ".")) || 0;

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneFormatted);
      toast.success("Número copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const shareRequest = async () => {
    if (amountNum <= 0) return;
    const text = `Mandame ${formatMoney(amountNum, currency)} al ${phoneFormatted} en Nic Wallet${
      note ? ` — ${note}` : ""
    }`;

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ text });
        setRequestOpen(false);
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Mensaje copiado");
      setRequestOpen(false);
    } catch {
      toast.error("No se pudo compartir");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-3 py-3">
        <Link
          href="/inicio"
          aria-label="Volver"
          className="rounded-full p-2 text-foreground hover:bg-surface-muted"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-semibold">Recibir</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-start gap-6 px-5 pb-8 pt-2">
        <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-border">
          <p className="text-center text-sm text-muted-foreground">
            Compartí tu QR para recibir dinero
          </p>
          <div className="mt-4 flex justify-center">
            <div className="rounded-2xl bg-white p-3 ring-1 ring-border">
              <QRCodeSVG
                value={profile.phone}
                size={196}
                fgColor="#0F2A6B"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>
          </div>
          <div className="mt-5 text-center">
            <div
              aria-hidden
              className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-2xl font-extrabold text-gold"
            >
              {initial}
            </div>
            <p className="text-base font-semibold">{profile.name}</p>
            {profile.wallet_tag && (
              <p className="text-sm font-medium text-primary-700 dark:text-gold">
                @{profile.wallet_tag}
              </p>
            )}
            <button
              type="button"
              onClick={copyPhone}
              className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {phoneFormatted}
              <Copy size={12} />
            </button>
          </div>
        </div>

        <Button
          type="button"
          variant="gold"
          size="lg"
          className="w-full max-w-sm"
          onClick={() => setRequestOpen(true)}
        >
          <Share2 size={18} /> Solicitar dinero
        </Button>
      </div>

      <Sheet
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Solicitar dinero"
      >
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

          <Button
            type="button"
            onClick={shareRequest}
            disabled={amountNum <= 0}
            className="w-full"
            size="lg"
          >
            Compartir solicitud
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
