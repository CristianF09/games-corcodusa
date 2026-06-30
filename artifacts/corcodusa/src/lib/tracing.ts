/**
 * Pixel-coverage verification for tracing games (digits, letters, shapes).
 *
 * The template (a digit, a letter, a shape outline) is rendered as a solid
 * black mask on a white offscreen canvas; the dark pixels are sampled as a
 * sparse point cloud. While the player draws, each stroke segment is tested
 * against that point cloud — any template point within `brushRadius` of the
 * segment gets marked "covered". Progress is covered/total points.
 *
 * This actually checks the drawing followed the template. A naive
 * "how many total pixels did you scribble" check (e.g. accumulated stroke
 * path length with no spatial relation to the template) would also pass for
 * a doodle drawn anywhere on the canvas — that bug existed in the letter and
 * shape tracing games until this module replaced it.
 */

import type { MouseEvent, TouchEvent } from "react";

export type Pt = { x: number; y: number };

export const TRACE_BRUSH_RADIUS = 20; // px — coverage detection radius
export const TRACE_COVERAGE_GOAL = 0.52; // 52% of template pixels must be covered
export const TRACE_SAMPLE_STEP = 3; // sample template every 3px
export const TRACE_CANVAS_SIZE = 400; // backing-resolution canvas size — bigger = easier for small hands to trace

// "Wrong attempt" detection — used to give an explicit error + force a retry
// instead of silently waiting forever for coverage to reach the goal.
export const TRACE_ERROR_MIN_INK = 260; // px of ink drawn before we start judging (avoids early false positives)
export const TRACE_ERROR_RATIO = 0.55; // if ≥55% of ink drawn so far missed the template → flag an error

/** Render a template as a solid black mask on white into an offscreen
 *  canvas, then sample the dark pixels as a sparse point cloud. */
export function sampleMaskPoints(
  render: (ctx: CanvasRenderingContext2D, size: number) => void,
  size: number,
  step: number = TRACE_SAMPLE_STEP,
  darkThreshold = 100,
): Pt[] {
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const ctx = off.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  render(ctx, size);

  const { data } = ctx.getImageData(0, 0, size, size);
  const pts: Pt[] = [];
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (data[(y * size + x) * 4] < darkThreshold) pts.push({ x, y });
    }
  }
  return pts;
}

/** Squared distance from point P to line segment (A→B). */
export function distSq(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 0.001) return (p.x - a.x) ** 2 + (p.y - a.y) ** 2;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return (p.x - a.x - t * dx) ** 2 + (p.y - a.y - t * dy) ** 2;
}

/**
 * Marks which template points have been "inked" while dragging the brush
 * from `from` to `to`. Mutates `covered` in place (call-site owns the Set so
 * it can persist across strokes/renders without re-allocating each call).
 * Returns the resulting coverage fraction and whether this stroke passed
 * near the template at all (for "you're on track" UI feedback).
 */
export function markCoverage(
  points: Pt[],
  covered: Set<number>,
  from: Pt,
  to: Pt,
  brushRadius: number = TRACE_BRUSH_RADIUS,
): { pct: number; onTrack: boolean; offTrack: boolean; segLen: number } {
  const r2 = brushRadius * brushRadius;
  let onTrack = false;
  for (let i = 0; i < points.length; i++) {
    const d2 = distSq(points[i], from, to);
    if (d2 <= r2 * 4) onTrack = true; // within 2x radius → "close" feedback
    if (d2 <= r2 && !covered.has(i)) covered.add(i);
  }
  const pct = points.length ? covered.size / points.length : 0;
  const segLen = Math.hypot(to.x - from.x, to.y - from.y);
  return { pct, onTrack, offTrack: !onTrack, segLen };
}

/**
 * Tracks how much of the drawn ink actually followed the template versus
 * wandered far off it. A clearly-wrong attempt (e.g. scribbling in a corner)
 * should produce an explicit "try again" rather than silently waiting
 * forever for coverage to reach the goal.
 */
export class InkTracker {
  onInk = 0;
  offInk = 0;

  add(segLen: number, offTrack: boolean) {
    if (offTrack) this.offInk += segLen;
    else this.onInk += segLen;
  }

  /** True once enough ink has been drawn and most of it missed the template. */
  isError(): boolean {
    const total = this.onInk + this.offInk;
    return total >= TRACE_ERROR_MIN_INK && this.offInk / total >= TRACE_ERROR_RATIO;
  }

  reset() {
    this.onInk = 0;
    this.offInk = 0;
  }
}

/** Get a pointer/touch position in canvas pixel coordinates, accounting for
 *  CSS scaling (canvas rendered smaller than its `width`/`height` attrs). */
export function getCanvasPos(
  e: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
): Pt {
  const r = canvas.getBoundingClientRect();
  const s = canvas.width / r.width;
  if ("touches" in e) {
    return { x: (e.touches[0].clientX - r.left) * s, y: (e.touches[0].clientY - r.top) * s };
  }
  return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
}
