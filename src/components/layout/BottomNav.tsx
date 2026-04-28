"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  CreditCard,
  Receipt,
  User,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/es";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  icon: LucideIcon;
  labelKey: DictKey;
}

const tabs: Tab[] = [
  { href: "/inicio", icon: Home, labelKey: "nav.inicio" },
  { href: "/pagos", icon: Wallet, labelKey: "nav.pagos" },
  { href: "/tarjeta", icon: CreditCard, labelKey: "nav.tarjeta" },
  { href: "/actividad", icon: Receipt, labelKey: "nav.actividad" },
  { href: "/perfil", icon: User, labelKey: "nav.perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      className="sticky bottom-0 z-30 border-t border-border bg-surface/85 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary-700 dark:text-gold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-2xl transition-colors",
                    active && "bg-primary-700/10 dark:bg-gold/15",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
                <span>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
