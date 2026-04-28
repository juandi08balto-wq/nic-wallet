"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { playSuccess, playError } from "@/lib/sound";

export function DemoSeedCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const seed = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      if (!res.ok) throw new Error("seed_failed");
      playSuccess();
      toast.success("¡Saldo agregado! Ya podés mandar y recibir.");
      router.refresh();
    } catch {
      playError();
      toast.error("No se pudo agregar el saldo. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-5 text-white shadow-md ring-1 ring-primary-800"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold ring-1 ring-gold/40 backdrop-blur"
        >
          <Sparkles size={20} />
        </span>
        <div className="flex-1">
          <h3 className="text-base font-semibold tracking-tight">
            Bienvenido a Nic Wallet
          </h3>
          <p className="mt-1 text-sm text-white/75">
            Recibí saldo de prueba para empezar a mandar, recibir y pagar.
          </p>
        </div>
      </div>
      <Button
        type="button"
        onClick={seed}
        disabled={submitting}
        variant="gold"
        size="lg"
        className="mt-4 w-full"
      >
        {submitting ? "Agregando…" : "Recibir saldo de prueba"}
      </Button>
    </motion.div>
  );
}
