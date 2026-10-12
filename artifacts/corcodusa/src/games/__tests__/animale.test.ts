import { describe, expect, it } from "vitest";
import { ANIMALS, foodDistractors, generateRound } from "@/games/GameAnimale";

const words = (s: string) => s.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);

describe("Animale — data", () => {
  it("every animal has a name, emoji, category and habitat", () => {
    for (const a of ANIMALS) {
      expect(a.name).toBeTruthy();
      expect(a.emoji).toBeTruthy();
      expect(a.habitat).toBeTruthy();
      expect(a.food).toBeTruthy();
    }
    expect(new Set(ANIMALS.map(a => a.name)).size).toBe(ANIMALS.length);
  });

  it("the sounds quiz has at least 3 animals with a sound in every category", () => {
    for (const cat of ["domestice", "salbatice", "pasari", "insecte"] as const) {
      expect(ANIMALS.filter(a => a.cat === cat && a.sound).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("Animale — ‘Ce mănâncă?’ answers are not ambiguous", () => {
  const foods = [...new Set(ANIMALS.map(a => a.food))];

  for (const food of foods) {
    it(`“${food}”: wrong options never share a word with the right one`, () => {
      const wrong = foodDistractors(food, 5);
      expect(wrong).toHaveLength(5);
      expect(new Set(wrong).size).toBe(5);
      for (const w of wrong) {
        expect(w).not.toBe(food);
        const shared = words(w).filter(x => words(food).includes(x));
        expect(shared, `“${w}” shares ${shared.join(",")} with “${food}”`).toEqual([]);
      }
    });
  }
});

describe("Animale — rounds", () => {
  it("round options contain the target exactly once, with the requested count", () => {
    const cases = [
      { mode: "identifica" as const, n: 3 }, { mode: "identifica" as const, n: 6 },
      { mode: "habitat" as const, n: 3 }, { mode: "hrana" as const, n: 6 },
    ];
    for (const cat of ["domestice", "salbatice", "pasari", "insecte"] as const) {
      for (const { mode, n } of cases) {
        const diffId = n === 3 ? "usor" : n === 6 ? "greu" : "mediu";
        const round = generateRound(mode, cat, diffId);
        expect(round.options).toHaveLength(n);
        expect(new Set(round.options).size).toBe(n);
        const correct = mode === "habitat" ? round.target.habitat
          : mode === "hrana" ? round.target.food : round.target.name;
        expect(round.options.filter(o => o === correct)).toHaveLength(1);
      }
    }
  });

  it("sounds mode only deals animals that have a sound", () => {
    for (let i = 0; i < 40; i++) {
      const round = generateRound("sunete", "domestice", "usor");
      expect(round.target.sound).toBeTruthy();
    }
  });
});
