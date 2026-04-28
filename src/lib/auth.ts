// Auth identifier synthesis. Users sign up with phone + 4-digit PIN; we
// translate that into a Supabase email/password pair behind the scenes so
// the user never sees an email.
//
// IMPORTANT: pinToPassword must be deterministic — it's the only way
// signInWithPassword can authenticate a user from PIN alone.

const PHONE_DIGITS_RE = /\D/g;

/** Strip any non-digit characters. */
export function digitsOnly(input: string): string {
  return input.replace(PHONE_DIGITS_RE, "");
}

/** Normalize any user-entered Nicaraguan phone to "505XXXXXXXX" digits. */
export function toNicaraguanE164(input: string): string {
  const digits = digitsOnly(input);
  if (digits.startsWith("505")) return digits;
  return `505${digits}`;
}

/** Format any user-entered phone as "+505 XXXX XXXX" for display. */
export function formatNicaraguanPhone(input: string): string {
  const digits = digitsOnly(input);
  const local = digits.startsWith("505") ? digits.slice(3) : digits;
  const truncated = local.slice(0, 8);
  if (truncated.length === 0) return "+505 ";
  if (truncated.length <= 4) return `+505 ${truncated}`;
  return `+505 ${truncated.slice(0, 4)} ${truncated.slice(4)}`;
}

/** Synthesized email used for Supabase auth. Stable per phone number. */
export function phoneToEmail(phone: string): string {
  return `${toNicaraguanE164(phone)}@nicwallet.demo`;
}

/**
 * Derive a Supabase password from the 4-digit PIN. Padded to satisfy
 * Supabase's 6-char minimum. Deterministic so signIn can re-derive it.
 */
export function pinToPassword(pin: string): string {
  return `nic-wallet-pin-${pin}-2026`;
}

/** "Juan Pérez" -> "juanperez" (first letters of first 16 chars). */
export function nameToWalletTag(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 16);
}
