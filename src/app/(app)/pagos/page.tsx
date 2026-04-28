import Link from "next/link";
import {
  ArrowDownToLine,
  Banknote,
  ChevronRight,
  QrCode,
  Receipt,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";

interface MenuItem {
  href: string;
  icon: LucideIcon;
  label: string;
  desc: string;
}

const ITEMS: MenuItem[] = [
  {
    href: "/depositar",
    icon: ArrowDownToLine,
    label: "Depositar efectivo",
    desc: "En tiendas asociadas",
  },
  {
    href: "/retirar",
    icon: Banknote,
    label: "Retirar efectivo",
    desc: "Retirá tu saldo en efectivo",
  },
  {
    href: "/pagar",
    icon: QrCode,
    label: "Pagar con QR",
    desc: "Escaneá o mostrá tu código",
  },
  {
    href: "/facturas",
    icon: Receipt,
    label: "Facturas",
    desc: "Pagá luz, agua, internet",
  },
  {
    href: "/recargar",
    icon: Smartphone,
    label: "Recargar saldo",
    desc: "Tu celular o el de otros",
  },
];

export default function PagosPage() {
  return (
    <>
      <Header title="Pagos" />
      <ul className="flex flex-col gap-2 px-4 py-4">
        {ITEMS.map(({ href, icon: Icon, label, desc }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border transition-colors hover:ring-primary-300"
            >
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700/10 text-primary-700 dark:bg-gold/15 dark:text-gold"
              >
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
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
