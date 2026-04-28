"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { CollectAmountSheet } from "./CollectAmountSheet";
import { formatNicaraguanPhone } from "@/lib/auth";
import type { Profile } from "@/types/db";

export interface ShowCodeModeProps {
  profile: Profile;
}

export function ShowCodeMode({ profile }: ShowCodeModeProps) {
  const [collectOpen, setCollectOpen] = useState(false);
  const initial = profile.name.charAt(0).toUpperCase() || "N";
  const phoneFormatted = formatNicaraguanPhone(profile.phone);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneFormatted);
      toast.success("Número copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 flex-col items-center gap-5 px-5 pt-4 pb-6"
    >
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-border">
        <p className="text-center text-sm text-muted-foreground">
          Mostrá este código para recibir pagos
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
        onClick={() => setCollectOpen(true)}
      >
        <Share2 size={18} /> Cobrar monto específico
      </Button>

      <CollectAmountSheet
        open={collectOpen}
        onClose={() => setCollectOpen(false)}
        phone={profile.phone}
      />
    </motion.div>
  );
}
