import { describe, expect, it } from "vitest";
import {
  Deck, DeckMap, additionSpace, subtractionSpace, multiplicationSpace, divisionSpace, orient, shuffle,
} from "@/lib/exercise-deck";

describe("exercise spaces", () => {
  it("addition space: every sum ≤ max, answers are correct, no duplicates", () => {
    const space = additionSpace(10);
    for (const ex of space) {
      expect(ex.a + ex.b).toBe(ex.answer);
      expect(ex.answer).toBeLessThanOrEqual(10);
    }
    const keys = space.map(e => `${e.a}+${e.b}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("subtraction space: positive results and a − b = answer", () => {
    for (const ex of subtractionSpace(10)) {
      expect(ex.answer).toBeGreaterThan(0);
      expect(ex.a - ex.b).toBe(ex.answer);
    }
  });

  it("multiplication space uses tables 2–5 and dedupes commutative pairs", () => {
    const space = multiplicationSpace(5);
    for (const ex of space) {
      expect([2, 3, 4, 5]).toContain(ex.a);
      expect(ex.a * ex.b).toBe(ex.answer);
    }
    // 2×3 and 3×2 must not both appear.
    const pairs = space.map(e => [Math.min(e.a, e.b), Math.max(e.a, e.b)].join("x"));
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("division space: exact quotients only, divisor 2–5", () => {
    for (const ex of divisionSpace(5)) {
      expect(ex.b).toBeGreaterThanOrEqual(2);
      expect(ex.b).toBeLessThanOrEqual(5);
      expect(ex.a % ex.b).toBe(0);
      expect(ex.a / ex.b).toBe(ex.answer);
    }
  });

  it("orient swaps only commutative operands and keeps the answer", () => {
    const add = { a: 1, b: 3, op: "+" as const, answer: 4 };
    for (let i = 0; i < 20; i++) {
      const o = orient(add);
      expect(o.a + o.b).toBe(4);
    }
    const sub = { a: 5, b: 2, op: "−" as const, answer: 3 };
    expect(orient(sub)).toEqual(sub);
  });
});

describe("Deck (no-repeat dealing)", () => {
  it("deals every item exactly once before repeating", () => {
    const items = Array.from({ length: 12 }, (_, i) => i);
    const deck = new Deck(() => items);
    const firstCycle = Array.from({ length: items.length }, () => deck.next());
    expect([...firstCycle].sort((a, b) => a - b)).toEqual(items);
  });

  it("DeckMap keeps a separate deck per key", () => {
    const map = new DeckMap<string>(key => [`${key}-1`]);
    expect(map.next("a")).toBe("a-1");
    expect(map.next("b")).toBe("b-1");
  });

  it("shuffle returns a permutation", () => {
    const input = [1, 2, 3, 4, 5];
    expect([...shuffle(input)].sort()).toEqual(input);
  });
});
