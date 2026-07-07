import { useState, useRef, useMemo } from "react";
import { playClick, playCelebrate, playCorrect, playWrong } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Rect { r: number; c: number; w: number; h: number }
type Shape = "square" | "wide" | "tall";

interface Clue {
  r: number; c: number;   // cell where the clue sits
  area: number;           // patch must cover exactly this many cells
  shape: Shape;           // and have this proportion
}

interface Level {
  id: number;
  size: number;           // grid is size×size
  clues: Clue[];
  label: string;
}

interface Patch extends Rect { colorIdx: number }

/* ─── Seeded PRNG (deterministic levels) ─────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Level generation: guillotine partition of the grid ─────────────────── */

function shapeOf(w: number, h: number): Shape {
  return w === h ? "square" : w > h ? "wide" : "tall";
}

function generateLevel(idx: number, size: number, maxLeaf: number): Level {
  const rnd = mulberry32(1000 + idx * 37);
  const leaves: Rect[] = [];

  function split(rect: Rect) {
    const area = rect.w * rect.h;
    const canStop = area <= maxLeaf;
    // Keep splitting large rects; small ones stop with increasing probability
    if (canStop && (area <= 3 || rnd() < 0.55)) { leaves.push(rect); return; }
    // Split along the longer side (ties → random)
    const splitVertically = rect.w === rect.h ? rnd() < 0.5 : rect.w > rect.h;
    if (splitVertically && rect.w > 1) {
      const cut = 1 + Math.floor(rnd() * (rect.w - 1));
      split({ ...rect, w: cut });
      split({ ...rect, c: rect.c + cut, w: rect.w - cut });
    } else if (rect.h > 1) {
      const cut = 1 + Math.floor(rnd() * (rect.h - 1));
      split({ ...rect, h: cut });
      split({ ...rect, r: rect.r + cut, h: rect.h - cut });
    } else {
      leaves.push(rect); // 1×1 that can't be split further
    }
  }

  split({ r: 0, c: 0, w: size, h: size });

  const clues: Clue[] = leaves.map(leaf => ({
    r: leaf.r + Math.floor(rnd() * leaf.h),
    c: leaf.c + Math.floor(rnd() * leaf.w),
    area: leaf.w * leaf.h,
    shape: shapeOf(leaf.w, leaf.h),
  }));

  const label = size <= 4 ? "Ușor" : size <= 5 ? "Mediu" : "Greu";
  return { id: idx + 1, size, clues, label };
}

// 18 deterministic levels: 6× 4×4, 6× 5×5, 6× 6×6
const LEVELS: Level[] = Array.from({ length: 18 }, (_, i) =>
  generateLevel(i, i < 6 ? 4 : i < 12 ? 5 : 6, i < 6 ? 4 : 6)
);

/* ─── Patch colors (pastel fills + strong borders) ───────────────────────── */

const PATCH_COLORS: [string, string][] = [
  ["#fecaca", "#ef4444"], ["#fde68a", "#f59e0b"], ["#bbf7d0", "#22c55e"],
  ["#bfdbfe", "#3b82f6"], ["#e9d5ff", "#a855f7"], ["#fbcfe8", "#ec4899"],
  ["#a5f3fc", "#06b6d4"], ["#fed7aa", "#f97316"], ["#c7d2fe", "#6366f1"],
];

const SHAPE_GLYPH: Record<Shape, string> = { square: "■", wide: "▬", tall: "▮" };
const SHAPE_NAME: Record<Shape, string> = { square: "pătrat", wide: "lat", tall: "înalt" };

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function GamePatches() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [preview, setPreview] = useState<Rect | null>(null);
  const [won, setWon] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  const svgRef = useRef<SVGSVGElement>(null);
  const anchor = useRef<[number, number] | null>(null);
  const level = LEVELS[levelIdx];

  // covered["r,c"] = index of patch covering that cell
  const covered = useMemo(() => {
    const map = new Map<string, number>();
    patches.forEach((p, i) => {
      for (let r = p.r; r < p.r + p.h; r++)
        for (let c = p.c; c < p.c + p.w; c++) map.set(`${r},${c}`, i);
    });
    return map;
  }, [patches]);

  function loadLevel(idx: number) {
    setLevelIdx(idx);
    setPatches([]);
    setPreview(null);
    setWon(false);
    setShowLevelPicker(false);
    anchor.current = null;
  }

  function resetLevel() {
    setPatches([]);
    setPreview(null);
    setWon(false);
    anchor.current = null;
    playClick();
  }

  /* ── Geometry helpers ── */
  const maxW = Math.min(480, typeof window !== "undefined" ? window.innerWidth - 32 : 480);
  const cellPx = Math.max(48, Math.floor(maxW / level.size));
  const gridPx = cellPx * level.size;

  function getCellAt(clientX: number, clientY: number): [number, number] | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const c = Math.floor(((clientX - rect.left) / rect.width) * level.size);
    const r = Math.floor(((clientY - rect.top) / rect.height) * level.size);
    if (r < 0 || r >= level.size || c < 0 || c >= level.size) return null;
    return [r, c];
  }

  function rectFrom(a: [number, number], b: [number, number]): Rect {
    const r = Math.min(a[0], b[0]);
    const c = Math.min(a[1], b[1]);
    return { r, c, w: Math.abs(a[1] - b[1]) + 1, h: Math.abs(a[0] - b[0]) + 1 };
  }

  function cluesInside(rect: Rect): Clue[] {
    return level.clues.filter(cl =>
      cl.r >= rect.r && cl.r < rect.r + rect.h && cl.c >= rect.c && cl.c < rect.c + rect.w
    );
  }

  function rectIsFree(rect: Rect): boolean {
    for (let r = rect.r; r < rect.r + rect.h; r++)
      for (let c = rect.c; c < rect.c + rect.w; c++)
        if (covered.has(`${r},${c}`)) return false;
    return true;
  }

  /* ── Place / remove ── */
  function tryPlace(rect: Rect) {
    const inside = cluesInside(rect);
    const valid =
      rectIsFree(rect) &&
      inside.length === 1 &&
      inside[0].area === rect.w * rect.h &&
      inside[0].shape === shapeOf(rect.w, rect.h);

    if (!valid) {
      setWrongFlash(true);
      playWrong();
      setTimeout(() => setWrongFlash(false), 500);
      return;
    }

    const newPatches = [...patches, { ...rect, colorIdx: patches.length % PATCH_COLORS.length }];
    setPatches(newPatches);
    playCorrect();

    const total = newPatches.reduce((s, p) => s + p.w * p.h, 0);
    if (total === level.size * level.size) {
      setTimeout(() => {
        playCelebrate();
        setWon(true);
        setCompletedLevels(prev => new Set(prev).add(levelIdx));
      }, 200);
    }
  }

  function removePatchAt(r: number, c: number) {
    const idx = covered.get(`${r},${c}`);
    if (idx === undefined) return;
    setPatches(prev => prev.filter((_, i) => i !== idx));
    playClick();
  }

  /* ── Pointer events ── */
  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (won) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const cell = getCellAt(e.clientX, e.clientY);
    if (!cell) return;
    anchor.current = cell;
    if (!covered.has(`${cell[0]},${cell[1]}`)) {
      setPreview({ r: cell[0], c: cell[1], w: 1, h: 1 });
    }
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (won || !anchor.current) return;
    const cell = getCellAt(e.clientX, e.clientY);
    if (!cell) return;
    if (covered.has(`${anchor.current[0]},${anchor.current[1]}`)) return; // drag from a patch → ignore
    setPreview(rectFrom(anchor.current, cell));
  }

  function onPointerUp() {
    const a = anchor.current;
    anchor.current = null;
    const rect = preview;
    setPreview(null);
    if (won || !a) return;

    // Tap on an existing patch removes it
    if (covered.has(`${a[0]},${a[1]}`)) {
      removePatchAt(a[0], a[1]);
      return;
    }
    if (rect) tryPlace(rect);
  }

  /* ── Render ── */
  return (
    <div className="flex flex-col items-center gap-3 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <KidEmoji emoji="🧵" size={28} />
          <span className="font-bold text-xl text-gray-800">Petice</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            level.label === "Ușor" ? "bg-green-100 text-green-700"
            : level.label === "Mediu" ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
          }`}>{level.label}</span>
          <button
            className="text-sm font-semibold text-teal-600 hover:text-teal-800 px-2 py-1 rounded-lg hover:bg-teal-50 transition"
            onClick={() => { playClick(); setShowLevelPicker(p => !p); }}
          >
            Nivel {level.id}/{LEVELS.length}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center max-w-sm">
        Trage pe grilă ca să creezi un petic. Fiecare petic acoperă exact un
        indiciu: numărul = câte pătrățele, iar forma trebuie să fie{" "}
        <strong>■ pătrat</strong>, <strong>▬ lat</strong> sau <strong>▮ înalt</strong>.
        Atinge un petic ca să-l ștergi.
      </p>

      {/* Level picker */}
      {showLevelPicker && (
        <div className="w-full max-w-lg bg-white border border-teal-100 rounded-2xl p-3 shadow-lg">
          <div className="grid grid-cols-9 gap-1">
            {LEVELS.map((lv, i) => {
              const colors = i < 6
                ? "bg-green-100 hover:bg-green-200 text-green-800"
                : i < 12
                ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                : "bg-red-100 hover:bg-red-200 text-red-800";
              return (
                <button
                  key={i}
                  onClick={() => loadLevel(i)}
                  className={`relative w-9 h-9 rounded-lg text-xs font-bold transition ${colors} ${i === levelIdx ? "ring-2 ring-teal-500" : ""}`}
                >
                  {lv.id}
                  {completedLevels.has(i) && <span className="absolute -top-0.5 -right-0.5 text-[8px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={`rounded-2xl overflow-hidden shadow-lg border-2 transition-all bg-white ${wrongFlash ? "border-red-400 shadow-red-200" : "border-gray-200"}`}>
        <svg
          ref={svgRef}
          width={gridPx}
          height={gridPx}
          viewBox={`0 0 ${gridPx} ${gridPx}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: "none", cursor: won ? "default" : "crosshair" }}
        >
          {/* Cell grid lines */}
          {Array.from({ length: level.size }, (_, r) =>
            Array.from({ length: level.size }, (_, c) => (
              <rect
                key={`bg-${r}-${c}`}
                x={c * cellPx} y={r * cellPx}
                width={cellPx} height={cellPx}
                fill="white" stroke="#e5e7eb" strokeWidth={1}
              />
            ))
          )}

          {/* Placed patches */}
          {patches.map((p, i) => {
            const [fill, stroke] = PATCH_COLORS[p.colorIdx];
            return (
              <rect
                key={`p-${i}`}
                x={p.c * cellPx + 2} y={p.r * cellPx + 2}
                width={p.w * cellPx - 4} height={p.h * cellPx - 4}
                rx={8}
                fill={fill} stroke={stroke} strokeWidth={2.5}
                opacity={0.9}
              />
            );
          })}

          {/* Preview rectangle while dragging */}
          {preview && (
            <rect
              x={preview.c * cellPx + 2} y={preview.r * cellPx + 2}
              width={preview.w * cellPx - 4} height={preview.h * cellPx - 4}
              rx={8}
              fill="#99f6e4" stroke="#14b8a6" strokeWidth={2.5}
              strokeDasharray="6 4" opacity={0.65}
            />
          )}

          {/* Clues (always on top) */}
          {level.clues.map((cl, i) => {
            const cx = cl.c * cellPx + cellPx / 2;
            const cy = cl.r * cellPx + cellPx / 2;
            const done = covered.has(`${cl.r},${cl.c}`);
            return (
              <g key={`cl-${i}`} style={{ pointerEvents: "none" }}>
                <circle cx={cx} cy={cy} r={cellPx * 0.32} fill={done ? "white" : "#f0fdfa"} stroke={done ? "#9ca3af" : "#14b8a6"} strokeWidth={2} />
                <text
                  x={cx} y={cy - cellPx * 0.02}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={cellPx * 0.26} fontWeight="bold"
                  fill={done ? "#6b7280" : "#0f766e"}
                >
                  {cl.area}
                </text>
                <text
                  x={cx} y={cy + cellPx * 0.19}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={cellPx * 0.14}
                  fill={done ? "#9ca3af" : "#0d9488"}
                >
                  {SHAPE_GLYPH[cl.shape]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{covered.size}/{level.size * level.size} pătrățele</span>
          <span>{patches.length}/{level.clues.length} petice</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all bg-teal-500"
            style={{ width: `${(covered.size / (level.size * level.size)) * 100}%` }}
          />
        </div>
      </div>

      {/* Buttons / win */}
      {!won ? (
        <button
          onClick={resetLevel}
          disabled={patches.length === 0}
          className="flex items-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 font-semibold rounded-xl transition text-sm"
        >
          <KidEmoji emoji="🔄" size={16} /> Resetare
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl font-extrabold text-teal-600 flex items-center gap-2">
            <KidEmoji emoji="🎉" size={32} /> Bravo! Grila e acoperită!
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetLevel}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
            >
              Joacă din nou
            </button>
            {levelIdx < LEVELS.length - 1 && (
              <button
                onClick={() => loadLevel(levelIdx + 1)}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition"
              >
                Nivel {levelIdx + 2} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
