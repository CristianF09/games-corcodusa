/**
 * No-repeat exercise dealing, like a shuffled deck of cards.
 *
 * Quiz/math games used to draw each round independently at random, which
 * produced rushed near-duplicates ("3+1" immediately followed by "1+3") and
 * left parts of the exercise space never seen. A Deck builds the FULL
 * exercise space once, shuffles it, and deals one item at a time; only when
 * every exercise has been dealt does it reshuffle — so all numbers get used
 * and nothing repeats until the whole space is exhausted.
 */

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class Deck<T> {
  private items: T[] = [];
  constructor(private build: () => T[]) {}

  next(): T {
    if (this.items.length === 0) this.items = shuffle(this.build());
    return this.items.pop()!;
  }

  reset() {
    this.items = [];
  }
}

/** One deck per key (e.g. per level or per category), lazily created. */
export class DeckMap<T> {
  private decks = new Map<string, Deck<T>>();
  constructor(private build: (key: string) => T[]) {}

  next(key: string): T {
    let deck = this.decks.get(key);
    if (!deck) {
      deck = new Deck(() => this.build(key));
      this.decks.set(key, deck);
    }
    return deck.next();
  }
}

/* ─── Math exercise spaces ───────────────────────────────── */

export type MathEx = { a: number; b: number; op: "+" | "−" | "×" | "÷"; answer: number };

/** All additions with sum ≤ max. Commutative twins (1+3 / 3+1) count as ONE
 *  exercise; orientation is randomized when dealt so both forms still appear,
 *  just never as back-to-back near-duplicates. */
export function additionSpace(max: number): MathEx[] {
  const out: MathEx[] = [];
  for (let a = 1; a <= max - 1; a++)
    for (let b = a; b <= max - a; b++)
      out.push({ a, b, op: "+", answer: a + b });
  return out;
}

/** All subtractions a − b with a ≤ max, positive result. */
export function subtractionSpace(max: number): MathEx[] {
  const out: MathEx[] = [];
  for (let a = 2; a <= max; a++)
    for (let b = 1; b < a; b++)
      out.push({ a, b, op: "−", answer: a - b });
  return out;
}

/** Times tables 2–5 × 1–max, commutative-deduped. */
export function multiplicationSpace(max: number): MathEx[] {
  const out: MathEx[] = [];
  const seen = new Set<string>();
  for (let a = 2; a <= 5; a++)
    for (let b = 1; b <= max; b++) {
      const key = `${Math.min(a, b)}x${Math.max(a, b)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ a, b, op: "×", answer: a * b });
    }
  return out;
}

/** All exact divisions (b·q) ÷ b with divisor 2–5 and quotient 1–max. */
export function divisionSpace(max: number): MathEx[] {
  const out: MathEx[] = [];
  for (let b = 2; b <= 5; b++)
    for (let q = 1; q <= max; q++)
      out.push({ a: b * q, b, op: "÷", answer: q });
  return out;
}

/** Randomly swap operand order for commutative ops so "1+3" and "3+1" both
 *  show up over time, without being separate deck entries. */
export function orient(ex: MathEx): MathEx {
  if ((ex.op === "+" || ex.op === "×") && Math.random() < 0.5) {
    return { ...ex, a: ex.b, b: ex.a };
  }
  return ex;
}
