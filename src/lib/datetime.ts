// Spanish-first relative date formatting for the activity feed.

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  day: "numeric",
  month: "short",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Returns "Hoy", "Ayer", or "12 abr". */
export function formatTxDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (dayKey(d) === dayKey(now)) return "Hoy";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(yesterday)) return "Ayer";
  return MONTH_FORMATTER.format(d);
}

/** Hour:minute in es-NI (e.g. "3:42 p.m."). */
export function formatTxTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso));
}
