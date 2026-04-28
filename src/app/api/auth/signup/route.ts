import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  nameToWalletTag,
  phoneToEmail,
  pinToPassword,
  toNicaraguanE164,
} from "@/lib/auth";

const Body = z.object({
  phone: z.string().min(8),
  pin: z.string().regex(/^\d{4}$/),
  name: z.string().min(2).max(80),
  cedula: z.string().regex(/^\d{14}$/),
  selfieDataUrl: z.string().nullable().optional(),
  accountType: z.enum(["personal", "negocio"]).default("personal"),
  cedulaFrontUrl: z.string().nullable().optional(),
  cedulaBackUrl: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    phone,
    pin,
    name,
    cedula,
    selfieDataUrl,
    accountType,
    cedulaFrontUrl,
    cedulaBackUrl,
  } = parsed.data;
  const e164 = toNicaraguanE164(phone);
  const email = phoneToEmail(phone);
  const password = pinToPassword(pin);

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "service_role_missing" },
      { status: 500 },
    );
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { phone: e164, display_name: name },
  });

  if (authError || !authData?.user) {
    const msg = authError?.message?.toLowerCase() ?? "";
    if (
      msg.includes("already") ||
      msg.includes("duplicate") ||
      msg.includes("registered")
    ) {
      return NextResponse.json({ error: "already_exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: "auth_failed", message: authError?.message ?? "unknown" },
      { status: 500 },
    );
  }

  const userId = authData.user.id;

  const baseTag = nameToWalletTag(name) || "user";
  let walletTag = baseTag;
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await admin
      .from("profiles")
      .select("id")
      .eq("wallet_tag", walletTag)
      .maybeSingle();
    if (!clash) break;
    walletTag = `${baseTag}${Math.floor(Math.random() * 1000)}`;
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    name,
    phone: e164,
    cedula,
    pin,
    wallet_tag: walletTag,
    selfie_url: selfieDataUrl ?? null,
    low_data_mode: false,
    account_type: accountType,
    cedula_front_url: cedulaFrontUrl ?? null,
    cedula_back_url: cedulaBackUrl ?? null,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    if (profileError.message?.toLowerCase().includes("phone")) {
      return NextResponse.json({ error: "phone_in_use" }, { status: 409 });
    }
    return NextResponse.json(
      { error: "profile_failed", message: profileError.message },
      { status: 500 },
    );
  }

  const { error: balanceError } = await admin.from("balances").insert([
    { user_id: userId, currency: "USD", amount: 0 },
    { user_id: userId, currency: "NIO", amount: 0 },
  ]);

  if (balanceError) {
    return NextResponse.json(
      { error: "balance_failed", message: balanceError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, userId, walletTag, accountType });
}
