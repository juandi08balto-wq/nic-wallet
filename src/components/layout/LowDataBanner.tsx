import { Radio } from "lucide-react";

export function LowDataBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-warning/15 p-3 text-sm ring-1 ring-warning/30">
      <Radio
        size={18}
        strokeWidth={2.2}
        className="mt-0.5 shrink-0 text-warning"
        aria-hidden
      />
      <p className="text-foreground/85 leading-snug">
        <span className="font-semibold text-foreground">
          Conectividad baja
        </span>{" "}
        — Mandá dinero por SMS al{" "}
        <span className="font-semibold text-foreground">+505 0092 5538</span>
      </p>
    </div>
  );
}
