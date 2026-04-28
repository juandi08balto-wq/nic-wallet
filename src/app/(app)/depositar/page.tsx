import { redirect } from "next/navigation";

// Default deposit landing redirects to the cash flow. Choose card vs cash
// from the Servicios menu.
export default function DepositarRoot() {
  redirect("/depositar/efectivo");
}
