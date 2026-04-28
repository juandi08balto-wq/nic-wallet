import {
  Droplet,
  Tv,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface BillProvider {
  id: string;
  name: string;
  category: string;
  accountLabel: string;
  icon: LucideIcon;
}

export const BILL_PROVIDERS: BillProvider[] = [
  {
    id: "disnorte",
    name: "Disnorte",
    category: "Electricidad — Norte",
    accountLabel: "NIS o número de medidor",
    icon: Zap,
  },
  {
    id: "dissur",
    name: "Dissur",
    category: "Electricidad — Sur",
    accountLabel: "NIS o número de medidor",
    icon: Zap,
  },
  {
    id: "enacal",
    name: "ENACAL",
    category: "Agua",
    accountLabel: "Número de cuenta",
    icon: Droplet,
  },
  {
    id: "claro",
    name: "Claro",
    category: "Internet / Cable",
    accountLabel: "Número de contrato",
    icon: Wifi,
  },
  {
    id: "tigo",
    name: "Tigo",
    category: "Internet / Cable",
    accountLabel: "Número de contrato",
    icon: Wifi,
  },
  {
    id: "cablenet",
    name: "Cablenet",
    category: "Cable",
    accountLabel: "Número de cuenta",
    icon: Tv,
  },
  {
    id: "ibw",
    name: "IBW",
    category: "Internet",
    accountLabel: "Número de contrato",
    icon: Wifi,
  },
];
