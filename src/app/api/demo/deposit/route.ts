import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Balance } from "@/types/db";

// Cash deposit at a partner store. Bypasses the apply_transaction trigger
// the same way merchant-pay does: insert pending → manual UPDATE balance →
// UPDATE tx to completed.

const Body = z.object({
  amount: z.number().positive().max(1_000_000),
  currency: z.enum(["USD", "NIO"]),
  storeName: z.string().trim().min(1).max(80),
  code: z.string().trim().min(1).max(40),
});

const MIN_AMOUNT: Record<"USD" | "NIO", number> = { USD: 5, NIO: 100 };

export async function POST(req: Request) {
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

  const { amount, currency, storeName, code } = parsed.data;
  if (amount < MIN_AMOUNT[currency]) {
    return NextResponse.json(
      { error: "below_minimum", minimum: MIN_AMOUNT[currency] },
      { status: 400 },
    );
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "service_role_missing" },
      { status: 500 },
    );
  }

  // Insert pending tx (trigger does not fire on non-completed inserts)
  const { data: pendingRow, error: pendingErr } = await admin
    .from("transactions")
    .insert({
      sender_id: null,
      recipient_id: user.id,
      merchant_name: storeName,
      type: "deposit",
      amount,
      currency,
      message: null,
      status: "pending",
      metadata: { code },
    })
    .select("id")
    .single();
  if (pendingErr || !pendingRow) {
    console.error("[deposit] pending insert failed:", pendingErr);
    return NextResponse.json(
      { error: "insert_failed", message: pendingErr?.message },
      { status: 500 },
    );
  }
  const pendingId = (pendingRow as { id: string }).id;

  // Direct credit to user's balance
  const { data: balanceRow } = await admin
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", currency)
    .maybeSingle();
  const current = Number(
    (balanceRow as Pick<Balance, "amount"> | null)?.amount ?? 0,
  );

  const { error: creditErr } = await admin
    .from("balances")
    .update({ amount: round2(current + amount) })
    .eq("user_id", user.id)
    .eq("currency", currency);
  if (creditErr) {
    console.error("[deposit] credit failed, rolling back:", creditErr);
    await admin.from("transactions").delete().eq("id", pendingId);
    return NextResponse.json({ error: "credit_failed" }, { status: 500 });
  }

  const { data: completedRow, error: completeErr } = await admin
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", pendingId)
    .select(
      "*, sender:sender_id(name, wallet_tag, avatar_url), recipient:recipient_id(name, wallet_tag, avatar_url)",
    )
    .single();
  if (completeErr || !completedRow) {
    console.error("[deposit] complete update failed:", completeErr);
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
