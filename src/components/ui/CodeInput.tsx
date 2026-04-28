"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface CodeInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
  className?: string;
}

export function CodeInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  className,
}: CodeInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  const focus = () => ref.current?.focus();

  return (
    <button
      type="button"
      onClick={focus}
      className={cn("relative block w-full text-left", className)}
    >
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        autoFocus={autoFocus}
        aria-label="Código de verificación"
        className="absolute inset-0 z-10 h-full w-full opacity-0"
      />
      <div className="flex justify-center gap-2.5">
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const filled = !!char;
          const active = i === value.length;
          return (
            <div
              key={i}
              className={cn(
                "flex h-14 w-12 items-center justify-center rounded-2xl border-2 text-2xl font-semibold transition-all",
                filled
                  ? "border-primary-700 bg-primary-50 text-primary-700 dark:bg-primary-700/20 dark:text-gold"
                  : "border-border bg-surface text-muted-foreground",
                active && !filled && "border-primary-300 ring-4 ring-primary-100 dark:ring-primary-700/30",
              )}
            >
              {char ?? ""}
            </div>
          );
        })}
      </div>
    </button>
  );
}
