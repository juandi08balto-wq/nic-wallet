import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { convert } from "@/lib/currency";
import type { Balance } from "@/types/db";

const Body = z.object({
  amount: z.number().positive().max(1_000_000),
  fromCurrency: z.enum(["USD", "NIO"]),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { amount, fromCurrency } = parsed.data;
  const toCurrency = fromCurrency === "USD" ? "NIO" : "USD";
  const converted = convert(amount, fromCurrency, toCurrency);

  const { data: srcRow, error: srcErr } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", fromCurrency)
    .single();

  const src = srcRow as Pick<Balance, "amount"> | null;
  if (srcErr || !src) {
    return NextResponse.json({ error: "no_source_balance" }, { status: 400 });
  }
  const srcAmount = Number(src.amount);
  if (srcAmount < amount) {
    return NextResponse.json(
      { error: "insufficient_funds" },
      { status: 400 },
    );
  }

  const { error: debitErr } = await supabase
    .from("balances")
    .update({ amount: round2(srcAmount - amount) })
    .eq("user_id", user.id)
    .eq("currency", fromCurrency);
  if (debitErr) {
    return NextResponse.json({ error: "debit_failed" }, { status: 500 });
  }

  const { data: dstRow } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", toCurrency)
    .single();
  const dstAmount = Number((dstRow as Pick<Balance, "amount"> | null)?.amount ?? 0);

  const { error: creditErr } = await supabase
    .from("balances")
    .update({ amount: round2(dstAmount + converted) })
    .eq("user_id", user.id)
    .eq("currency", toCurrency);
  if (creditErr) {
    // Best-effort rollback of the debit.
    await supabase
      .from("balances")
      .update({ amount: srcAmount })
      .eq("user_id", user.id)
      .eq("currency", fromCurrency);
    return NextResponse.json({ error: "credit_failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    amount,
    converted,
    fromCurrency,
    toCurrency,
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
