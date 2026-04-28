import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Balance } from "@/types/db";

const Body = z.object({
  carrierName: z.string().trim().min(1).max(40),
  phoneNumber: z.string().trim().min(8).max(20),
  amount: z.number().positive().max(1_000_000),
});

const MIN_NIO = 20;

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

  const { carrierName, phoneNumber, amount } = parsed.data;
  if (amount < MIN_NIO) {
    return NextResponse.json(
      { error: "below_minimum", minimum: MIN_NIO },
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

  const { data: balanceRow } = await admin
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", "NIO")
    .maybeSingle();
  const balance = balanceRow as Pick<Balance, "amount"> | null;
  if (!balance) {
    return NextResponse.json({ error: "no_balance" }, { status: 400 });
  }
  const current = Number(balance.amount);
  if (current < amount) {
    return NextResponse.json(
      { error: "insufficient_funds" },
      { status: 400 },
    );
  }

  const message = `Número: ${phoneNumber}`;

  const { data: pendingRow, error: pendingErr } = await admin
    .from("transactions")
    .insert({
      sender_id: user.id,
      recipient_id: null,
      merchant_name: carrierName,
      type: "topup",
      amount,
      currency: "NIO",
      message,
      status: "pending",
      metadata: { phone_number: phoneNumber },
    })
    .select("id")
    .single();
  if (pendingErr || !pendingRow) {
    console.error("[topup] pending insert failed:", pendingErr);
    return NextResponse.json(
      { error: "insert_failed", message: pendingErr?.message },
      { status: 500 },
    );
  }
  const pendingId = (pendingRow as { id: string }).id;

  const { error: debitErr } = await admin
    .from("balances")
    .update({ amount: round2(current - amount) })
    .eq("user_id", user.id)
    .eq("currency", "NIO");
  if (debitErr) {
    console.error("[topup] debit failed:", debitErr);
    await admin.from("transactions").delete().eq("id", pendingId);
    return NextResponse.json({ error: "debit_failed" }, { status: 500 });
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
    console.error("[topup] complete failed:", completeErr);
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
