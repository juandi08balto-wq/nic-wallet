import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Balance } from "@/types/db";

// Permissive UUID format check: 8-4-4-4-12 hex.
// We deliberately do NOT use `z.uuid()` / `z.string().uuid()` — zod v4
// validates the version nibble strictly and rejects the static demo UUIDs
// in 0002_demo_data.sql (e.g. 11111111-1111-1111-1111-111111111111),
// which the contact picker hands us.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Body = z.object({
  recipientId: z.string().regex(UUID_RE),
  amount: z.number().positive().max(1_000_000),
  currency: z.enum(["USD", "NIO"]),
  message: z.string().max(80).nullable().optional(),
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

  const { recipientId, amount, currency, message } = parsed.data;

  if (recipientId === user.id) {
    return NextResponse.json(
      { error: "cannot_send_to_self" },
      { status: 400 },
    );
  }

  const { data: recipientRow } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", recipientId)
    .maybeSingle();
  if (!recipientRow) {
    return NextResponse.json(
      { error: "recipient_not_found" },
      { status: 404 },
    );
  }

  const { data: balanceRow } = await supabase
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", currency)
    .maybeSingle();
  const balance = balanceRow as Pick<Balance, "amount"> | null;
  if (!balance) {
    return NextResponse.json({ error: "no_balance" }, { status: 400 });
  }
  if (Number(balance.amount) < amount) {
    return NextResponse.json(
      { error: "insufficient_funds" },
      { status: 400 },
    );
  }

  const trimmedMessage = message?.trim() || null;

  const { data: insertedRow, error: insertErr } = await supabase
    .from("transactions")
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      type: "send",
      amount,
      currency,
      message: trimmedMessage,
      status: "completed",
    })
    .select(
      "*, sender:sender_id(name, wallet_tag, avatar_url), recipient:recipient_id(name, wallet_tag, avatar_url)",
    )
    .single();

  if (insertErr || !insertedRow) {
    console.error("[send] insert failed:", insertErr);
    return NextResponse.json(
      { error: "insert_failed", message: insertErr?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, transaction: insertedRow });
}
