"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export interface HomeHeaderProps {
  name: string;
  unreadCount: number;
}

// Always renders the user's first-name initial inside a gold circle on a
// deep blue header. Selfie photos are intentionally NEVER used here —
// they're collected for identity verification, not display.
export function HomeHeader({ name, unreadCount }: HomeHeaderProps) {
  const firstName = name.split(" ")[0] || name;
  const initial = firstName.charAt(0).toUpperCase() || "N";

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 bg-primary-700 px-4 pb-3 text-white"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-lg font-extrabold text-primary-900 ring-2 ring-gold-light/30">
        <span aria-hidden>{initial}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white/70">Hola</p>
        <h1 className="truncate text-base font-semibold tracking-tight">
          {firstName}
        </h1>
      </div>
      <Link
        href="/notificaciones"
        aria-label={
          unreadCount > 0
            ? `Notificaciones (${unreadCount} sin leer)`
            : "Notificaciones"
        }
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
      >
        <Bell size={20} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-primary-900 ring-2 ring-primary-700">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
