import { redirect } from "next/navigation";

// Default withdraw landing redirects to the cash flow. Choose card vs cash
// from the Servicios menu.
export default function RetirarRoot() {
  redirect("/retirar/efectivo");
}
