/* ─── Shared game sound effects ──────────────────────────────
   Lightweight Web Audio synthesis — no asset files needed.
   Safe to call from any game component; lazily creates a single
   shared AudioContext on first user-gesture-triggered call. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

let muted = false;
export function setSfxMuted(v: boolean) { muted = v; }
export function isSfxMuted() { return muted; }
export function toggleSfx() { muted = !muted; return muted; }

function tone(freq: number, start: number, dur: number, type: OscillatorType, gainPeak: number, c: AudioContext) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function safe(fn: (c: AudioContext) => void) {
  if (muted) return;
  try {
    const c = getCtx();
    if (!c) return;
    fn(c);
  } catch {
    /* ignore — audio is a nice-to-have, never block gameplay */
  }
}

/** Cheerful two-note "ding-ding!" for a correct answer. */
export function playCorrect() {
  safe(c => {
    const t = c.currentTime;
    tone(523.25, t, 0.16, "sine", 0.22, c);      // C5
    tone(783.99, t + 0.1, 0.22, "sine", 0.22, c); // G5
  });
}

/** Gentle low "buzz" for a wrong answer — not harsh, kid-friendly. */
export function playWrong() {
  safe(c => {
    const t = c.currentTime;
    tone(196, t, 0.22, "triangle", 0.18, c); // G3
    tone(174.61, t + 0.1, 0.22, "triangle", 0.14, c); // F3
  });
}

/** Soft click for taps/selections. */
export function playClick() {
  safe(c => {
    tone(880, c.currentTime, 0.05, "sine", 0.08, c);
  });
}

/** Card flip blip (memory game). */
export function playFlip() {
  safe(c => {
    tone(660, c.currentTime, 0.06, "triangle", 0.1, c);
  });
}

/** Bigger ascending arpeggio for level-up / streak / win. */
export function playCelebrate() {
  safe(c => {
    const t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.2, "sine", 0.2, c));
  });
}

/** Quick whoosh for tile swap / piece move. */
export function playSwap() {
  safe(c => {
    const t = c.currentTime;
    tone(300, t, 0.08, "sine", 0.12, c);
    tone(420, t + 0.05, 0.08, "sine", 0.1, c);
  });
}
