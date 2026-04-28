import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReceiveContent } from "./ReceiveContent";
import type { Profile } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function RecibirPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileRow as Profile | null;
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/ingresar");
  }

  return <ReceiveContent profile={profile} />;
}
