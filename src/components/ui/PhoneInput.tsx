"use client";

import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";
import { formatNicaraguanPhone } from "@/lib/auth";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<InputProps, "onChange" | "value" | "type" | "inputMode"> {
  value: string;
  onChange: (formatted: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, ...props }, ref) => (
    <Input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder="+505 8812 3456"
      value={value || "+505 "}
      onChange={(e) => onChange(formatNicaraguanPhone(e.target.value))}
      className={cn(
        "h-16 text-center text-2xl font-semibold tracking-wider",
        className,
      )}
      {...props}
    />
  ),
);
PhoneInput.displayName = "PhoneInput";
