import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { toNicaraguanE164 } from "@/lib/auth";

// Public endpoint — no auth required. The /sender remittance flow uses
// this to find Nicaraguan profiles by phone number. Uses admin client
// because the profiles RLS only allows authenticated SELECT.

const Body = z.object({
  phone: z.string().min(4),
});

export async function POST(req: Request) {
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

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "service_role_missing" },
      { status: 500 },
    );
  }

  const e164 = toNicaraguanE164(parsed.data.phone);
  const { data: row } = await admin
    .from("profiles")
    .select("id, name, phone")
    .eq("phone", e164)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ found: false });
  }

  const profile = row as { id: string; name: string; phone: string };
  return NextResponse.json({
    found: true,
    profile: {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
    },
  });
}
