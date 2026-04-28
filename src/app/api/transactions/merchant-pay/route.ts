import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Balance } from "@/types/db";

// Merchant payment intentionally bypasses the apply_transaction trigger.
// Steps:
//   1. Pre-flight balance check (admin scope, but only for the auth'd user)
//   2. Insert transaction with status='pending' (trigger only fires on
//      INSERTs WHERE NEW.status='completed')
//   3. Direct UPDATE on the user's balance to debit
//   4. UPDATE the pending transaction to status='completed' — this UPDATE
//      does NOT fire the trigger (it's AFTER INSERT only)
// Done with admin client so RLS doesn't block the multi-step flow.

const Body = z.object({
  merchantName: z.string().trim().min(1).max(80),
  amount: z.number().positive().max(1_000_000),
  currency: z.enum(["USD", "NIO"]),
  message: z.string().max(80).nullable().optional(),
});

export async function POST(req: Request) {
  // Auth check via the user-scoped client (reads cookies).
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
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
    return NextResponse.json(
      {
        error: "invalid_input",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const { merchantName, amount, currency, message } = parsed.data;
  const trimmedMessage = message?.trim() || null;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "service_role_missing" },
      { status: 500 },
    );
  }

  // 1. Pre-flight balance check
  const { data: balanceRow } = await admin
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", currency)
    .maybeSingle();
  const balance = balanceRow as Pick<Balance, "amount"> | null;
  if (!balance) {
    return NextResponse.json({ error: "no_balance" }, { status: 400 });
  }
  const currentAmount = Number(balance.amount);
  if (currentAmount < amount) {
    return NextResponse.json(
      { error: "insufficient_funds" },
      { status: 400 },
    );
  }

  // 2. Insert transaction as pending (trigger does not fire)
  const { data: pendingRow, error: pendingErr } = await admin
    .from("transactions")
    .insert({
      sender_id: user.id,
      recipient_id: null,
      merchant_name: merchantName,
      type: "merchant",
      amount,
      currency,
      message: trimmedMessage,
      status: "pending",
    })
    .select("id")
    .single();
  if (pendingErr || !pendingRow) {
    console.error("[merchant-pay] pending insert failed:", pendingErr);
    return NextResponse.json(
      { error: "insert_failed", message: pendingErr?.message },
      { status: 500 },
    );
  }
  const pendingId = (pendingRow as { id: string }).id;

  // 3. Debit sender's balance directly
  const { error: debitErr } = await admin
    .from("balances")
    .update({ amount: round2(currentAmount - amount) })
    .eq("user_id", user.id)
    .eq("currency", currency);
  if (debitErr) {
    console.error("[merchant-pay] debit failed, rolling back:", debitErr);
    await admin.from("transactions").delete().eq("id", pendingId);
    return NextResponse.json({ error: "debit_failed" }, { status: 500 });
  }

  // 4. Mark transaction completed
  const { data: completedRow, error: completeErr } = await admin
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", pendingId)
    .select(
      "*, sender:sender_id(name, wallet_tag, avatar_url), recipient:recipient_id(name, wallet_tag, avatar_url)",
    )
    .single();
  if (completeErr || !completedRow) {
    console.error("[merchant-pay] complete update failed:", completeErr);
    return NextResponse.json(
      { error: "complete_failed", message: completeErr?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, transaction: completedRow });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
