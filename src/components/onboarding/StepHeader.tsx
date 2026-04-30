"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface StepHeaderProps {
  current: number;
  total?: number;
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
}

export function StepHeader({
  current,
  total = 7,
  title,
  subtitle,
  backHref,
  onBack,
}: StepHeaderProps) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else if (backHref) router.push(backHref);
  };

  return (
    <div className="pt-safe-lg px-5 pb-3">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Atrás"
          className="-ml-2 rounded-full p-2 text-foreground transition-colors hover:bg-surface-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs font-medium text-muted-foreground">
          Paso {current} de {total}
        </span>
        <div className="w-9" aria-hidden />
      </div>
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < current ? "bg-primary-700 dark:bg-gold" : "bg-border",
            )}
          />
        ))}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
