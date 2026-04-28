import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DepositFlow } from "./DepositFlow";

export const dynamic = "force-dynamic";

export default async function DepositarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  return <DepositFlow userId={user.id} />;
}
