import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardDepositFlow } from "./CardDepositFlow";
import type { LinkedCard } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function DepositarTarjetaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: cardsRows } = await supabase
    .from("linked_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const cards = (cardsRows ?? []) as LinkedCard[];

  return <CardDepositFlow userId={user.id} initialCards={cards} />;
}
