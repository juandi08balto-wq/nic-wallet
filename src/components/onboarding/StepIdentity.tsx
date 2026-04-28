"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function StepIdentity() {
  const router = useRouter();
  const { state, update, hydrated } = useSignup();
  const [name, setName] = useState(state.name);
  const [cedula, setCedula] = useState(state.cedula);

  useEffect(() => {
    if (hydrated && !state.code) router.replace("/registrarse/2");
  }, [hydrated, state.code, router]);

  const cedulaDigits = cedula.replace(/\D/g, "");
  const validName = name.trim().length >= 2;
  const validCedula = cedulaDigits.length === 14;
  const valid = validName && validCedula;

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={4}
        backHref="/registrarse/3"
        title="Tu identidad"
        subtitle="Para esta demo no se verifica con un sistema real. Cualquier número de cédula con 14 dígitos funciona."
      />
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          update({ name: name.trim(), cedula: cedulaDigits });
          router.push("/registrarse/5");
        }}
        className="flex flex-1 flex-col gap-5 px-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            autoFocus
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cedula">Número de cédula</Label>
          <Input
            id="cedula"
            inputMode="numeric"
            value={cedula}
            onChange={(e) =>
              setCedula(e.target.value.replace(/\D/g, "").slice(0, 14))
            }
            placeholder="14 dígitos"
            maxLength={14}
            invalid={cedulaDigits.length > 0 && cedulaDigits.length < 14}
          />
          <p className="text-xs text-muted-foreground">
            {cedulaDigits.length}/14 dígitos
          </p>
        </div>
        <div
          className="mt-auto"
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
