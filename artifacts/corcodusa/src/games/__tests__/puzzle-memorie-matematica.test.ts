import { describe, expect, it } from "vitest";
import { createPuzzle, isSolved, THEMES, GRIDS } from "@/games/GamePuzzle";
import { createCards, DIFFICULTIES, THEMES as MEMO_THEMES } from "@/games/GameMemorie";
import { LEVELS as ADD_LEVELS, generateRound as addRound } from "@/games/GameAdunare";
import { COUNT_LEVELS, generateRound as countRound } from "@/games/GameNumarare";
import { IMAGE_PUZZLES } from "@/games/GameUnestePunctele";

describe("Puzzle — boards", () => {
  for (const g of GRIDS) {
    it(`${g.label}: a new board is never already solved and holds every piece once`, () => {
      for (const themeKey of Object.keys(THEMES)) {
        for (let run = 0; run < 40; run++) {
          const board = createPuzzle(themeKey, g.cols, g.rows);
          expect(isSolved(board)).toBe(false);
          expect(board.map(p => p.currentPos).sort((a, b) => a - b))
            .toEqual(Array.from({ length: g.cols * g.rows }, (_, i) => i));
          expect(new Set(board.map(p => p.emoji)).size).toBe(g.cols * g.rows);
        }
      }
    });
  }

  it("every theme has at least 25 distinct pieces (the 5×5 board needs them)", () => {
    for (const t of Object.values(THEMES)) {
      expect(new Set(t.pieces).size).toBeGreaterThanOrEqual(25);
    }
  });
});

describe("Memorie — cards", () => {
  for (const d of DIFFICULTIES) {
    it(`${d.label}: ${d.pairs} pairs, each emoji exactly twice`, () => {
      for (const themeKey of Object.keys(MEMO_THEMES)) {
        const theme = MEMO_THEMES[themeKey];
        const cards = createCards(themeKey, theme.pairs, d.pairs);
        expect(cards).toHaveLength(d.pairs * 2);
        const counts = new Map<string, number>();
        for (const c of cards) counts.set(c.emoji, (counts.get(c.emoji) ?? 0) + 1);
        expect(counts.size).toBe(d.pairs);
        for (const n of counts.values()) expect(n).toBe(2);
      }
    });
  }
});

describe("Adunare — rounds", () => {
  it("every level's answer is the arithmetic result and sits among the 4 options", () => {
    ADD_LEVELS.forEach((lvl, i) => {
      for (let run = 0; run < 60; run++) {
        const round = addRound(i + 1);
        const expected = round.op === "+" ? round.a + round.b
          : round.op === "−" ? round.a - round.b
          : round.op === "×" ? round.a * round.b
          : round.a / round.b;
        expect(round.answer, `${lvl.label}: ${round.a}${round.op}${round.b}`).toBe(expected);
        expect(round.options).toHaveLength(4);
        expect(round.options).toContain(round.answer);
        expect(new Set(round.options).size).toBe(4);
        expect(round.options.every(o => o >= 0)).toBe(true);
      }
    });
  });

  it("division levels only deal exact quotients", () => {
    for (let run = 0; run < 80; run++) {
      const r = addRound(6);
      expect(r.op).toBe("÷");
      expect(r.a % r.b).toBe(0);
    }
  });
});

describe("Numărare — rounds", () => {
  it("counting levels: the count is inside the level's range and is among the options", () => {
    COUNT_LEVELS.forEach((lvl, i) => {
      if (lvl.parity) return;
      for (let run = 0; run < 60; run++) {
        const r = countRound(i + 1);
        expect(r.count).toBeGreaterThanOrEqual(lvl.min);
        expect(r.count).toBeLessThanOrEqual(lvl.max);
        expect(r.options).toContain(r.count);
        expect(new Set(r.options).size).toBe(4);
      }
    });
  });

  it("tens level only deals multiples of 10", () => {
    for (let run = 0; run < 40; run++) {
      expect(countRound(5).count % 10).toBe(0);
    }
  });
});

describe("Unește Punctele — pictures", () => {
  it("every picture has at least 3 dots and its lift indices point at real dots", () => {
    for (const p of IMAGE_PUZZLES) {
      expect(p.dots.length, p.label).toBeGreaterThanOrEqual(3);
      for (const i of p.lifts) {
        expect(i, `${p.label}: lift ${i}`).toBeGreaterThanOrEqual(0);
        expect(i, `${p.label}: lift ${i}`).toBeLessThan(p.dots.length);
      }
      for (const [x, y] of p.dots) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(100);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("picture labels are unique", () => {
    const labels = IMAGE_PUZZLES.map(p => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
