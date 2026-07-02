/**
 * Shared tracing canvas for letters, numbers and shapes — two modes:
 *
 * "Pas cu pas" (default): worksheet-style guided tracing. The glyph is shown
 * as dotted guide lines with numbered stroke-start badges; the child drags
 * along the current stroke and the line fills in with color as they go. The
 * hitbox is huge (toddler fine-motor skills) and there is NO fail state —
 * moving off the path simply doesn't advance, it never shows an error.
 *
 * "Colorează liber": total freedom — pick a color and trace or color over
 * the faint guide however you like, then press "Gata!" to finish.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { getCanvasPos, TRACE_CANVAS_SIZE, type Pt } from "@/lib/tracing";
import { playCorrect, playClick } from "@/lib/sfx";
import type { Stroke } from "@/lib/stroke-data";

const HITBOX = 45;      // px — very forgiving target radius
const LOOKAHEAD = 10;   // how many path points the finger may jump ahead
const DENSE_STEP = 7;   // px between interpolated path points
const LINE_W = 16;      // px — drawn line thickness

export const FREE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

/** Interpolate a polyline into evenly spaced points so progress is smooth. */
function densify(stroke: Stroke, size: number, step = DENSE_STEP): Pt[] {
  const pts = stroke.map(p => ({ x: (p.x / 100) * size, y: (p.y / 100) * size }));
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.round(len / step));
    for (let j = 1; j <= n; j++) out.push({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n });
  }
  return out;
}

function drawPath(ctx: CanvasRenderingContext2D, pts: Pt[], upTo = pts.length) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < upTo; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

type Mode = "steps" | "free";

export default function StepTraceCanvas({ strokes, color, onComplete }: {
  strokes: Stroke[];
  color: string;
  onComplete: () => void;
}) {
  const SIZE = TRACE_CANVAS_SIZE;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dense = useMemo(() => strokes.map(s => densify(s, SIZE)), [strokes, SIZE]);

  const [mode, setMode] = useState<Mode>("steps");
  const [done, setDone] = useState(false);
  const [freeColor, setFreeColor] = useState(color);
  // Tracing progress lives in a ref (updated per pointer event, read by the
  // animation loop); stepNo mirrors the stroke index for the React UI.
  const progRef = useRef({ stroke: 0, pt: 0 });
  const [stepNo, setStepNo] = useState(0);
  const [overall, setOverall] = useState(0);
  const drawing = useRef(false);
  const lastFree = useRef<Pt | null>(null);

  function resetProgress() {
    progRef.current = { stroke: 0, pt: 0 };
    setStepNo(0); setOverall(0); setDone(false);
    lastFree.current = null;
  }
  useEffect(resetProgress, [strokes]);

  /* ── Steps mode: full redraw every animation frame (pulsing target) ── */
  useEffect(() => {
    if (mode !== "steps") return;
    let raf = 0;
    const render = (t: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const { stroke, pt } = progRef.current;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      // Guide: dotted worksheet lines for every stroke
      dense.forEach((d, i) => {
        if (i < stroke) return; // completed strokes get solid paint below
        ctx.setLineDash([1, 12]);
        ctx.lineWidth = 6;
        ctx.strokeStyle = i === stroke ? "#94a3b8" : "#d3dae3";
        drawPath(ctx, d);
        ctx.setLineDash([]);
      });

      // Completed strokes + progress on the current stroke, in solid color
      ctx.lineWidth = LINE_W;
      ctx.strokeStyle = color;
      for (let i = 0; i < Math.min(stroke, dense.length); i++) drawPath(ctx, dense[i]);
      if (stroke < dense.length && pt > 0) drawPath(ctx, dense[stroke], pt + 1);

      // Numbered start badges for the current and upcoming strokes
      for (let i = stroke; i < dense.length; i++) {
        const d = dense[i];
        const dir = { x: d[1].x - d[0].x, y: d[1].y - d[0].y };
        const dl = Math.hypot(dir.x, dir.y) || 1;
        // Nudge the badge "behind" the stroke start so badges of strokes that
        // share a start point (e.g. letter B) don't overlap.
        const bx = d[0].x - (dir.x / dl) * 20, by = d[0].y - (dir.y / dl) * 20;
        ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2);
        ctx.fillStyle = i === stroke ? color : "#ffffff"; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = i === stroke ? color : "#94a3b8"; ctx.stroke();
        ctx.fillStyle = i === stroke ? "#ffffff" : "#64748b";
        ctx.font = "bold 15px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), bx, by + 1);
      }

      // Pulsing target: where the finger should go next
      if (stroke < dense.length) {
        const d = dense[stroke];
        const target = d[Math.min(pt + 2, d.length - 1)];
        const pulse = 0.8 + 0.2 * Math.sin(t / 180);
        ctx.beginPath(); ctx.arc(target.x, target.y, HITBOX * 0.55 * pulse, 0, Math.PI * 2);
        ctx.lineWidth = 3; ctx.strokeStyle = "#f43f5e"; ctx.stroke();
        ctx.beginPath(); ctx.arc(target.x, target.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "#ffffff"; ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [mode, dense, color, SIZE]);

  /* ── Free mode: paint the faint guide once, then draw incrementally ── */
  useEffect(() => {
    if (mode !== "free") return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.setLineDash([1, 12]); ctx.lineWidth = 6; ctx.strokeStyle = "#d3dae3";
    dense.forEach(d => drawPath(ctx, d));
    ctx.setLineDash([]);
  }, [mode, dense, SIZE]);

  function advance(pos: Pt) {
    const s = progRef.current;
    if (s.stroke >= dense.length) return;
    const d = dense[s.stroke];
    // Furthest point within the (huge) hitbox wins — small skips are fine.
    for (let i = Math.min(s.pt + LOOKAHEAD, d.length - 1); i >= s.pt; i--) {
      if (Math.hypot(pos.x - d[i].x, pos.y - d[i].y) <= HITBOX) {
        s.pt = i + 1;
        break;
      }
    }
    if (s.pt >= d.length) {
      s.stroke += 1; s.pt = 0;
      setStepNo(s.stroke);
      if (s.stroke >= dense.length) {
        setDone(true);
        setOverall(1);
        setTimeout(onComplete, 900);
        return;
      }
      playCorrect();
    }
    setOverall((s.stroke + (s.stroke < dense.length ? s.pt / dense[s.stroke].length : 0)) / dense.length);
  }

  function pointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (done) return;
    drawing.current = true;
    const pos = getCanvasPos(e, canvasRef.current!);
    if (mode === "steps") advance(pos);
    else lastFree.current = pos;
  }

  function pointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || done) return;
    const pos = getCanvasPos(e, canvasRef.current!);
    if (mode === "steps") { advance(pos); return; }
    const ctx = canvasRef.current!.getContext("2d")!;
    if (lastFree.current) {
      ctx.strokeStyle = freeColor; ctx.lineWidth = 24; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(lastFree.current.x, lastFree.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    lastFree.current = pos;
  }

  function pointerUp() { drawing.current = false; lastFree.current = null; }

  function switchMode(m: Mode) {
    if (m === mode) return;
    playClick();
    setMode(m);
    resetProgress();
  }

  function clearFree() {
    // Re-trigger the free-mode base paint by toggling through steps state
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.setLineDash([1, 12]); ctx.lineWidth = 6; ctx.strokeStyle = "#d3dae3";
    dense.forEach(d => drawPath(ctx, d));
    ctx.setLineDash([]);
  }

  const pct = Math.round(overall * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-full">
        <button onClick={() => switchMode("steps")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === "steps" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          ✏️ Pas cu pas
        </button>
        <button onClick={() => switchMode("free")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === "free" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          🖍️ Colorează liber
        </button>
      </div>

      {mode === "steps" && !done && (
        <p className="text-sm font-bold" style={{ color }}>
          Pasul {Math.min(stepNo + 1, strokes.length)} din {strokes.length} — pornește de la cercul galben!
        </p>
      )}

      <div className="relative">
        <canvas ref={canvasRef} width={SIZE} height={SIZE}
          className={`rounded-3xl border-2 shadow-xl touch-none cursor-crosshair transition-all duration-300 w-80 h-80 sm:w-96 sm:h-96
            ${done ? "border-green-400 shadow-[0_0_24px_rgba(34,197,94,.35)]" : "border-border"}`}
          onMouseDown={pointerDown} onMouseMove={pointerMove} onMouseUp={pointerUp} onMouseLeave={pointerUp}
          onTouchStart={pointerDown} onTouchMove={pointerMove} onTouchEnd={pointerUp} />
      </div>

      {mode === "steps" ? (
        <div className="flex items-center gap-3 w-80 sm:w-96">
          <div className="flex-1 h-3.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${pct}%`, background: done ? "#22c55e" : color }} />
          </div>
          <span className="text-sm font-black w-10 text-right" style={{ color: done ? "#22c55e" : color }}>{pct}%</span>
          <button onClick={resetProgress} title="Ia-o de la capăt"
            className="text-base text-muted-foreground hover:text-foreground transition-colors">↺</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap justify-center w-80 sm:w-96">
          {FREE_COLORS.map(c => (
            <button key={c} onClick={() => { playClick(); setFreeColor(c); }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${freeColor === c ? "scale-125 border-foreground shadow" : "border-white shadow-sm hover:scale-110"}`}
              style={{ background: c }} />
          ))}
          <button onClick={clearFree} title="Șterge tot"
            className="text-base text-muted-foreground hover:text-foreground transition-colors ml-1">↺</button>
          <button onClick={() => { if (!done) { setDone(true); setTimeout(onComplete, 400); } }}
            className="px-4 py-1.5 rounded-full bg-green-500 text-white text-sm font-bold shadow hover:bg-green-600 transition-all">
            ✓ Gata!
          </button>
        </div>
      )}
    </div>
  );
}
