import {
  Car,
  Coffee,
  Pill,
  ShoppingBasket,
  ShoppingCart,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export interface DemoMerchant {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
}

export const DEMO_MERCHANTS: DemoMerchant[] = [
  {
    id: "pollo-tip-top",
    name: "Pollo Tip Top",
    category: "Restaurante",
    icon: UtensilsCrossed,
  },
  {
    id: "mercado-oriental-carmen",
    name: "Mercado Oriental — Doña Carmen",
    category: "Mercado",
    icon: ShoppingBasket,
  },
  {
    id: "cafe-las-flores",
    name: "Café Las Flores",
    category: "Café",
    icon: Coffee,
  },
  {
    id: "farmacia-la-economica",
    name: "Farmacia La Económica",
    category: "Farmacia",
    icon: Pill,
  },
  {
    id: "taxi-cooperativa-managua",
    name: "Taxi Cooperativa Managua",
    category: "Transporte",
    icon: Car,
  },
  {
    id: "pali-bello-horizonte",
    name: "Pali Bello Horizonte",
    category: "Supermercado",
    icon: ShoppingCart,
  },
];
