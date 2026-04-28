import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardWithdrawFlow } from "./CardWithdrawFlow";
import type { Balance, LinkedCard } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function RetirarTarjetaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const [cardsRes, balancesRes] = await Promise.all([
    supabase
      .from("linked_cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("balances").select("*").eq("user_id", user.id),
  ]);
  const cards = (cardsRes.data ?? []) as LinkedCard[];
  const balances = (balancesRes.data ?? []) as Balance[];

  return (
    <CardWithdrawFlow
      userId={user.id}
      initialCards={cards}
      balances={balances}
    />
  );
}
