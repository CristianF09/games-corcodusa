import { describe, expect, it } from "vitest";
import { CATEGORIES, buildGrid } from "@/games/GameCuvinte";

// Grid sizes per difficulty, as in the game's DIFFS table.
const SIZES = { easy: 8, medium: 10, hard: 12 } as const;

describe("Caută Cuvinte — grid generation", () => {
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    for (const [diff, size] of Object.entries(SIZES) as [keyof typeof SIZES, number][]) {
      it(`${catKey}/${diff}: all words are placed and readable in the grid`, () => {
        const words = cat[diff] as readonly string[];
        for (let run = 0; run < 15; run++) {
          const { grid, placements } = buildGrid(words, size);

          // Every word from the list is on the board — none silently dropped.
          expect(placements.map(p => p.word).sort()).toEqual([...words].sort());

          // The letters at each placement spell the word, in a straight line.
          expect(grid).toHaveLength(size);
          for (const p of placements) {
            const spelled = p.cells.map(([r, c]) => grid[r][c]).join("");
            expect(spelled === p.word || spelled === [...p.word].reverse().join("")).toBe(true);
            const [dr, dc] = [p.cells[1][0] - p.cells[0][0], p.cells[1][1] - p.cells[0][1]];
            p.cells.forEach(([r, c], i) => {
              if (i === 0) return;
              expect(r - p.cells[0][0]).toBe(dr * i);
              expect(c - p.cells[0][1]).toBe(dc * i);
            });
          }
        }
      });
    }
  }

  it("word lists fit the grid they are played on", () => {
    for (const cat of Object.values(CATEGORIES)) {
      for (const [diff, size] of Object.entries(SIZES) as [keyof typeof SIZES, number][]) {
        for (const w of cat[diff] as readonly string[]) {
          expect(w.length).toBeLessThanOrEqual(size);
        }
      }
    }
  });
});
