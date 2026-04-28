"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface PinKeypadProps {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
}

const KEYS: Array<string | "del" | ""> = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  "",  "0", "del",
];

export function PinKeypad({
  value,
  onChange,
  onComplete,
  length = 4,
  disabled,
  className,
}: PinKeypadProps) {
  // Fire onComplete exactly once per fill, not on each render. Tracks the
  // last value we already reported.
  const reportedRef = useRef("");
  useEffect(() => {
    if (value.length === length && reportedRef.current !== value) {
      reportedRef.current = value;
      onComplete?.(value);
    } else if (value.length < length) {
      reportedRef.current = "";
    }
  }, [value, length, onComplete]);

  const press = (digit: string) => {
    if (disabled || value.length >= length) return;
    onChange(value + digit);
  };

  const backspace = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex gap-4 my-10">
        {Array.from({ length }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "h-4 w-4 rounded-full transition-colors",
              i < value.length
                ? "bg-primary-700 dark:bg-gold"
                : "bg-border",
            )}
            animate={
              i === value.length - 1
                ? { scale: [1, 1.4, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {KEYS.map((k, i) => {
          if (k === "") return <div key={i} aria-hidden />;
          if (k === "del") {
            return (
              <button
                key={i}
                type="button"
                aria-label="Borrar"
                onClick={backspace}
                disabled={disabled}
                className="flex h-16 items-center justify-center rounded-2xl text-foreground transition-colors hover:bg-surface-muted active:bg-surface-muted/70 disabled:opacity-40"
              >
                <Delete size={22} strokeWidth={2.2} />
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              disabled={disabled}
              className="flex h-16 items-center justify-center rounded-2xl text-2xl font-semibold text-foreground transition-colors hover:bg-surface-muted active:bg-surface-muted/70 disabled:opacity-40"
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}
