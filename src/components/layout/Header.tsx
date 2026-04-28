"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  title?: string;
  greeting?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function Header({ title, greeting, rightSlot, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-5 py-3 backdrop-blur-md",
        className,
      )}
    >
      <div className="min-w-0">
        {greeting && (
          <p className="text-xs font-medium text-muted-foreground">{greeting}</p>
        )}
        {title && (
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        <Link
          href="/notificaciones"
          aria-label="Notificaciones"
          className="rounded-full p-2 text-foreground/80 hover:bg-surface-muted"
        >
          <Bell size={20} />
        </Link>
      </div>
    </header>
  );
}
