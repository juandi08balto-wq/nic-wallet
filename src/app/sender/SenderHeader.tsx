import { cn } from "@/lib/utils";

export interface SenderHeaderProps {
  currentStep: number;
}

export function SenderHeader({ currentStep }: SenderHeaderProps) {
  return (
    <header className="pt-safe-lg border-b border-border bg-surface px-5 pb-5">
      <div className="flex items-center gap-2.5">
        <div
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-base font-extrabold text-gold"
        >
          N
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Nic Wallet
        </span>
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Send Money to Nicaragua{" "}
        <span aria-hidden role="img">
          🇳🇮
        </span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your family receives money instantly in their Nic Wallet
      </p>
      <div className="mt-5 flex gap-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= currentStep ? "bg-primary-700" : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        Step {currentStep} of 4
      </p>
    </header>
  );
}
