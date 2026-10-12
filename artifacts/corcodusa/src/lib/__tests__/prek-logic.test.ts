import { describe, expect, it } from "vitest";
import {
  PREK_MODES, PreKMode, PATTERN_LENGTH, ORDINALS, PATTERN_ITEMS,
  generateRound, levelsOf, isCorrect,
} from "@/lib/prek-logic";

const RUNS = 60;

describe("Pregătire Preșcolari — invariante comune", () => {
  for (const m of PREK_MODES) {
    for (const lvl of m.levels) {
      it(`${m.label} / ${lvl.label}: răspunsul e între opțiuni, opțiunile sunt distincte`, () => {
        for (let run = 0; run < RUNS; run++) {
          const r = generateRound(m.id, lvl.id);
          expect(r.options, `${m.id}:${lvl.label}`).toContain(r.answer);
          expect(new Set(r.options).size).toBe(r.options.length);
          const expectedLen = m.id === "mare" || m.id === "mic" ? 3 : 4;
          expect(r.options).toHaveLength(expectedLen);
          expect(isCorrect(r, r.answer)).toBe(true);
        }
      });
    }
  }
});

describe("Cel mai mare / cel mai mic", () => {
  it("răspunsul este max/min al celor trei numere afișate, în intervalul nivelului", () => {
    for (const mode of ["mare", "mic"] as PreKMode[]) {
      levelsOf(mode).forEach(lvl => {
        for (let run = 0; run < RUNS; run++) {
          const r = generateRound(mode, lvl.id);
          const nums = r.options.map(Number);
          expect(new Set(nums).size).toBe(3);
          nums.forEach(n => {
            expect(n).toBeGreaterThanOrEqual(1);
            expect(n).toBeLessThanOrEqual(lvl.max!);
          });
          const expected = mode === "mare" ? Math.max(...nums) : Math.min(...nums);
          expect(Number(r.answer)).toBe(expected);
        }
      });
    }
  });
});

describe("Ce vine după / înainte", () => {
  it("răspunsul e exact n+1 (după) sau n−1 (înainte), unde n vine din întrebare", () => {
    for (const mode of ["urmator", "inainte"] as PreKMode[]) {
      levelsOf(mode).forEach(lvl => {
        for (let run = 0; run < RUNS; run++) {
          const r = generateRound(mode, lvl.id);
          const n = Number(/\d+/.exec(r.question)![0]);
          const expected = mode === "urmator" ? n + 1 : n - 1;
          expect(Number(r.answer), r.question).toBe(expected);
          expect(Number(r.answer)).toBeGreaterThanOrEqual(1);
          expect(Number(r.answer)).toBeLessThanOrEqual(lvl.max!);
        }
      });
    }
  });
});

describe("Al câtelea din șir", () => {
  it("răspunsul e elementul de pe poziția cerută, iar șirul conține fiecare element o singură dată", () => {
    levelsOf("ordinal").forEach(lvl => {
      for (let run = 0; run < RUNS; run++) {
        const r = generateRound("ordinal", lvl.id);
        const ord = ORDINALS.find(o => r.question.includes(o))!;
        const p = ORDINALS.indexOf(ord) + 1;
        expect(p).toBeGreaterThanOrEqual(1);
        expect(p).toBeLessThanOrEqual(lvl.max!);
        expect(r.visual).toHaveLength(lvl.max);
        expect(r.visual[p - 1]).toBe(r.answer);
        expect(r.highlightIndex).toBe(p - 1);
        expect(new Set(r.visual).size).toBe(lvl.max);
      }
    });
  });
});

describe("Modele", () => {
  const PERIOD: Record<string, number> = { AB: 2, AAB: 3, ABC: 3 };

  levelsOf("modele").forEach(lvl => {
    it(`${lvl.label}: șirul are perioada corectă și răspunsul e elementul lipsă`, () => {
      const period = PERIOD[lvl.pattern!];
      for (let run = 0; run < RUNS; run++) {
        const r = generateRound("modele", lvl.id);
        expect(r.visual).toHaveLength(PATTERN_LENGTH);
        for (let i = period; i < PATTERN_LENGTH; i++) {
          expect(r.visual[i]).toBe(r.visual[i - period]);
        }
        expect(r.blankIndex).toBeGreaterThanOrEqual(0);
        expect(r.blankIndex!).toBeLessThan(PATTERN_LENGTH);
        expect(r.answer).toBe(r.visual[r.blankIndex!]);
        r.options.forEach(o => expect(PATTERN_ITEMS).toContain(o));
      }
    });
  });

  it("AAB și ABC au exact elementele unității cerute (AAB: 2 distincte, ABC: 3 distincte)", () => {
    const aab = levelsOf("modele").find(l => l.pattern === "AAB")!;
    const abc = levelsOf("modele").find(l => l.pattern === "ABC")!;
    for (let run = 0; run < RUNS; run++) {
      const r1 = generateRound("modele", aab.id);
      expect(new Set(r1.visual.slice(0, 3)).size).toBe(2);
      const r2 = generateRound("modele", abc.id);
      expect(new Set(r2.visual.slice(0, 3)).size).toBe(3);
    }
  });
});
