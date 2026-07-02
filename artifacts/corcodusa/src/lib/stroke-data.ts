/**
 * Stroke-order path data for step-by-step tracing (worksheet style).
 *
 * Every glyph is a list of strokes in the order a child is taught to write
 * them (e.g. letter A: left leg, right leg, crossbar). Each stroke is a
 * polyline in a normalized 0–100 coordinate box (y grows downward); the
 * canvas component scales it to pixels. Curves are approximated with enough
 * waypoints that the rendered rounded polyline reads as a smooth curve.
 */

export type StrokePt = { x: number; y: number };
export type Stroke = StrokePt[];

const L = (...pts: [number, number][]): Stroke => pts.map(([x, y]) => ({ x, y }));

/* ─── Letters (uppercase, stroke order as taught in school) ── */
export const LETTER_STROKES: Record<string, Stroke[]> = {
  A: [L([30, 90], [50, 10]), L([50, 10], [70, 90]), L([38, 62], [62, 62])],
  B: [
    L([30, 10], [30, 90]),
    L([30, 10], [56, 12], [66, 22], [66, 36], [56, 48], [30, 50]),
    L([30, 50], [58, 52], [70, 63], [70, 77], [58, 88], [30, 90]),
  ],
  C: [L([72, 25], [58, 12], [40, 11], [25, 22], [18, 42], [18, 58], [25, 78], [40, 89], [58, 88], [72, 75])],
  D: [L([30, 10], [30, 90]), L([30, 10], [52, 12], [68, 26], [73, 50], [68, 74], [52, 88], [30, 90])],
  E: [L([30, 10], [30, 90]), L([30, 10], [70, 10]), L([30, 50], [62, 50]), L([30, 90], [70, 90])],
  F: [L([30, 10], [30, 90]), L([30, 10], [70, 10]), L([30, 50], [62, 50])],
  G: [
    L([72, 22], [55, 10], [35, 13], [22, 28], [18, 50], [22, 70], [35, 87], [55, 90], [70, 80], [72, 60]),
    L([72, 60], [52, 60]),
  ],
  H: [L([30, 10], [30, 90]), L([70, 10], [70, 90]), L([30, 50], [70, 50])],
  I: [L([50, 10], [50, 90])],
  J: [L([60, 10], [60, 70], [56, 84], [44, 89], [32, 82], [28, 72])],
  K: [L([30, 10], [30, 90]), L([68, 10], [30, 55]), L([42, 45], [70, 90])],
  L: [L([30, 10], [30, 90], [70, 90])],
  M: [L([25, 90], [25, 10]), L([25, 10], [50, 55], [75, 10]), L([75, 10], [75, 90])],
  N: [L([30, 90], [30, 10]), L([30, 10], [70, 90]), L([70, 90], [70, 10])],
  O: [L([50, 10], [30, 16], [18, 35], [18, 60], [30, 82], [50, 90], [70, 82], [82, 60], [82, 35], [70, 16], [50, 10])],
  P: [L([30, 10], [30, 90]), L([30, 10], [58, 12], [68, 24], [68, 40], [58, 52], [30, 54])],
  Q: [
    L([50, 8], [30, 14], [18, 33], [18, 58], [30, 80], [50, 88], [70, 80], [82, 58], [82, 33], [70, 14], [50, 8]),
    L([58, 66], [78, 90]),
  ],
  R: [
    L([30, 10], [30, 90]),
    L([30, 10], [58, 12], [68, 24], [68, 40], [58, 52], [30, 54]),
    L([40, 54], [70, 90]),
  ],
  S: [L([70, 20], [55, 10], [38, 12], [30, 24], [36, 38], [50, 46], [64, 54], [70, 66], [64, 80], [48, 90], [32, 86], [25, 75])],
  T: [L([25, 10], [75, 10]), L([50, 10], [50, 90])],
  U: [L([30, 10], [30, 65], [35, 82], [50, 90], [65, 82], [70, 65], [70, 10])],
  V: [L([28, 10], [50, 90], [72, 10])],
  W: [L([20, 10], [33, 90], [50, 35], [67, 90], [80, 10])],
  X: [L([28, 10], [72, 90]), L([72, 10], [28, 90])],
  Y: [L([28, 10], [50, 48]), L([72, 10], [50, 48]), L([50, 48], [50, 90])],
  Z: [L([28, 10], [72, 10], [28, 90], [72, 90])],
};

/* ─── Digits (stroke order as taught in school) ─────────────── */
export const DIGIT_STROKES: Record<number, Stroke[]> = {
  0: [L([50, 10], [34, 16], [26, 35], [26, 62], [34, 84], [50, 90], [66, 84], [74, 62], [74, 35], [66, 16], [50, 10])],
  1: [L([38, 25], [52, 10], [52, 90])],
  2: [L([30, 25], [38, 12], [55, 10], [68, 18], [70, 32], [62, 48], [45, 65], [30, 90], [72, 90])],
  3: [L([32, 18], [46, 10], [62, 13], [68, 25], [62, 38], [48, 45], [64, 52], [70, 66], [64, 82], [46, 90], [32, 82])],
  4: [L([58, 10], [28, 60], [72, 60]), L([58, 35], [58, 90])],
  5: [
    L([34, 10], [32, 42], [48, 38], [66, 46], [70, 62], [64, 80], [46, 90], [30, 80]),
    L([34, 10], [68, 10]),
  ],
  6: [L([66, 14], [48, 10], [34, 22], [27, 45], [27, 68], [36, 86], [54, 90], [68, 82], [72, 66], [64, 52], [48, 48], [34, 54], [28, 66])],
  7: [L([30, 10], [70, 10], [45, 90])],
  8: [
    L([50, 46], [34, 38], [30, 24], [38, 12], [50, 10], [62, 12], [70, 24], [66, 38], [50, 46],
      [34, 56], [28, 72], [36, 86], [50, 90], [64, 86], [72, 72], [66, 56], [50, 46]),
  ],
  9: [
    L([68, 26], [56, 12], [40, 12], [30, 24], [30, 40], [40, 50], [56, 50], [66, 42], [68, 26]),
    L([68, 26], [68, 70], [62, 88]),
  ],
};

/** Strokes for a whole number (1–99): multi-digit numbers place each digit
 *  side by side in the same normalized box. */
export function numberStrokes(n: number): Stroke[] {
  const digits = String(n).split("").map(Number);
  if (digits.length === 1) return DIGIT_STROKES[digits[0]];
  const out: Stroke[] = [];
  digits.forEach((d, i) => {
    const dx = i * 52;
    for (const stroke of DIGIT_STROKES[d]) {
      out.push(stroke.map(p => ({ x: p.x * 0.48 + dx, y: p.y })));
    }
  });
  return out;
}

/* ─── Shapes — one stroke per edge (a "step" per side), curves whole ── */
type ShapeId = "cerc" | "pătrat" | "triunghi" | "dreptunghi" | "romb" | "pentagon" | "hexagon" | "stea";

function arcStroke(cx: number, cy: number, r: number, from: number, to: number, segments = 26): Stroke {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / segments;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

function polygonEdges(vertices: [number, number][]): Stroke[] {
  return vertices.map((v, i) => L(v, vertices[(i + 1) % vertices.length]));
}

function regularVertices(cx: number, cy: number, r: number, sides: number): [number, number][] {
  return Array.from({ length: sides }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / sides;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number];
  });
}

export function shapeStrokes(shape: ShapeId): Stroke[] {
  switch (shape) {
    case "cerc":       return [arcStroke(50, 50, 36, -Math.PI / 2, Math.PI * 1.5)];
    case "pătrat":     return polygonEdges([[16, 16], [84, 16], [84, 84], [16, 84]]);
    case "dreptunghi": return polygonEdges([[8, 28], [92, 28], [92, 72], [8, 72]]);
    case "triunghi":   return polygonEdges([[50, 10], [90, 82], [10, 82]]);
    case "romb":       return polygonEdges([[50, 8], [88, 50], [50, 92], [12, 50]]);
    case "pentagon":   return polygonEdges(regularVertices(50, 52, 40, 5));
    case "hexagon":    return polygonEdges(regularVertices(50, 50, 40, 6));
    case "stea": {
      // One continuous stroke through all 10 star points — kids love drawing
      // a star in one go, and 10 separate edge-steps would be tedious.
      const pts: [number, number][] = [];
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
        pts.push([50 + Math.cos(a) * 40, 52 + Math.sin(a) * 40]);
        pts.push([50 + Math.cos(a2) * 17, 52 + Math.sin(a2) * 17]);
      }
      pts.push(pts[0]);
      return [L(...pts)];
    }
  }
}
export type { ShapeId };
