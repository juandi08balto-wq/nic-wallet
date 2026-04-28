"use client";

import Link from "next/link";
import {
  Send,
  ArrowDownLeft,
  QrCode,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface Action {
  href: string;
  icon: LucideIcon;
  label: string;
}

const ACTIONS: Action[] = [
  { href: "/mandar", icon: Send, label: "Mandar" },
  { href: "/recibir", icon: ArrowDownLeft, label: "Recibir" },
  { href: "/pagar", icon: QrCode, label: "Pagar" },
  { href: "/facturas", icon: Receipt, label: "Facturas" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-4 gap-2"
    >
      {ACTIONS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface p-3 ring-1 ring-border transition-colors hover:bg-surface-muted active:bg-surface-muted/80"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold">
            <Icon size={18} strokeWidth={2.2} />
          </span>
          <span className="text-[11px] font-medium">{label}</span>
        </Link>
      ))}
    </motion.div>
  );
}
