import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { USD_TO_NIO } from "@/lib/currency";
import type { Balance } from "@/types/db";

// Public endpoint — no auth. /sender flow simulates a remitter in the US
// sending USD to a Nicaraguan profile. We persist the transaction in NIO
// (córdobas) at the fixed demo rate. Bypasses the apply_transaction
// trigger so we can inject a custom recipient notification with the
// US flag emoji.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Body = z.object({
  recipientId: z.string().regex(UUID_RE),
  usdAmount: z.number().positive().max(100_000),
  senderName: z.string().trim().min(2).max(60),
  paymentMethod: z.enum(["ach", "card", "cash"]),
});

const MIN_USD = 10;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatUsdForNotification(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function POST(req: Request) {
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

  const { recipientId, usdAmount, senderName, paymentMethod } = parsed.data;
  if (usdAmount < MIN_USD) {
    return NextResponse.json(
      { error: "below_minimum", minimum: MIN_USD },
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

  const { data: profileRow } = await admin
    .from("profiles")
    .select("id")
    .eq("id", recipientId)
    .maybeSingle();
  if (!profileRow) {
    return NextResponse.json(
      { error: "recipient_not_found" },
      { status: 404 },
    );
  }

  const nioAmount = round2(usdAmount * USD_TO_NIO);

  // Insert pending tx (trigger does not fire on non-completed inserts)
  const { data: pendingRow, error: pendingErr } = await admin
    .from("transactions")
    .insert({
      sender_id: null,
      recipient_id: recipientId,
      merchant_name: senderName,
      type: "remittance",
      amount: nioAmount,
      currency: "NIO",
      message: null,
      status: "pending",
      metadata: {
        usd_amount: usdAmount,
        exchange_rate: USD_TO_NIO,
        payment_method: paymentMethod,
        sender_name: senderName,
      },
    })
    .select("id")
    .single();
  if (pendingErr || !pendingRow) {
    console.error("[remittance] pending insert failed:", pendingErr);
    return NextResponse.json(
      { error: "insert_failed", message: pendingErr?.message },
      { status: 500 },
    );
  }
  const pendingId = (pendingRow as { id: string }).id;

  // Direct credit of recipient's NIO balance
  const { data: balanceRow } = await admin
    .from("balances")
    .select("amount")
    .eq("user_id", recipientId)
    .eq("currency", "NIO")
    .maybeSingle();
  const current = Number(
    (balanceRow as Pick<Balance, "amount"> | null)?.amount ?? 0,
  );

  const { error: creditErr } = await admin
    .from("balances")
    .update({ amount: round2(current + nioAmount) })
    .eq("user_id", recipientId)
    .eq("currency", "NIO");
  if (creditErr) {
    console.error("[remittance] credit failed, rolling back:", creditErr);
    await admin.from("transactions").delete().eq("id", pendingId);
    return NextResponse.json({ error: "credit_failed" }, { status: 500 });
  }

  // Mark transaction completed and embed sender/recipient for response
  const { data: completedRow, error: completeErr } = await admin
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", pendingId)
    .select(
      "*, sender:sender_id(name, wallet_tag, avatar_url), recipient:recipient_id(name, wallet_tag, avatar_url)",
    )
    .single();
  if (completeErr || !completedRow) {
    console.error("[remittance] complete update failed:", completeErr);
    return NextResponse.json(
      { error: "complete_failed", message: completeErr?.message },
      { status: 500 },
    );
  }

  // Custom notification with US flag, overriding the default trigger one.
  const { error: notifErr } = await admin.from("notifications").insert({
    user_id: recipientId,
    type: "remittance",
    title: "Recibiste una remesa",
    message: `Recibiste $${formatUsdForNotification(usdAmount)} de ${senderName} 🇺🇸`,
    read: false,
  });
  if (notifErr) {
    // Non-fatal — the transaction is already complete.
    console.error("[remittance] notification insert failed:", notifErr);
  }

  return NextResponse.json({ success: true, transaction: completedRow });
}
