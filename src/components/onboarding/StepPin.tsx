"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { PinKeypad } from "@/components/ui/PinKeypad";
import { createClient } from "@/lib/supabase/client";
import { phoneToEmail, pinToPassword } from "@/lib/auth";
import { playSuccess, playError } from "@/lib/sound";

type Phase = "enter" | "confirm" | "submitting";

export function StepPin() {
  const router = useRouter();
  const { state, reset, hydrated } = useSignup();
  const [phase, setPhase] = useState<Phase>("enter");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (hydrated && !state.cedula) router.replace("/registrarse/2");
  }, [hydrated, state.cedula, router]);

  const submit = useCallback(
    async (finalPin: string) => {
      setPhase("submitting");
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: state.phone,
            pin: finalPin,
            name: state.name,
            cedula: state.cedula,
            selfieDataUrl: state.selfieDataUrl,
            accountType: state.account_type || "personal",
            cedulaFrontUrl: state.cedula_front_url,
            cedulaBackUrl: state.cedula_back_url,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
            userMessage?: string;
            message?: string;
            debug?: unknown;
            issues?: Array<{ path: string; message: string }>;
          };
          console.error("[/registrarse] signup error:", err);
          playError();

          // Account already exists → route to sign-in instead of retry.
          if (err.error === "already_exists" || err.error === "phone_in_use") {
            toast.error(
              err.userMessage ??
                "Ya existe una cuenta con ese número. Iniciá sesión.",
            );
            reset();
            router.push("/ingresar");
            return;
          }

          // Everything else: surface the Spanish userMessage from the API
          // (or fall back) and let the user re-enter their PIN.
          const message =
            err.userMessage ??
            err.message ??
            "No pudimos crear tu cuenta. Probá de nuevo.";
          toast.error(message);
          setPhase("enter");
          setPin("");
          setConfirmPin("");
          return;
        }

        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: phoneToEmail(state.phone),
          password: pinToPassword(finalPin),
        });
        if (signInError) throw signInError;

        playSuccess();
        reset();
        router.refresh();
        router.push("/inicio");
      } catch (e) {
        console.error("[/registrarse] signup threw:", e);
        playError();
        toast.error(
          e instanceof Error && e.message
            ? `No pudimos crear tu cuenta: ${e.message}`
            : "No pudimos crear tu cuenta. Probá de nuevo.",
        );
        setPhase("enter");
        setPin("");
        setConfirmPin("");
      }
    },
    [
      state.phone,
      state.name,
      state.cedula,
      state.selfieDataUrl,
      state.account_type,
      state.cedula_front_url,
      state.cedula_back_url,
      reset,
      router,
    ],
  );

  const onComplete = (value: string) => {
    if (phase === "enter") {
      setPin(value);
      setConfirmPin("");
      setPhase("confirm");
      return;
    }
    if (phase === "confirm") {
      if (value !== pin) {
        playError();
        setShakeKey((k) => k + 1);
        toast.error("Los PIN no coinciden. Intentá de nuevo.");
        // Clear after the shake animation so the dots reset visually.
        setTimeout(() => setConfirmPin(""), 350);
        return;
      }
      void submit(value);
    }
  };

  const currentValue =
    phase === "enter" ? pin : phase === "confirm" ? confirmPin : pin;
  const onChange = (v: string) => {
    if (phase === "enter") setPin(v);
    else if (phase === "confirm") setConfirmPin(v);
  };

  const title =
    phase === "submitting"
      ? "Creando tu cuenta…"
      : phase === "enter"
        ? "Creá tu PIN"
        : "Confirmá tu PIN";

  const subtitle =
    phase === "submitting"
      ? "Un momento, no cierres la app."
      : phase === "enter"
        ? "Lo vas a usar para autorizar pagos. 4 dígitos."
        : "Ingresalo de nuevo para confirmarlo.";

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={7}
        title={title}
        subtitle={subtitle}
        onBack={() => {
          if (phase === "enter") router.push("/registrarse/6");
          else if (phase === "confirm") {
            setPhase("enter");
            setConfirmPin("");
          }
        }}
      />
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [0, -10, 10, -7, 7, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col px-5"
      >
        <PinKeypad
          value={currentValue}
          onChange={onChange}
          onComplete={onComplete}
          disabled={phase === "submitting"}
        />
      </motion.div>
    </div>
  );
}
