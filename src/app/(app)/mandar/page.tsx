import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SendFlow, type SendContact } from "./SendFlow";
import type { Balance } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function MandarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const [profilesRes, balancesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, phone, wallet_tag")
      .neq("id", user.id)
      .order("name"),
    supabase
      .from("balances")
      .select("*")
      .eq("user_id", user.id),
  ]);

  const contacts = (profilesRes.data ?? []) as SendContact[];
  const balances = (balancesRes.data ?? []) as Balance[];

  return (
    <SendFlow
      userId={user.id}
      contacts={contacts}
      balances={balances}
    />
  );
}
