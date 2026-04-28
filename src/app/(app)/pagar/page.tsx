import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PagarContent } from "./PagarContent";
import type { Balance, Profile } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function PagarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const [profileRes, balancesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("balances").select("*").eq("user_id", user.id),
  ]);

  const profile = profileRes.data as Profile | null;
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/ingresar");
  }

  const balances = (balancesRes.data ?? []) as Balance[];

  return <PagarContent profile={profile} balances={balances} />;
}
