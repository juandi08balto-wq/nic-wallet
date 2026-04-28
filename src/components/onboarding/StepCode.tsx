"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { Button } from "@/components/ui/Button";
import { CodeInput } from "@/components/ui/CodeInput";

const DEMO_CODE = "123456";

export function StepCode() {
  const router = useRouter();
  const { state, update, hydrated } = useSignup();
  const [code, setCode] = useState(state.code);

  useEffect(() => {
    if (hydrated && !state.phone) router.replace("/registrarse/2");
  }, [hydrated, state.phone, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    if (code !== DEMO_CODE) {
      toast.error(`Código incorrecto. Para esta demo, usá ${DEMO_CODE}.`);
      return;
    }
    update({ code });
    router.push("/registrarse/4");
  };

  const resend = () => {
    toast.success(`Código reenviado a ${state.phone}`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={3}
        backHref="/registrarse/2"
        title="Verificá tu número"
        subtitle={`Código enviado a ${state.phone || "+505"}. Para esta demo, ingresá ${DEMO_CODE}.`}
      />
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col px-5"
      >
        <div className="pt-2">
          <CodeInput value={code} onChange={setCode} length={6} autoFocus />
        </div>
        <button
          type="button"
          onClick={resend}
          className="mt-6 self-center text-sm font-medium text-primary-700 dark:text-gold"
        >
          Reenviar código
        </button>
        <div
          className="mt-auto pt-6"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
        >
          <Button
            type="submit"
            disabled={code.length !== 6}
            className="w-full"
            size="lg"
          >
            Continuar
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
