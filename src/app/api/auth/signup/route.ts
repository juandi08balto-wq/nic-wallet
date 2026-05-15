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

// Spanish user-facing message for every error code we return. The client
// should display `userMessage` directly without code-to-string mapping.
const ERROR_MESSAGES = {
  invalid_json: "Datos inválidos. Volvé a empezar el registro.",
  invalid_input: "Algunos datos no son válidos. Revisá e intentá de nuevo.",
  service_role_missing:
    "Error de configuración del servidor. Contactá soporte.",
  already_exists: "Ya existe una cuenta con ese número. Iniciá sesión.",
  phone_in_use: "Ese número ya está vinculado a otra cuenta.",
  auth_failed:
    "No pudimos crear la cuenta de autenticación. Intentá de nuevo en unos minutos.",
  profile_failed: "No pudimos guardar tu perfil. Intentá de nuevo.",
  balance_failed:
    "Tu cuenta se creó pero falló la inicialización de saldo. Iniciá sesión y contactá soporte.",
} as const;

type ErrorCode = keyof typeof ERROR_MESSAGES;

function errorResponse(
  code: ErrorCode,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      error: code,
      userMessage: ERROR_MESSAGES[code],
      ...(extra ?? {}),
    },
    { status },
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (e) {
    console.error("[signup] invalid JSON body:", e);
    return errorResponse("invalid_json", 400);
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    console.error("[signup] invalid_input issues:", issues);
    return NextResponse.json(
      {
        error: "invalid_input",
        userMessage: ERROR_MESSAGES.invalid_input,
        issues,
      },
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
  } catch (e) {
    console.error(
      "[signup] service_role_missing — createAdminClient threw:",
      e,
    );
    return errorResponse("service_role_missing", 500);
  }

  // ─── Step 1: create auth user ───────────────────────────────────────
  let userId: string;
  try {
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone: e164, display_name: name },
      });

    if (authError || !authData?.user) {
      const status = (authError as { status?: number } | null)?.status;
      const code = (authError as { code?: string } | null)?.code;
      console.error("[signup] auth.createUser failed:", {
        message: authError?.message,
        status,
        code,
        name: authError?.name,
        email,
      });
      const msg = authError?.message?.toLowerCase() ?? "";
      if (
        msg.includes("already") ||
        msg.includes("duplicate") ||
        msg.includes("registered") ||
        msg.includes("exists") ||
        code === "email_exists" ||
        code === "user_already_exists" ||
        status === 422 ||
        status === 409
      ) {
        return errorResponse("already_exists", 409, {
          debug: { message: authError?.message, status, code },
        });
      }
      return errorResponse("auth_failed", 500, {
        debug: { message: authError?.message, status, code },
      });
    }
    userId = authData.user.id;
    console.log("[signup] auth user created:", userId);
  } catch (e) {
    console.error("[signup] auth.createUser threw:", e);
    return errorResponse("auth_failed", 500, {
      debug: { message: e instanceof Error ? e.message : String(e) },
    });
  }

  // ─── Step 2: pick a unique wallet_tag ───────────────────────────────
  const baseTag = nameToWalletTag(name) || "user";
  let walletTag = baseTag;
  try {
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await admin
        .from("profiles")
        .select("id")
        .eq("wallet_tag", walletTag)
        .maybeSingle();
      if (!clash) break;
      walletTag = `${baseTag}${Math.floor(Math.random() * 1000)}`;
    }
  } catch (e) {
    console.error("[signup] wallet_tag lookup threw:", e);
    // Non-fatal — continue with the best attempt.
  }

  // ─── Step 3: insert profile row ─────────────────────────────────────
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
    const pgCode = (profileError as { code?: string }).code;
    const pgDetails = (profileError as { details?: string }).details;
    const pgHint = (profileError as { hint?: string }).hint;
    console.error("[signup] profile insert failed:", {
      message: profileError.message,
      code: pgCode,
      details: pgDetails,
      hint: pgHint,
      userId,
      phone: e164,
      walletTag,
    });

    // Best-effort cleanup of the orphaned auth.users row.
    await admin.auth.admin
      .deleteUser(userId)
      .catch((e) =>
        console.error("[signup] cleanup deleteUser failed:", e),
      );

    const msg = profileError.message?.toLowerCase() ?? "";
    // Postgres unique violation = 23505. Most likely the phone unique
    // constraint (phone column has UNIQUE), occasionally wallet_tag.
    if (
      pgCode === "23505" ||
      msg.includes("phone") ||
      msg.includes("duplicate")
    ) {
      return errorResponse("phone_in_use", 409, {
        debug: { message: profileError.message, code: pgCode },
      });
    }
    return errorResponse("profile_failed", 500, {
      debug: {
        message: profileError.message,
        code: pgCode,
        details: pgDetails,
        hint: pgHint,
      },
    });
  }
  console.log("[signup] profile inserted:", userId);

  // ─── Step 4: insert balances ────────────────────────────────────────
  const { error: balanceError } = await admin.from("balances").insert([
    { user_id: userId, currency: "USD", amount: 0 },
    { user_id: userId, currency: "NIO", amount: 0 },
  ]);

  if (balanceError) {
    console.error("[signup] balance insert failed:", {
      message: balanceError.message,
      code: (balanceError as { code?: string }).code,
      details: (balanceError as { details?: string }).details,
      userId,
    });
    return errorResponse("balance_failed", 500, {
      debug: { message: balanceError.message },
    });
  }
  console.log("[signup] balances inserted, signup complete:", userId);

  return NextResponse.json({ success: true, userId, walletTag, accountType });
}
