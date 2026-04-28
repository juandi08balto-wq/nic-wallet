import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Balance, LinkedCard } from "@/types/db";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Body = z.object({
  cardId: z.string().regex(UUID_RE),
  amount: z.number().positive().max(1_000_000),
});

const MIN_USD = 5;

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

  const { cardId, amount } = parsed.data;
  if (amount < MIN_USD) {
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

  // Verify the card belongs to this user
  const { data: cardRow } = await admin
    .from("linked_cards")
    .select("id, last_four, card_type, nickname")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .maybeSingle();
  const card = cardRow as Pick<LinkedCard, "id" | "last_four" | "card_type" | "nickname"> | null;
  if (!card) {
    return NextResponse.json({ error: "card_not_found" }, { status: 404 });
  }
  const cardLabel = `${formatCardType(card.card_type)} •••• ${card.last_four}`;

  // 1. Insert pending tx (trigger does not fire)
  const { data: pendingRow, error: pendingErr } = await admin
    .from("transactions")
    .insert({
      sender_id: null,
      recipient_id: user.id,
      merchant_name: cardLabel,
      type: "card_deposit",
      amount,
      currency: "USD",
      message: card.nickname ?? null,
      status: "pending",
      metadata: {
        card_id: cardId,
        card_type: card.card_type,
        last_four: card.last_four,
      },
    })
    .select("id")
    .single();
  if (pendingErr || !pendingRow) {
    console.error("[card-deposit] pending insert failed:", pendingErr);
    return NextResponse.json(
      { error: "insert_failed", message: pendingErr?.message },
      { status: 500 },
    );
  }
  const pendingId = (pendingRow as { id: string }).id;

  // 2. Direct credit of USD balance
  const { data: balanceRow } = await admin
    .from("balances")
    .select("amount")
    .eq("user_id", user.id)
    .eq("currency", "USD")
    .maybeSingle();
  const current = Number(
    (balanceRow as Pick<Balance, "amount"> | null)?.amount ?? 0,
  );

  const { error: creditErr } = await admin
    .from("balances")
    .update({ amount: round2(current + amount) })
    .eq("user_id", user.id)
    .eq("currency", "USD");
  if (creditErr) {
    console.error("[card-deposit] credit failed:", creditErr);
    await admin.from("transactions").delete().eq("id", pendingId);
    return NextResponse.json({ error: "credit_failed" }, { status: 500 });
  }

  // 3. Mark complete
  const { data: completedRow, error: completeErr } = await admin
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", pendingId)
    .select(
      "*, sender:sender_id(name, wallet_tag, avatar_url), recipient:recipient_id(name, wallet_tag, avatar_url)",
    )
    .single();
  if (completeErr || !completedRow) {
    console.error("[card-deposit] complete failed:", completeErr);
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

function formatCardType(t: LinkedCard["card_type"]): string {
  switch (t) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "Amex";
    default:
      return "Tarjeta";
  }
}
