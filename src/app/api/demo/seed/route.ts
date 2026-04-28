import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Balance } from "@/types/db";

const USD_SEED = 100;
const NIO_SEED = 3500;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: rows } = await supabase
    .from("balances")
    .select("currency, amount")
    .eq("user_id", user.id);
  const balances = (rows ?? []) as Pick<Balance, "currency" | "amount">[];

  const usd = balances.find((b) => b.currency === "USD");
  const nio = balances.find((b) => b.currency === "NIO");
  if (!usd || !nio) {
    return NextResponse.json({ error: "no_balances" }, { status: 400 });
  }

  const [usdResult, nioResult] = await Promise.all([
    supabase
      .from("balances")
      .update({ amount: Number(usd.amount) + USD_SEED })
      .eq("user_id", user.id)
      .eq("currency", "USD"),
    supabase
      .from("balances")
      .update({ amount: Number(nio.amount) + NIO_SEED })
      .eq("user_id", user.id)
      .eq("currency", "NIO"),
  ]);
  if (usdResult.error || nioResult.error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    added: { USD: USD_SEED, NIO: NIO_SEED },
  });
}
