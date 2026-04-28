"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/I18nProvider";
import { buttonClasses } from "@/components/ui/Button";

export default function SplashPage() {
  const t = useT();
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-primary-700 via-primary-800 to-primary-900 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-coral/20 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-[28px] bg-gold/15 ring-1 ring-gold/40 backdrop-blur">
            <span className="text-gold text-5xl font-extrabold tracking-tight">
              N
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight">
              {t("brand.name")}
            </h1>
            <p className="text-2xl font-semibold tracking-tight text-gold">
              {t("brand.tagline")}
            </p>
            <p className="text-sm text-white/70">{t("splash.subtitle")}</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative space-y-3 px-6 pb-10"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2.5rem)" }}
      >
        <Link
          href="/registrarse/1"
          className={buttonClasses({ variant: "gold", size: "lg", className: "w-full" })}
        >
          {t("splash.cta_signUp")}
        </Link>
        <Link
          href="/ingresar"
          className={buttonClasses({
            variant: "ghost-light",
            size: "lg",
            className: "w-full",
          })}
        >
          {t("splash.cta_signIn")}
        </Link>
      </motion.div>
    </div>
  );
}
