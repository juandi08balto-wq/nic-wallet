import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WithdrawFlow } from "./WithdrawFlow";
import type { Balance } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function RetirarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: balancesRow } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id);
  const balances = (balancesRow ?? []) as Balance[];

  return <WithdrawFlow userId={user.id} balances={balances} />;
}
