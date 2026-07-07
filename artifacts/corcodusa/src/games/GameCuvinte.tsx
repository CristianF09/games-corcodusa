import { useState, useRef } from "react";
import { playClick, playCelebrate, playCorrect, playWrong } from "@/lib/sfx";
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

/* ─── Word categories ──────────────────────────────────────── */
const CATEGORIES = {
  animale: {
    label: "Animale", emoji: "🐾", color: "#22c55e", bg: "#f0fdf4",
    easy:   ["URS", "LUP", "CAL", "RAȚĂ", "VACĂ"],
    medium: ["URS", "LUP", "CAL", "OAIE", "RAȚĂ", "CÂINE", "CAPRĂ"],
    hard:   ["CÂINE", "PISICĂ", "VULPE", "IEPURE", "CAPRĂ", "URS", "RAȚĂ", "OAIE", "CAL"],
  },
  fructe: {
    label: "Fructe", emoji: "🍎", color: "#f97316", bg: "#fff7ed",
    easy:   ["MĂR", "PAR", "PRUNĂ", "KIWI", "CAISĂ"],
    medium: ["MĂR", "PAR", "PRUNĂ", "KIWI", "CAISĂ", "MANGO", "BANANĂ"],
    hard:   ["MĂR", "PRUNĂ", "KIWI", "CAISĂ", "MANGO", "BANANĂ", "LĂMÂIE", "ANANAS", "PEPENE"],
  },
  legume: {
    label: "Legume", emoji: "🥕", color: "#84cc16", bg: "#f7fee7",
    easy:   ["MORCOV", "ROȘIE", "ARDEI", "CEAPĂ", "VARZĂ"],
    medium: ["MORCOV", "ROȘIE", "ARDEI", "CEAPĂ", "VARZĂ", "SALATĂ", "MAZĂRE"],
    hard:   ["MORCOV", "ROȘIE", "ARDEI", "CEAPĂ", "VARZĂ", "SALATĂ", "MAZĂRE", "FASOLE", "SPANAC"],
  },
  obiecte: {
    label: "Obiecte", emoji: "🧸", color: "#3b82f6", bg: "#eff6ff",
    easy:   ["MASĂ", "SCAUN", "CARTE", "PERNĂ", "CEAS"],
    medium: ["MASĂ", "SCAUN", "CARTE", "PERNĂ", "CEAS", "LAMPĂ", "CREION"],
    hard:   ["MASĂ", "SCAUN", "CARTE", "PERNĂ", "CEAS", "LAMPĂ", "CREION", "OGLINDĂ", "GEANTĂ"],
  },
  spatiu: {
    label: "Spațiu", emoji: "🚀", color: "#a855f7", bg: "#faf5ff",
    easy:   ["SOARE", "LUNĂ", "STEA", "METEOR", "COSMOS"],
    medium: ["SOARE", "LUNĂ", "STEA", "METEOR", "COSMOS", "RACHETĂ", "PLANETĂ"],
    hard:   ["SOARE", "LUNĂ", "STEA", "METEOR", "COSMOS", "RACHETĂ", "PLANETĂ", "GALAXIE", "ORBITĂ"],
  },
} as const;

type CatKey = keyof typeof CATEGORIES;
type DiffId = "easy" | "medium" | "hard";

const DIFFS: { id: DiffId; label: string; stars: string; size: number }[] = [
  { id: "easy",   label: "Ușor",  stars: "⭐",     size: 8  },
  { id: "medium", label: "Mediu", stars: "⭐⭐",   size: 10 },
  { id: "hard",   label: "Greu",  stars: "⭐⭐⭐", size: 12 },
];

/* ─── Romanian filler letters ──────────────────────────────── */
const FILLERS = "ABCDEFGHIJKLMNOPRSTUVXZĂÂÎȘȚ".split("");

function rndLetter() { return FILLERS[Math.floor(Math.random() * FILLERS.length)]; }
function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

/* ─── Word placement ───────────────────────────────────────── */
interface Placement { word: string; cells: [number,number][] }

function buildGrid(words: readonly string[], size: number): { grid: string[][]; placements: Placement[] } {
  const grid: string[][] = Array.from({ length: size }, () => new Array(size).fill(""));
  const placements: Placement[] = [];
  const DIRS: [number,number][] = [[0,1],[1,0],[0,-1],[-1,0]]; // H-fwd, V-fwd, H-bwd, V-bwd

  for (const word of shuffle([...words])) {
    let placed = false;
    for (let attempt = 0; attempt < 120 && !placed; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const maxR = dr === 1 ? size - word.length : dr === -1 ? size - 1 : size - 1;
      const maxC = dc === 1 ? size - word.length : dc === -1 ? size - 1 : size - 1;
      const minR = dr === -1 ? word.length - 1 : 0;
      const minC = dc === -1 ? word.length - 1 : 0;
      if (maxR < minR || maxC < minC) continue;
      const r0 = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const c0 = minC + Math.floor(Math.random() * (maxC - minC + 1));

      // Check cells
      let ok = true;
      const cells: [number,number][] = [];
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { ok = false; break; }
        const existing = grid[r][c];
        if (existing !== "" && existing !== word[i]) { ok = false; break; }
        cells.push([r, c]);
      }
      if (!ok) continue;

      for (let i = 0; i < word.length; i++) {
        grid[cells[i][0]][cells[i][1]] = word[i];
      }
      placements.push({ word, cells });
      placed = true;
    }
  }

  // Fill empties
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === "") grid[r][c] = rndLetter();

  return { grid, placements };
}

/* ─── Cell size ─────────────────────────────────────────────── */
function calcCellSize(size: number): number {
  const maxW = typeof window !== "undefined" ? Math.min(480, window.innerWidth - 32) : 360;
  return Math.max(24, Math.floor(maxW / size));
}

/* ─── Main component ────────────────────────────────────────── */
export default function GameCuvinte() {
  const [phase, setPhase] = useState<"menu" | "playing" | "won">("menu");
  const [catKey, setCatKey] = useState<CatKey>("animale");
  const [diffId, setDiffId] = useState<DiffId>("easy");
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selCells, setSelCells] = useState<[number,number][]>([]);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [cellSize, setCellSize] = useState(36);

  const gridRef = useRef<HTMLDivElement>(null);
  const dragAnchor = useRef<[number,number] | null>(null);

  const diff = DIFFS.find(d => d.id === diffId)!;
  const cat = CATEGORIES[catKey];
  const words = cat[diffId] as readonly string[];

  function startGame() {
    const { grid: g, placements: p } = buildGrid(words, diff.size);
    setCellSize(calcCellSize(diff.size));
    setGrid(g);
    setPlacements(p);
    setFound(new Set());
    setFoundCells(new Set());
    setSelCells([]);
    dragAnchor.current = null;
    setFlash(null);
    setPhase("playing");
    playClick();
  }

  function cellKey(r: number, c: number) { return `${r},${c}`; }

  /* ── Drag selection (Wend-style): trage peste litere, linia se
     evidențiază live, la ridicarea degetului se verifică cuvântul ── */
  function cellAt(clientX: number, clientY: number): [number,number] | null {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const c = Math.floor(((clientX - rect.left) / rect.width) * diff.size);
    const r = Math.floor(((clientY - rect.top) / rect.height) * diff.size);
    if (r < 0 || r >= diff.size || c < 0 || c >= diff.size) return null;
    return [r, c];
  }

  // Straight line from anchor toward cur, snapped to the dominant axis
  function lineCells(anchor: [number,number], cur: [number,number]): [number,number][] {
    const [r1,c1] = anchor;
    let [r2,c2] = cur;
    const dr = r2 - r1, dc = c2 - c1;
    if (Math.abs(dr) >= Math.abs(dc)) c2 = c1; else r2 = r1;
    const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
    const stepR = r2 === r1 ? 0 : r2 > r1 ? 1 : -1;
    const stepC = c2 === c1 ? 0 : c2 > c1 ? 1 : -1;
    return Array.from({ length: len }, (_, i) => [r1 + stepR * i, c1 + stepC * i] as [number,number]);
  }

  function onGridPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "playing") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell) return;
    dragAnchor.current = cell;
    setSelCells([cell]);
    playClick();
  }

  function onGridPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "playing" || !dragAnchor.current) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell) return;
    setSelCells(lineCells(dragAnchor.current, cell));
  }

  function onGridPointerUp() {
    if (!dragAnchor.current) return;
    const cells = selCells;
    dragAnchor.current = null;
    setSelCells([]);
    if (cells.length < 2) return; // simple tap — nothing to check

    const word = cells.map(([r,c]) => grid[r]?.[c] ?? "").join("");
    const reversed = [...word].reverse().join("");
    const match = placements.find(
      p => (p.word === word || p.word === reversed) && !found.has(p.word)
    );
    if (match) {
      const newFound = new Set(found);
      newFound.add(match.word);
      const newFoundCells = new Set(foundCells);
      match.cells.forEach(([r,c]) => newFoundCells.add(cellKey(r,c)));
      setFound(newFound);
      setFoundCells(newFoundCells);
      playCorrect();
      setFlash("correct");
      setTimeout(() => setFlash(null), 600);
      if (newFound.size === placements.length) {
        setTimeout(() => { setPhase("won"); playCelebrate(); }, 500);
      }
    } else {
      playWrong();
      setFlash("wrong");
      setTimeout(() => setFlash(null), 400);
    }
  }

  /* ── Menu ── */
  if (phase === "menu") return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🔍</div>
        <h2 className="text-2xl font-black text-[#1F2937]">Caută Cuvinte</h2>
        <p className="text-sm text-[#6B7280] mt-1">Găsește cuvintele ascunse în grilă!</p>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Categorie</p>
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(CATEGORIES) as [CatKey, typeof CATEGORIES[CatKey]][]).map(([key, c]) => (
            <button key={key} onClick={() => setCatKey(key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                catKey === key ? "border-[#FF6B00] bg-orange-50 scale-105" : "border-transparent bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[10px] font-semibold text-[#374151] text-center leading-tight">{c.label}</span>
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
                diffId === d.id ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]" : "border-gray-200 bg-white text-[#374151] hover:border-gray-300"
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
        Pornește! 🔍
      </button>
    </div>
  );

  /* ── Won ── */
  if (phase === "won") return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[420px] justify-center">
      <Confetti />
      <KidEmoji emoji="🏆" size={80} />
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#1F2937]">Felicitări! 🎉</h2>
        <p className="text-[#6B7280] mt-2">Ai găsit toate <strong>{placements.length}</strong> cuvinte!</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {placements.map(p => (
          <span key={p.word} className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ background: cat.color }}>
            {p.word}
          </span>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setPhase("menu")}
          className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-[#374151] hover:border-gray-300"
        >← Meniu</button>
        <button onClick={startGame}
          className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black rounded-xl shadow-lg hover:shadow-xl active:scale-95"
        >Din nou! 🔄</button>
      </div>
    </div>
  );

  /* ── Playing ── */
  const fontSize = Math.max(10, Math.floor(cellSize * 0.52));

  return (
    <div className="flex flex-col items-center gap-4 p-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[520px]">
        <button onClick={() => setPhase("menu")} className="text-xs text-gray-400 hover:text-gray-600">← Meniu</button>
        <span className="text-sm font-bold" style={{ color: cat.color }}>
          {cat.emoji} {cat.label} · {found.size}/{placements.length}
        </span>
      </div>

      {/* Flash feedback */}
      {flash && (
        <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${
          flash === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}>
          {flash === "correct" ? "✓ Corect!" : "✗ Încearcă altceva"}
        </div>
      )}

      {/* Grid — drag across letters to select a word */}
      <div
        ref={gridRef}
        onPointerDown={onGridPointerDown}
        onPointerMove={onGridPointerMove}
        onPointerUp={onGridPointerUp}
        onPointerCancel={onGridPointerUp}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${diff.size}, ${cellSize}px)`,
          border: `2px solid ${cat.color}`,
          borderRadius: 8,
          backgroundColor: cat.bg,
          overflow: "hidden",
          touchAction: "none",
          cursor: "pointer",
        }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = cellKey(r, c);
            const isFoundCell = foundCells.has(key);
            const isSelected = selCells.some(([sr, sc]) => sr === r && sc === c);
            return (
              <div
                key={key}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize,
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  backgroundColor: isSelected
                    ? "#fde047"
                    : isFoundCell
                    ? cat.color + "33"
                    : "transparent",
                  color: isFoundCell && !isSelected ? cat.color : "#1F2937",
                  borderRight: c < diff.size - 1 ? "1px solid #e5e7eb" : "none",
                  borderBottom: r < diff.size - 1 ? "1px solid #e5e7eb" : "none",
                  transition: "background-color 0.1s",
                  userSelect: "none",
                }}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Word list — found words get a checkmark */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm px-2">
        {placements.map(p => {
          const isFound = found.has(p.word);
          return (
            <span
              key={p.word}
              className="px-3 py-1 rounded-full text-sm font-bold transition-all inline-flex items-center gap-1"
              style={{
                background: isFound ? cat.color : "#F3F4F6",
                color: isFound ? "white" : "#6B7280",
              }}
            >
              {isFound && <span aria-hidden>✓</span>}
              <span style={{ textDecoration: isFound ? "line-through" : "none" }}>{p.word}</span>
            </span>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400">
        {selCells.length > 1
          ? selCells.map(([r,c]) => grid[r]?.[c] ?? "").join("")
          : "Trage cu degetul peste litere ca să selectezi un cuvânt"}
      </p>
    </div>
  );
}
