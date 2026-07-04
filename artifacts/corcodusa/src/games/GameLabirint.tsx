import { useState, useEffect, useCallback, useRef } from "react";
import { playClick, playCelebrate, playSwap, playCorrect } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";

/* ─── Confetti ─────────────────────────────────────────────── */
function Confetti() {
  const PIECES = Array.from({ length: 24 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.7,
    color: ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#a855f7"][i % 6],
    size: 7 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.left}%`, top: "-14px", animationDelay: `${p.delay}s` }}>
          <div className="animate-bounce" style={{ width: p.size, height: p.size, background: p.color, borderRadius: "3px", transform: `rotate(${Math.random()*360}deg)` }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Types ────────────────────────────────────────────────── */
interface Cell { N: boolean; S: boolean; E: boolean; W: boolean }
interface Pos { r: number; c: number }
type Dir = "N" | "S" | "E" | "W";

/* ─── Themes ───────────────────────────────────────────────── */
const THEMES = {
  animale: { label: "Animale", emoji: "🐾", player: "🐰", goal: "🏠", wall: "#22c55e", bg: "#f0fdf4", hint: "#bbf7d0" },
  fructe:  { label: "Fructe",  emoji: "🍎", player: "🐝", goal: "🍎", wall: "#f97316", bg: "#fff7ed", hint: "#fed7aa" },
  legume:  { label: "Legume",  emoji: "🥕", player: "🐛", goal: "🥕", wall: "#84cc16", bg: "#f7fee7", hint: "#d9f99d" },
  obiecte: { label: "Obiecte", emoji: "🧸", player: "🤖", goal: "⭐", wall: "#3b82f6", bg: "#eff6ff", hint: "#bfdbfe" },
  spatiu:  { label: "Spațiu",  emoji: "🚀", player: "👨‍🚀", goal: "🪐", wall: "#a855f7", bg: "#faf5ff", hint: "#e9d5ff" },
} as const;
type ThemeKey = keyof typeof THEMES;

/* ─── Difficulties ─────────────────────────────────────────── */
const DIFFS = [
  { id: "easy"   as const, label: "Ușor",   stars: "⭐",       rows: 7,  cols: 7  },
  { id: "medium" as const, label: "Mediu",  stars: "⭐⭐",     rows: 11, cols: 11 },
  { id: "hard"   as const, label: "Greu",   stars: "⭐⭐⭐",   rows: 15, cols: 15 },
];
type DiffId = "easy" | "medium" | "hard";

/* ─── Maze generation (recursive backtracking) ─────────────── */
const OPPOSITE: Record<Dir, Dir> = { N: "S", S: "N", E: "W", W: "E" };
const DELTA: Record<Dir, [number, number]> = { N: [-1,0], S: [1,0], E: [0,1], W: [0,-1] };

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generateMaze(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ N: true, S: true, E: true, W: true }))
  );
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false) as boolean[]);

  function carve(r: number, c: number) {
    visited[r][c] = true;
    for (const dir of shuffle(["N","S","E","W"] as Dir[])) {
      const [dr, dc] = DELTA[dir];
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        grid[r][c][dir] = false;
        grid[nr][nc][OPPOSITE[dir]] = false;
        carve(nr, nc);
      }
    }
  }
  carve(0, 0);
  return grid;
}

/* ─── Cell size calculation ─────────────────────────────────── */
function calcCellSize(cols: number): number {
  const maxW = typeof window !== "undefined" ? Math.min(480, window.innerWidth - 48) : 360;
  return Math.max(20, Math.floor(maxW / cols));
}

/* ─── Format time ───────────────────────────────────────────── */
function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ─── Stars by moves ────────────────────────────────────────── */
function calcStars(moves: number, rows: number): number {
  const par = rows * rows * 0.7;
  if (moves <= par * 1.0) return 3;
  if (moves <= par * 1.6) return 2;
  return 1;
}

/* ─── Main component ────────────────────────────────────────── */
export default function GameLabirint() {
  const [phase, setPhase] = useState<"menu" | "playing" | "won">("menu");
  const [themeKey, setThemeKey] = useState<ThemeKey>("animale");
  const [diffId, setDiffId] = useState<DiffId>("easy");
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [pos, setPos] = useState<Pos>({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cellSize, setCellSize] = useState(48);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = DIFFS.find(d => d.id === diffId)!;
  const theme = THEMES[themeKey];

  function startGame() {
    const m = generateMaze(diff.rows, diff.cols);
    setCellSize(calcCellSize(diff.cols));
    setMaze(m);
    setPos({ r: 0, c: 0 });
    setMoves(0);
    setElapsed(0);
    setPhase("playing");
    playClick();
  }

  /* Timer */
  useEffect(() => {
    if (phase !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  /* Win check */
  useEffect(() => {
    if (phase === "playing" && pos.r === diff.rows - 1 && pos.c === diff.cols - 1) {
      setPhase("won");
      playCelebrate();
    }
  }, [pos, phase, diff]);

  /* Movement */
  const move = useCallback((dir: Dir) => {
    if (phase !== "playing") return;
    setPos(p => {
      const cell = maze[p.r]?.[p.c];
      if (!cell || cell[dir]) return p;
      const [dr, dc] = DELTA[dir];
      const nr = p.r + dr, nc = p.c + dc;
      if (nr < 0 || nr >= diff.rows || nc < 0 || nc >= diff.cols) return p;
      playSwap();
      setMoves(m => m + 1);
      return { r: nr, c: nc };
    });
  }, [phase, maze, diff]);

  /* Keyboard */
  useEffect(() => {
    const MAP: Record<string, Dir> = {
      ArrowUp: "N", ArrowDown: "S", ArrowLeft: "W", ArrowRight: "E",
      w: "N", s: "S", a: "W", d: "E",
    };
    const handler = (e: KeyboardEvent) => {
      if (MAP[e.key]) { e.preventDefault(); move(MAP[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  /* ── Menu ── */
  if (phase === "menu") return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🌀</div>
        <h2 className="text-2xl font-black text-[#1F2937]">Labirint</h2>
        <p className="text-sm text-[#6B7280] mt-1">Ajută personajul să găsească ieșirea din labirint!</p>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Temă</p>
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, t]) => (
            <button key={key} onClick={() => setThemeKey(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                themeKey === key
                  ? "border-[#FF6B00] bg-orange-50 scale-105"
                  : "border-transparent bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[10px] font-semibold text-[#374151] leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Dificultate</p>
        <div className="flex gap-2">
          {DIFFS.map(d => (
            <button key={d.id} onClick={() => setDiffId(d.id)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                diffId === d.id
                  ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                  : "border-gray-200 bg-white text-[#374151] hover:border-gray-300"
              }`}
            >
              <div>{d.label}</div>
              <div className="text-xs mt-0.5">{d.stars}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={startGame}
        className="px-10 py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        Pornește! 🚀
      </button>
    </div>
  );

  /* ── Won ── */
  if (phase === "won") {
    const stars = calcStars(moves, diff.rows);
    return (
      <div className="flex flex-col items-center gap-6 p-6 min-h-[420px] justify-center">
        <Confetti />
        <KidEmoji emoji="🎉" size={72} />
        <div className="text-center">
          <h2 className="text-3xl font-black text-[#1F2937]">Ai ieșit!</h2>
          <div className="text-3xl mt-2">{Array.from({length:stars}).map((_,i)=>"⭐").join("")}</div>
          <p className="text-[#6B7280] mt-3">
            <strong className="text-[#1F2937]">{moves}</strong> mișcări ·{" "}
            <strong className="text-[#1F2937]">{fmtTime(elapsed)}</strong> minute
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase("menu")}
            className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-[#374151] hover:border-gray-300 transition-all"
          >
            ← Meniu
          </button>
          <button onClick={startGame}
            className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            Din nou! 🔄
          </button>
        </div>
      </div>
    );
  }

  /* ── Playing ── */
  const wallPx = cellSize <= 28 ? 1.5 : 2;

  return (
    <div className="flex flex-col items-center gap-3 p-2 select-none">
      {/* Stats bar */}
      <div className="flex items-center justify-between w-full max-w-[520px] px-1">
        <button onClick={() => setPhase("menu")} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Meniu</button>
        <div className="flex items-center gap-4 text-sm font-bold text-[#374151]">
          <span>🏃 {moves}</span>
          <span>⏱ {fmtTime(elapsed)}</span>
          <span className="text-lg">{theme.player}</span>
        </div>
      </div>

      {/* Maze */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${diff.cols}, ${cellSize}px)`,
          backgroundColor: theme.bg,
          borderRadius: 10,
          boxShadow: `0 0 0 3px ${theme.wall}`,
        }}
      >
        {maze.flatMap((row, r) =>
          row.map((cell, c) => {
            const isPlayer = pos.r === r && pos.c === c;
            const isGoal = r === diff.rows - 1 && c === diff.cols - 1;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  /* Only render N and W walls to avoid 2× thick shared walls.
                     E wall only on last col, S wall only on last row. */
                  borderTop:    cell.N ? `${wallPx}px solid ${theme.wall}` : "none",
                  borderLeft:   cell.W ? `${wallPx}px solid ${theme.wall}` : "none",
                  borderRight:  (c === diff.cols - 1 && cell.E) ? `${wallPx}px solid ${theme.wall}` : "none",
                  borderBottom: (r === diff.rows - 1 && cell.S) ? `${wallPx}px solid ${theme.wall}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isPlayer ? theme.hint : "transparent",
                  fontSize: Math.floor(cellSize * 0.62),
                  lineHeight: 1,
                  transition: "background-color 0.08s",
                  cursor: "default",
                }}
              >
                {isGoal && !isPlayer && (
                  <span style={{ fontSize: Math.floor(cellSize * 0.58) }}>{theme.goal}</span>
                )}
                {isPlayer && (
                  <KidEmoji emoji={theme.player} size={Math.floor(cellSize * 0.8)} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* D-pad */}
      <div className="grid gap-1.5 mt-1" style={{ gridTemplateColumns: "repeat(3, 3rem)" }}>
        <div />
        <button onPointerDown={() => move("N")}
          className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl text-xl flex items-center justify-center shadow-sm active:bg-gray-100 active:scale-95 transition-all touch-none"
        >↑</button>
        <div />
        <button onPointerDown={() => move("W")}
          className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl text-xl flex items-center justify-center shadow-sm active:bg-gray-100 active:scale-95 transition-all touch-none"
        >←</button>
        <button onPointerDown={() => move("S")}
          className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl text-xl flex items-center justify-center shadow-sm active:bg-gray-100 active:scale-95 transition-all touch-none"
        >↓</button>
        <button onPointerDown={() => move("E")}
          className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl text-xl flex items-center justify-center shadow-sm active:bg-gray-100 active:scale-95 transition-all touch-none"
        >→</button>
      </div>
      <p className="text-[11px] text-gray-400">Tastatură: ↑ ↓ ← → sau W A S D</p>
    </div>
  );
}
