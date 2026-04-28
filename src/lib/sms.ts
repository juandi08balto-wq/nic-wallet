// Parser for the SMS-fallback simulator. Real SMS is not sent — the /sms
// page renders fake responses to demonstrate the low-data flow.

export type SmsCommand =
  | { kind: "send"; amount: number; phone: string }
  | { kind: "balance" }
  | { kind: "topup"; amount: number; phone: string }
  | { kind: "unknown"; raw: string };

const SEND_RE = /^ENVIAR\s+(\d+(?:[.,]\d+)?)\s+(\+?\d{6,})$/i;
const BALANCE_RE = /^SALDO$/i;
const TOPUP_RE = /^RECARGAR\s+(\d+(?:[.,]\d+)?)\s+(\+?\d{6,})$/i;

export function parseSms(input: string): SmsCommand {
  const trimmed = input.trim().replace(/\s+/g, " ");
  let m = trimmed.match(SEND_RE);
  if (m) return { kind: "send", amount: parseAmount(m[1]), phone: m[2] };
  if (BALANCE_RE.test(trimmed)) return { kind: "balance" };
  m = trimmed.match(TOPUP_RE);
  if (m) return { kind: "topup", amount: parseAmount(m[1]), phone: m[2] };
  return { kind: "unknown", raw: trimmed };
}

function parseAmount(raw: string): number {
  return Number(raw.replace(",", "."));
}

export const SMS_SHORTCODE = "+505 0092 5538";
