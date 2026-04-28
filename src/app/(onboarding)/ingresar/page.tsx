"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PinKeypad } from "@/components/ui/PinKeypad";
import { createClient } from "@/lib/supabase/client";
import { phoneToEmail, pinToPassword, digitsOnly } from "@/lib/auth";
import { playError, playSuccess } from "@/lib/sound";

export default function IngresarPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+505 ");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [submitting, setSubmitting] = useState(false);

  const local = digitsOnly(phone).replace(/^505/, "");
  const phoneValid = local.length === 8;

  const submit = async (finalPin: string) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(phone),
        password: pinToPassword(finalPin),
      });
      if (error) throw error;
      playSuccess();
      router.refresh();
      router.push("/inicio");
    } catch {
      playError();
      toast.error("Credenciales inválidas. Verificá tu número y PIN.");
      setSubmitting(false);
      setPin("");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-3 pt-5">
        <Link
          href="/splash"
          aria-label="Volver"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
        >
          <ArrowLeft size={20} />
        </Link>
      </header>

      <div className="px-5 pt-2 pb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 text-2xl font-extrabold text-gold ring-1 ring-primary-800">
            N
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nic Wallet
            </p>
            <p className="text-sm font-semibold text-gold">Mandá. Recibí. Pagá.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5">
        {step === "phone" ? (
          <motion.form
            key="phone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (phoneValid) setStep("pin");
            }}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-bold tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresá tu número de celular para continuar.
            </p>
            <div className="mt-8">
              <PhoneInput value={phone} onChange={setPhone} autoFocus />
            </div>
            <div
              className="mt-auto space-y-3 pt-6"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
            >
              <Button
                type="submit"
                disabled={!phoneValid}
                className="w-full"
                size="lg"
              >
                Continuar
              </Button>
              <Link
                href="/registrarse/1"
                className="block text-center text-sm font-medium text-primary-700 dark:text-gold"
              >
                ¿No tenés cuenta? Crear una
              </Link>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-bold tracking-tight">Ingresá tu PIN</h1>
            <p className="mt-1 text-sm text-muted-foreground">{phone}</p>
            <div className="mt-2">
              <PinKeypad
                value={pin}
                onChange={setPin}
                onComplete={submit}
                disabled={submitting}
              />
            </div>
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setPin("");
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cambiar número
              </button>
            </div>
            <div
              className="mt-auto"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
