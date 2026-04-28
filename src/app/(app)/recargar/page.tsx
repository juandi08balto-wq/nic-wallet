import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopupFlow } from "./TopupFlow";
import type { Balance } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function RecargarPage() {
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

  return <TopupFlow userId={user.id} balances={balances} />;
}
