// Web Audio API success chime — no bundled audio asset.

let cachedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (cachedCtx) return cachedCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  cachedCtx = new Ctor();
  return cachedCtx;
}

interface ChimeOptions {
  /** Notes in Hz, played in sequence. */
  notes?: number[];
  /** Duration of each note in seconds. */
  noteDuration?: number;
  /** Peak gain (0–1). */
  gain?: number;
}

export function playSuccess(options: ChimeOptions = {}) {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = options.notes ?? [880, 1175, 1568]; // A5, D6, G6 — bright, premium
  const noteDuration = options.noteDuration ?? 0.14;
  const gain = options.gain ?? 0.18;

  const start = ctx.currentTime;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(ctx.destination);

    const t0 = start + i * noteDuration * 0.85;
    const t1 = t0 + noteDuration;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t1);

    osc.start(t0);
    osc.stop(t1 + 0.02);
  });
}

export function playError() {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
  g.gain.setValueAtTime(0.18, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.32);
}
