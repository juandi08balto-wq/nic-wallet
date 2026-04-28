import {
  Building2,
  ShoppingBasket,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";

export interface PartnerStore {
  id: string;
  name: string;
  area: string;
  icon: LucideIcon;
}

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: "super-express",
    name: "Super Express",
    area: "Múltiples ubicaciones",
    icon: Store,
  },
  {
    id: "pali",
    name: "Pali",
    area: "Bello Horizonte, Linda Vista, etc.",
    icon: ShoppingCart,
  },
  {
    id: "la-colonia",
    name: "La Colonia",
    area: "Las Sierritas, Carretera Masaya",
    icon: ShoppingBasket,
  },
  {
    id: "walmart",
    name: "Walmart",
    area: "Managua",
    icon: Building2,
  },
  {
    id: "maxi-pali",
    name: "Maxi Pali",
    area: "Múltiples ubicaciones",
    icon: ShoppingCart,
  },
];
