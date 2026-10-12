import { describe, expect, it } from "vitest";
import { LEVELS } from "@/games/GamePatches";

type Clue = { r: number; c: number; area: number; shape: "square" | "wide" | "tall" };

const shapeOf = (w: number, h: number) => (w === h ? "square" : w > h ? "wide" : "tall");

/** Exact tiling search: can the grid be split into rectangles so that each
 *  rectangle holds exactly one clue with matching area and shape? */
function solvable(size: number, clues: Clue[]): boolean {
  const covered = Array.from({ length: size }, () => new Array(size).fill(false));
  const clueAt = (r0: number, c0: number, w: number, h: number) =>
    clues.filter(cl => cl.r >= r0 && cl.r < r0 + h && cl.c >= c0 && cl.c < c0 + w);

  function fill(): boolean {
    // First free cell in reading order.
    let r = -1, c = -1;
    outer: for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
      if (!covered[i][j]) { r = i; c = j; break outer; }
    }
    if (r === -1) return true;
    for (let h = 1; r + h <= size; h++) {
      for (let w = 1; c + w <= size; w++) {
        // Stop growing once a cell is taken.
        let free = true;
        for (let i = r; i < r + h && free; i++) for (let j = c; j < c + w; j++) if (covered[i][j]) { free = false; break; }
        if (!free) break;
        const inside = clueAt(r, c, w, h);
        if (inside.length !== 1) continue;
        if (inside[0].area !== w * h || inside[0].shape !== shapeOf(w, h)) continue;
        for (let i = r; i < r + h; i++) for (let j = c; j < c + w; j++) covered[i][j] = true;
        if (fill()) return true;
        for (let i = r; i < r + h; i++) for (let j = c; j < c + w; j++) covered[i][j] = false;
      }
    }
    return false;
  }
  return fill();
}

describe("Petice (Patches) levels", () => {
  it("has 18 levels, sizes 4/5/6", () => {
    expect(LEVELS).toHaveLength(18);
    expect(LEVELS.slice(0, 6).every(l => l.size === 4)).toBe(true);
    expect(LEVELS.slice(6, 12).every(l => l.size === 5)).toBe(true);
    expect(LEVELS.slice(12).every(l => l.size === 6)).toBe(true);
  });

  LEVELS.forEach(level => {
    it(`level ${level.id} (${level.size}×${level.size}) is solvable`, () => {
      // Clue cells sit inside the grid, and the areas add up to the whole board.
      for (const cl of level.clues) {
        expect(cl.r).toBeGreaterThanOrEqual(0);
        expect(cl.r).toBeLessThan(level.size);
        expect(cl.c).toBeGreaterThanOrEqual(0);
        expect(cl.c).toBeLessThan(level.size);
      }
      expect(level.clues.reduce((s, cl) => s + cl.area, 0)).toBe(level.size * level.size);
      expect(solvable(level.size, level.clues)).toBe(true);
    });
  });
});
