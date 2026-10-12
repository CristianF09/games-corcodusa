import { describe, expect, it } from "vitest";
import { generateMaze, calcStars, OPPOSITE } from "@/games/GameLabirint";

const DIRS = ["N", "S", "E", "W"] as const;
const STEP: Record<(typeof DIRS)[number], [number, number]> = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };

function reachable(maze: ReturnType<typeof generateMaze>, rows: number, cols: number) {
  const seen = new Set<string>(["0,0"]);
  const queue: [number, number][] = [[0, 0]];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    for (const d of DIRS) {
      if (maze[r][c][d]) continue;
      const nr = r + STEP[d][0], nc = c + STEP[d][1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const k = `${nr},${nc}`;
      if (!seen.has(k)) { seen.add(k); queue.push([nr, nc]); }
    }
  }
  return seen;
}

describe("Labirint maze generation", () => {
  for (const [rows, cols] of [[7, 7], [11, 11], [15, 15]]) {
    it(`${rows}×${cols}: every cell is reachable from the start and the goal is reachable`, () => {
      for (let run = 0; run < 25; run++) {
        const maze = generateMaze(rows, cols);
        const seen = reachable(maze, rows, cols);
        expect(seen.size).toBe(rows * cols);
        expect(seen.has(`${rows - 1},${cols - 1}`)).toBe(true);
      }
    });

    it(`${rows}×${cols}: walls are shared consistently between neighbours`, () => {
      const maze = generateMaze(rows, cols);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        for (const d of DIRS) {
          const nr = r + STEP[d][0], nc = c + STEP[d][1];
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          expect(maze[r][c][d]).toBe(maze[nr][nc][OPPOSITE[d]]);
        }
      }
    });
  }

  it("a perfect maze has exactly rows·cols − 1 open passages", () => {
    const maze = generateMaze(9, 9);
    let open = 0;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (!maze[r][c].E && c < 8) open++;
      if (!maze[r][c].S && r < 8) open++;
    }
    expect(open).toBe(9 * 9 - 1);
  });
});

describe("Labirint stars", () => {
  it("more moves never give more stars", () => {
    let prev = 3;
    for (let moves = 0; moves < 400; moves++) {
      const stars = calcStars(moves, 11);
      expect(stars).toBeLessThanOrEqual(prev);
      prev = stars;
    }
    expect(calcStars(0, 7)).toBe(3);
    expect(calcStars(10000, 7)).toBe(1);
  });
});
