import { useState, useRef, useCallback, useMemo } from "react";
import { playClick, playCelebrate, playCorrect, playWrong } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";

// ─── Types ───────────────────────────────────────────────────────────────────

type Cell = [number, number]; // [row, col]

interface Level {
  id: number;
  rows: number;
  cols: number;
  waypoints: Cell[];   // in-order checkpoints; player must visit them in order
  solution: Cell[];    // full Hamiltonian path (rows×cols cells)
  color: string;       // tube stroke color
  bgColor: string;     // grid background
  label: string;       // difficulty label
}

// ─── Path generators (deterministic, O(n), always fill every cell) ───────────

function snakeH(rows: number, cols: number): Cell[] {
  const path: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 0) for (let c = 0; c < cols; c++) path.push([r, c]);
    else for (let c = cols - 1; c >= 0; c--) path.push([r, c]);
  }
  return path;
}

function snakeV(rows: number, cols: number): Cell[] {
  const path: Cell[] = [];
  for (let c = 0; c < cols; c++) {
    if (c % 2 === 0) for (let r = 0; r < rows; r++) path.push([r, c]);
    else for (let r = rows - 1; r >= 0; r--) path.push([r, c]);
  }
  return path;
}

function spiral(rows: number, cols: number): Cell[] {
  const path: Cell[] = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) path.push([top, c]);
    top++;
    for (let r = top; r <= bottom; r++) path.push([r, right]);
    right--;
    if (top <= bottom) { for (let c = right; c >= left; c--) path.push([bottom, c]); bottom--; }
    if (left <= right) { for (let r = bottom; r >= top; r--) path.push([r, left]); left++; }
  }
  return path;
}

/** Pick evenly-spaced waypoints from path, always including first and last */
function pickWaypoints(path: Cell[], count: number): Cell[] {
  if (count <= 2) return [path[0], path[path.length - 1]];
  const wps: Cell[] = [path[0]];
  const step = (path.length - 1) / (count - 1);
  for (let i = 1; i < count - 1; i++) {
    wps.push(path[Math.round(i * step)]);
  }
  wps.push(path[path.length - 1]);
  return wps;
}

// ─── Level definitions ────────────────────────────────────────────────────────

// [rows, cols, nWaypoints, pattern(0=snakeH,1=snakeV,2=spiral)]
const CONFIGS: [number, number, number, number][] = [
  // Easy 1-10
  [4, 4, 4, 0], [4, 4, 4, 1], [4, 5, 4, 2], [4, 5, 5, 0], [5, 5, 5, 1],
  [5, 5, 5, 2], [5, 5, 5, 0], [5, 6, 5, 1], [5, 6, 6, 2], [6, 5, 5, 0],
  // Medium 11-20
  [6, 6, 6, 1], [6, 6, 6, 2], [6, 6, 6, 0], [6, 6, 7, 1], [6, 6, 7, 2],
  [6, 7, 7, 0], [6, 7, 7, 1], [7, 6, 7, 2], [7, 6, 7, 0], [7, 7, 8, 1],
  // Hard 21-30
  [7, 7, 8, 2], [7, 7, 9, 0], [7, 7, 9, 1], [7, 8, 9, 2], [8, 7, 9, 0],
  [8, 7, 10, 1], [8, 8, 10, 2], [8, 8, 10, 0], [8, 8, 11, 1], [8, 8, 12, 2],
];

// Gradient color pairs [tubeColor, bgColor]
const PALETTES: [string, string][] = [
  ["#a855f7", "#f3e8ff"], ["#3b82f6", "#dbeafe"], ["#ec4899", "#fce7f3"],
  ["#10b981", "#d1fae5"], ["#f59e0b", "#fef3c7"], ["#06b6d4", "#cffafe"],
  ["#8b5cf6", "#ede9fe"], ["#ef4444", "#fee2e2"], ["#14b8a6", "#ccfbf1"],
  ["#f97316", "#ffedd5"],
];

const DIFFICULTY_LABELS = ["Ușor", "Mediu", "Greu"];

function buildLevel(idx: number): Level {
  const [rows, cols, nWP, pat] = CONFIGS[idx];
  const gens = [snakeH, snakeV, spiral];
  const solution = gens[pat](rows, cols);
  const waypoints = pickWaypoints(solution, nWP);
  const diff = idx < 10 ? 0 : idx < 20 ? 1 : 2;
  const [color, bgColor] = PALETTES[idx % PALETTES.length];
  return { id: idx + 1, rows, cols, waypoints, solution, color, bgColor, label: DIFFICULTY_LABELS[diff] };
}

const LEVELS: Level[] = Array.from({ length: 30 }, (_, i) => buildLevel(i));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cellKey(c: Cell) { return `${c[0]},${c[1]}`; }

function isAdjacent(a: Cell, b: Cell) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DiffBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    "Ușor": "bg-green-100 text-green-700",
    "Mediu": "bg-yellow-100 text-yellow-700",
    "Greu": "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[label] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GameZipZap() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [drawnPath, setDrawnPath] = useState<Cell[]>([]);
  const [nextWpIdx, setNextWpIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  const svgRef = useRef<SVGSVGElement>(null);
  const level = LEVELS[levelIdx];

  // ─── Derived state ──────────────────────────────────────────────────────────
  const drawnSet = useMemo(() => new Set(drawnPath.map(cellKey)), [drawnPath]);
  const wpSet = useMemo(() => new Map(level.waypoints.map((c, i) => [cellKey(c), i + 1])), [level]);

  // Dead-end: last drawn cell has no unvisited adjacent neighbours (and puzzle not done)
  const isDeadEnd = useMemo(() => {
    if (drawnPath.length === 0 || won) return false;
    if (drawnPath.length === level.rows * level.cols) return false;
    const [lr, lc] = drawnPath[drawnPath.length - 1];
    return (
      [[0,1],[1,0],[0,-1],[-1,0]] as [number,number][]
    ).every(([dr, dc]) => {
      const nr = lr + dr, nc = lc + dc;
      return nr < 0 || nr >= level.rows || nc < 0 || nc >= level.cols || drawnSet.has(`${nr},${nc}`);
    });
  }, [drawnPath, drawnSet, level, won]);

  function resetLevel() {
    setDrawnPath([]);
    setNextWpIdx(0);
    setIsDrawing(false);
    setWon(false);
    setShowHint(false);
  }

  function loadLevel(idx: number) {
    setLevelIdx(idx);
    setDrawnPath([]);
    setNextWpIdx(0);
    setIsDrawing(false);
    setWon(false);
    setShowHint(false);
    setShowLevelPicker(false);
  }

  // ─── Cell under pointer ─────────────────────────────────────────────────────
  function getCellAt(clientX: number, clientY: number): Cell | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const c = Math.floor((x / rect.width) * level.cols);
    const r = Math.floor((y / rect.height) * level.rows);
    if (r < 0 || r >= level.rows || c < 0 || c >= level.cols) return null;
    return [r, c];
  }

  // ─── Try to extend path to cell ─────────────────────────────────────────────
  const tryExtend = useCallback((cell: Cell) => {
    const key = cellKey(cell);
    if (drawnSet.has(key)) return;
    if (drawnPath.length === 0) {
      // Must start from waypoint[0]
      if (cellKey(level.waypoints[0]) !== key) return;
      playClick();
      setDrawnPath([[...cell] as Cell]);
      setNextWpIdx(wpSet.get(key) ? 1 : 0);
      return;
    }
    const last = drawnPath[drawnPath.length - 1];
    if (!isAdjacent(last, cell)) return;

    // Check: if this cell is a waypoint, it must be the NEXT one
    const wpNum = wpSet.get(key);
    if (wpNum !== undefined) {
      const expectedWpNum = nextWpIdx + 1;
      if (wpNum !== expectedWpNum) {
        // Wrong order → flash error
        setWrongFlash(true);
        playWrong();
        setTimeout(() => setWrongFlash(false), 600);
        return;
      }
      // Correct waypoint hit!
      playCorrect();
    } else {
      playClick();
    }
    const newPath = [...drawnPath, [...cell] as Cell];
    const newNextWpIdx = wpNum !== undefined ? nextWpIdx + 1 : nextWpIdx;
    setDrawnPath(newPath);
    setNextWpIdx(newNextWpIdx);
    setShowHint(false);

    // Win check: all cells filled AND all waypoints visited
    if (newPath.length === level.rows * level.cols && newNextWpIdx === level.waypoints.length) {
      setTimeout(() => {
        playCelebrate();
        setWon(true);
        setCompletedLevels(prev => new Set(prev).add(levelIdx));
      }, 150);
    }
  }, [drawnPath, drawnSet, wpSet, nextWpIdx, level, levelIdx]);

  // ─── Undo ───────────────────────────────────────────────────────────────────
  function undo() {
    if (drawnPath.length === 0) return;
    playClick();
    const removed = drawnPath[drawnPath.length - 1];
    const removedKey = cellKey(removed);
    const wasWp = wpSet.get(removedKey);
    setDrawnPath(prev => prev.slice(0, -1));
    if (wasWp !== undefined) setNextWpIdx(prev => Math.max(0, prev - 1));
    setShowHint(false);
  }

  // ─── Hint ───────────────────────────────────────────────────────────────────
  function requestHint() {
    if (hintCooldown || won) return;
    setShowHint(true);
    setHintCooldown(true);
    setTimeout(() => { setShowHint(false); setHintCooldown(false); }, 2500);
  }

  // When path is empty → hint points to start dot (waypoint 1)
  // When in progress → hint points to next correct cell in solution
  const hintCell: Cell | null = showHint
    ? (drawnPath.length === 0 ? level.waypoints[0] : level.solution[drawnPath.length] ?? null)
    : null;

  // ─── SVG cell size ──────────────────────────────────────────────────────────
  const maxW = Math.min(480, typeof window !== "undefined" ? window.innerWidth - 32 : 480);
  const cellPx = Math.max(32, Math.floor(maxW / Math.max(level.cols, level.rows)));
  const gridW = cellPx * level.cols;
  const gridH = cellPx * level.rows;
  const CX = cellPx / 2; // center x of cell in SVG units
  const tubeW = cellPx * 0.72;

  // Path polyline points string
  function pathPoints() {
    return drawnPath.map(([r, c]) => `${c * cellPx + CX},${r * cellPx + CX}`).join(" ");
  }

  // ─── Pointer events on SVG ──────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (won) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const cell = getCellAt(e.clientX, e.clientY);
    if (cell) tryExtend(cell);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDrawing || won) return;
    const cell = getCellAt(e.clientX, e.clientY);
    if (cell) tryExtend(cell);
  }

  function onPointerUp() { setIsDrawing(false); }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <KidEmoji emoji="⚡" size={28} />
          <span className="font-bold text-xl text-gray-800">Zip Zap</span>
        </div>
        <div className="flex items-center gap-2">
          <DiffBadge label={level.label} />
          <button
            className="text-sm font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition"
            onClick={() => { playClick(); setShowLevelPicker(p => !p); }}
          >
            Nivel {level.id}/30
          </button>
        </div>
      </div>

      {/* Instructions / dead-end warning */}
      {isDeadEnd ? (
        <p className="text-sm font-semibold text-red-500 text-center max-w-xs animate-pulse">
          Blocat! Apasă Înapoi sau Resetare. <KidEmoji emoji="🚧" size={16} />
        </p>
      ) : (
        <p className="text-sm text-gray-500 text-center max-w-xs">
          {drawnPath.length === 0
            ? <>Atinge punctul <strong>1</strong> pentru a începe! <KidEmoji emoji="👆" size={16} /></>
            : <>Conectează punctele în ordine și umple tot grila! <KidEmoji emoji="🎯" size={16} /></>}
        </p>
      )}

      {/* Level picker */}
      {showLevelPicker && (
        <div className="w-full max-w-lg bg-white border border-purple-100 rounded-2xl p-3 shadow-lg">
          <div className="grid grid-cols-10 gap-1">
            {LEVELS.map((lv, i) => {
              const diff = i < 10 ? "easy" : i < 20 ? "medium" : "hard";
              const colors = { easy: "bg-green-100 hover:bg-green-200 text-green-800", medium: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800", hard: "bg-red-100 hover:bg-red-200 text-red-800" };
              const done = completedLevels.has(i);
              return (
                <button
                  key={i}
                  onClick={() => loadLevel(i)}
                  className={`relative w-8 h-8 rounded-lg text-xs font-bold transition ${colors[diff]} ${i === levelIdx ? "ring-2 ring-purple-500" : ""}`}
                >
                  {lv.id}
                  {done && <span className="absolute -top-0.5 -right-0.5 text-[8px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game grid */}
      <div
        className={`rounded-2xl overflow-hidden shadow-lg border-2 transition-all ${wrongFlash ? "border-red-400 shadow-red-200" : "border-gray-200"}`}
        style={{ background: level.bgColor }}
      >
        <svg
          ref={svgRef}
          width={gridW}
          height={gridH}
          viewBox={`0 0 ${gridW} ${gridH}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: "none", cursor: won ? "default" : "crosshair" }}
        >
          {/* Cell backgrounds */}
          {Array.from({ length: level.rows }, (_, r) =>
            Array.from({ length: level.cols }, (_, c) => (
              <rect
                key={`bg-${r}-${c}`}
                x={c * cellPx + 1}
                y={r * cellPx + 1}
                width={cellPx - 2}
                height={cellPx - 2}
                rx={4}
                fill={drawnSet.has(`${r},${c}`) ? level.color + "22" : "white"}
                stroke={drawnSet.has(`${r},${c}`) ? level.color + "44" : "#e5e7eb"}
                strokeWidth={1}
              />
            ))
          )}

          {/* Hint cell glow */}
          {hintCell && (
            <rect
              x={hintCell[1] * cellPx + 2}
              y={hintCell[0] * cellPx + 2}
              width={cellPx - 4}
              height={cellPx - 4}
              rx={6}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={3}
              strokeDasharray="4 2"
              opacity={0.9}
            />
          )}

          {/* Drawn tube path */}
          {drawnPath.length > 1 && (
            <polyline
              points={pathPoints()}
              fill="none"
              stroke={level.color}
              strokeWidth={tubeW}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* Current head dot */}
          {drawnPath.length > 0 && !won && (
            <circle
              cx={drawnPath[drawnPath.length - 1][1] * cellPx + CX}
              cy={drawnPath[drawnPath.length - 1][0] * cellPx + CX}
              r={cellPx * 0.28}
              fill={level.color}
              opacity={0.9}
            />
          )}

          {/* Start pulse ring — shown on waypoint 1 before drawing begins */}
          {drawnPath.length === 0 && (
            <circle
              cx={level.waypoints[0][1] * cellPx + CX}
              cy={level.waypoints[0][0] * cellPx + CX}
              r={cellPx * 0.44}
              fill="none"
              stroke={level.color}
              strokeWidth={2}
              opacity={0.5}
            >
              <animate attributeName="r" values={`${cellPx*0.38};${cellPx*0.52};${cellPx*0.38}`} dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Waypoint dots (always on top) */}
          {level.waypoints.map((wp, i) => {
            const key = cellKey(wp);
            const visited = drawnSet.has(key);
            const isNext = i === nextWpIdx && !visited;
            const cx = wp[1] * cellPx + CX;
            const cy = wp[0] * cellPx + CX;
            const r = cellPx * 0.32;
            return (
              <g key={`wp-${i}`}>
                {/* Glow ring on next waypoint */}
                {isNext && drawnPath.length > 0 && (
                  <circle cx={cx} cy={cy} r={r * 1.5} fill="none" stroke={level.color} strokeWidth={1.5} opacity={0.3}>
                    <animate attributeName="r" values={`${r*1.3};${r*1.8};${r*1.3}`} dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={cx} cy={cy} r={r} fill={visited ? level.color : "white"} stroke={level.color} strokeWidth={2.5} />
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={r * 1.1}
                  fontWeight="bold"
                  fill={visited ? "white" : level.color}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Win sparkles overlay */}
          {won && Array.from({ length: 12 }, (_, k) => {
            const angle = (k / 12) * Math.PI * 2;
            const dist = cellPx * 1.5;
            const cx = gridW / 2 + Math.cos(angle) * dist;
            const cy = gridH / 2 + Math.sin(angle) * dist;
            return (
              <text key={k} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={cellPx * 0.6}>
                {["⭐", "✨", "🌟", "💫"][k % 4]}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{drawnPath.length}/{level.rows * level.cols} celule</span>
          <span>Punct {Math.min(nextWpIdx, level.