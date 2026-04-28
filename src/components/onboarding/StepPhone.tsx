"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { digitsOnly } from "@/lib/auth";

export function StepPhone() {
  const router = useRouter();
  const { state, update, hydrated } = useSignup();
  const [phone, setPhone] = useState(state.phone || "+505 ");

  useEffect(() => {
    if (hydrated && !state.account_type) router.replace("/registrarse/1");
  }, [hydrated, state.account_type, router]);

  const local = digitsOnly(phone).replace(/^505/, "");
  const valid = local.length === 8;

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={2}
        backHref="/registrarse/1"
        title="Tu número de celular"
        subtitle="Lo usamos para crear tu cuenta y para que tus contactos te encuentren."
      />
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          update({ phone });
          router.push("/registrarse/3");
        }}
        className="flex flex-1 flex-col px-5"
      >
        <PhoneInput value={phone} onChange={setPhone} autoFocus />
        <p className="mt-3 text-xs text-muted-foreground">
          Para esta demo no se envía SMS de verdad — el código de verificación
          siempre es <span className="font-semibold text-foreground">123456</span>.
        </p>
        <div
          className="mt-auto pt-6"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Button type="submit" disabled={!valid} className="w-full" size="lg">
            Continuar
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
