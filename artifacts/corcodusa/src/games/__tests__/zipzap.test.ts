import { describe, expect, it } from "vitest";
import { LEVELS, isAdjacent } from "@/games/GameZipZap";

type Cell = [number, number];
const key = (c: Cell) => `${c[0]},${c[1]}`;

describe("Zip Zap levels", () => {
  it("has 60 levels", () => {
    expect(LEVELS).toHaveLength(60);
  });

  LEVELS.forEach((level, idx) => {
    it(`level ${level.id} (${level.rows}×${level.cols}) has a valid reference solution`, () => {
      const { rows, cols, solution, waypoints } = level;

      // The solution fills every cell exactly once…
      expect(solution).toHaveLength(rows * cols);
      expect(new Set(solution.map(key)).size).toBe(rows * cols);
      for (const [r, c] of solution) {
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(rows);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(cols);
      }

      // …and each step moves to a neighbouring cell (a real path, no jumps).
      for (let i = 1; i < solution.length; i++) {
        expect(isAdjacent(solution[i - 1], solution[i]), `step ${i}`).toBe(true);
      }

      // Waypoints are on the solution, in order, starting and ending on the path.
      const positions = waypoints.map(w => solution.findIndex(s => key(s) === key(w)));
      positions.forEach(p => expect(p).toBeGreaterThanOrEqual(0));
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
      expect(waypoints[0]).toEqual(solution[0]);
      expect(waypoints[waypoints.length - 1]).toEqual(solution[solution.length - 1]);
      expect(idx).toBe(level.id - 1);
    });
  });
});
