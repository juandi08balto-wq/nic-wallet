"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Store, ChevronRight } from "lucide-react";
import { useSignup } from "./SignupProvider";
import { StepHeader } from "./StepHeader";
import { cn } from "@/lib/utils";

const TYPES = [
  {
    value: "personal" as const,
    icon: User,
    label: "Personal",
    desc: "Para mandar y recibir dinero fácilmente",
  },
  {
    value: "negocio" as const,
    icon: Store,
    label: "Negocio",
    desc: "Para tu negocio, cobrar clientes y más",
  },
];

export function StepAccountType() {
  const router = useRouter();
  const { state, update } = useSignup();

  const select = (value: "personal" | "negocio") => {
    update({ account_type: value });
    router.push("/registrarse/2");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader
        current={1}
        backHref="/splash"
        title="¿Cómo vas a usar Nic Wallet?"
        subtitle="Podés cambiar esto luego en tu perfil."
      />

      <div className="flex items-center gap-3 px-5 pt-1 pb-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-700 text-base font-extrabold text-gold">
          N
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Nic Wallet</p>
          <p className="text-xs text-muted-foreground">
            Mandá. Recibí. Pagá.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-1 flex-col gap-3 px-5 pt-2"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
      >
        {TYPES.map(({ value, icon: Icon, label, desc }) => {
          const active = state.account_type === value;
          return (
            <motion.button
              key={value}
              type="button"
              onClick={() => select(value)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-5 text-left transition-colors",
                active
                  ? "ring-2 ring-primary-700"
                  : "ring-1 ring-border hover:ring-primary-300",
              )}
            >
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
              >
                <Icon size={24} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold tracking-tight">
                  {label}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight
                size={20}
                className="shrink-0 text-muted-foreground"
                aria-hidden
              />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
