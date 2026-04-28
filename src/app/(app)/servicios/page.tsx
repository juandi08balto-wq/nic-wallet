"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  ChevronRight,
  CreditCard,
  Download,
  QrCode,
  Receipt,
  Smartphone,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/utils";

type SheetKind = "deposit" | "withdraw" | null;

interface ChoiceOption {
  href: string;
  icon: LucideIcon;
  label: string;
  desc: string;
}

const DEPOSIT_OPTIONS: ChoiceOption[] = [
  {
    href: "/depositar/tarjeta",
    icon: CreditCard,
    label: "Con tarjeta",
    desc: "Desde una tarjeta vinculada",
  },
  {
    href: "/depositar/efectivo",
    icon: Banknote,
    label: "En efectivo",
    desc: "En tiendas asociadas",
  },
];

const WITHDRAW_OPTIONS: ChoiceOption[] = [
  {
    href: "/retirar/tarjeta",
    icon: CreditCard,
    label: "A tarjeta",
    desc: "A una tarjeta vinculada",
  },
  {
    href: "/retirar/efectivo",
    icon: Banknote,
    label: "En efectivo",
    desc: "En tiendas asociadas",
  },
];

export default function ServiciosPage() {
  const [openSheet, setOpenSheet] = useState<SheetKind>(null);
  const close = () => setOpenSheet(null);

  return (
    <>
      <Header title="Servicios" />
      <ul className="flex flex-col gap-2 px-4 py-4">
        <ActionRow
          icon={Download}
          label="Depositar"
          desc="Con tarjeta o en efectivo"
          onClick={() => setOpenSheet("deposit")}
        />
        <ActionRow
          icon={Upload}
          label="Retirar"
          desc="A tarjeta o en efectivo"
          onClick={() => setOpenSheet("withdraw")}
        />
        <LinkRow
          href="/pagar"
          icon={QrCode}
          label="Pagar con QR"
          desc="Escaneá o mostrá tu código"
        />
        <LinkRow
          href="/facturas"
          icon={Receipt}
          label="Facturas"
          desc="Pagá luz, agua, internet"
        />
        <LinkRow
          href="/recargar"
          icon={Smartphone}
          label="Recargar saldo"
          desc="Tu celular o el de otros"
        />
      </ul>

      <Sheet
        open={openSheet === "deposit"}
        onClose={close}
        title="Depositar"
      >
        <ChoiceCards options={DEPOSIT_OPTIONS} onSelect={close} />
      </Sheet>

      <Sheet
        open={openSheet === "withdraw"}
        onClose={close}
        title="Retirar"
      >
        <ChoiceCards options={WITHDRAW_OPTIONS} onSelect={close} />
      </Sheet>
    </>
  );
}

interface RowBaseProps {
  icon: LucideIcon;
  label: string;
  desc: string;
}

const ROW_CLASS =
  "flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition-all hover:ring-primary-300 active:scale-[0.99]";
const ICON_CIRCLE =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold";

function RowInner({ icon: Icon, label, desc }: RowBaseProps) {
  return (
    <>
      <span aria-hidden className={ICON_CIRCLE}>
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-muted-foreground"
        aria-hidden
      />
    </>
  );
}

function LinkRow({
  href,
  ...rest
}: RowBaseProps & { href: string }) {
  return (
    <li>
      <Link href={href} className={ROW_CLASS}>
        <RowInner {...rest} />
      </Link>
    </li>
  );
}

function ActionRow({
  onClick,
  ...rest
}: RowBaseProps & { onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className={ROW_CLASS}>
        <RowInner {...rest} />
      </button>
    </li>
  );
}

function ChoiceCards({
  options,
  onSelect,
}: {
  options: ChoiceOption[];
  onSelect: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(({ href, icon: Icon, label, desc }) => (
        <Link
          key={href}
          href={href}
          onClick={onSelect}
          className={cn(
            "flex flex-col items-center gap-3 rounded-2xl bg-surface px-4 py-6 text-center ring-1 ring-border transition-all",
            "hover:ring-primary-300 active:scale-[0.97]",
          )}
        >
          <span
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
          >
            <Icon size={26} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {desc}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
