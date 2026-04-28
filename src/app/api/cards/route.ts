import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  number: z.string().regex(/^\d{16}$/),
  expiry: z.string().regex(/^\d{4}$/),
  cvv: z.string().regex(/^\d{3}$/),
  nickname: z.string().trim().max(30).nullable().optional(),
});

function detectCardType(number: string): "visa" | "mastercard" | "amex" | "other" {
  const first = number.charAt(0);
  if (first === "4") return "visa";
  if (first === "5") return "mastercard";
  if (first === "3") return "amex";
  return "other";
}

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

  const { number, nickname } = parsed.data;
  const lastFour = number.slice(-4);
  const cardType = detectCardType(number);

  const { error } = await supabase.from("linked_cards").insert({
    user_id: user.id,
    last_four: lastFour,
    card_type: cardType,
    nickname: nickname ?? null,
    is_default: false,
  });

  if (error) {
    console.error("[cards] insert failed:", error);
    return NextResponse.json(
      { error: "insert_failed", message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
