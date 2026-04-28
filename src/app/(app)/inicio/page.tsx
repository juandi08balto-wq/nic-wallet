import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeContent } from "./HomeContent";
import type {
  Balance,
  Profile,
  TransactionWithParties,
} from "@/types/db";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const [profileRes, balancesRes, transactionsRes, unreadRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("balances")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("transactions")
      .select(
        "*, sender:sender_id(name, wallet_tag, avatar_url), recipient:recipient_id(name, wallet_tag, avatar_url)",
      )
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
  ]);

  const profile = profileRes.data as Profile | null;
  if (!profile) {
    // Auth user without a profile row — sign out and start over.
    await supabase.auth.signOut();
    redirect("/ingresar");
  }

  const balances = (balancesRes.data ?? []) as Balance[];
  const transactions = (transactionsRes.data ?? []) as TransactionWithParties[];
  const unreadCount = unreadRes.count ?? 0;

  return (
    <HomeContent
      userId={user.id}
      profile={profile}
      balances={balances}
      transactions={transactions}
      unreadCount={unreadCount}
    />
  );
}
