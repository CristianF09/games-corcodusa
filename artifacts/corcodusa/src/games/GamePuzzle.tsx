import { useState } from "react";
import { playClick, playSwap, playCelebrate } from "@/lib/sfx";

/* ─── Confetti ────────────────────────────────────────────── */
function Confetti() {
  const PIECES = Array.from({ length: 22 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.6,
    color: ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b"][i % 5], size: 6 + Math.random() * 7,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.left}%`, top: "-12px", animationDelay: `${p.delay}s` }}>
          <div className="animate-bounce" style={{ width: p.size, height: p.size, background: p.color, borderRadius: "2px", transform: `rotate(${Math.random()*360}deg)` }} />
        </div>
      ))}
    </div>
  );
}

const GRIDS = [
  { id: "2x2", label: "2×2", cols: 2, rows: 2 },
  { id: "3x3", label: "3×3", cols: 3, rows: 3 },
  { id: "4x4", label: "4×4", cols: 4, rows: 4 },
];

const THEMES: Record<string, { label: string; emoji: string; grid: string[][] }> = {
  jungle: {
    label: "Junglă", emoji: "🌴",
    grid: [
      ["🦁","🐯","🐘","🦒"],
      ["🦊","🦓","🦏","🐆"],
      ["🐊","🦛","🐒","🦥"],
      ["🌴","🌿","🍃","🌺"],
    ],
  },
  ocean: {
    label: "Ocean", emoji: "🌊",
    grid: [
      ["🐳","🐬","🦈","🐙"],
      ["🦑","🐠","🦀","🐡"],
      ["🐟","🦞","🦐","🐚"],
      ["🌊","🐋","🦦","🦭"],
    ],
  },
  space: {
    label: "Spațiu", emoji: "🚀",
    grid: [
      ["🚀","⭐","🌙","☀️"],
      ["🪐","🌍","🌟","☄️"],
      ["🛸","👨‍🚀","🔭","🌌"],
      ["💫","🌠","🛰️","🪨"],
    ],
  },
  farm: {
    label: "Fermă", emoji: "🚜",
    grid: [
      ["🐄","🐷","🐔","🐑"],
      ["🐴","🦆","🐇","🐐"],
      ["🌾","🌻","🥕","🌽"],
      ["🚜","🏡","🌳","🌸"],
    ],
  },
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

interface PieceState { id: number; emoji: string; correctPos: number; currentPos: number }

function createPuzzle(themeKey: string, cols: number, rows: number): PieceState[] {
  const theme = THEMES[themeKey];
  const pieces: string[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pieces.push(theme.grid[r][c]);
  const shuffled = shuffle(pieces.map((emoji, id) => ({ id, emoji, correctPos: id, currentPos: id })));
  return shuffled.map((p, i) => ({ ...p, currentPos: i }));
}

function isSolved(pieces: PieceState[]) {
  return pieces.every(p => p.correctPos === p.currentPos);
}

export default function GamePuzzle() {
  const [themeKey, setThemeKey] = useState("jungle");
  const [gridId, setGridId] = useState("3x3");
  const grid = GRIDS.find(g => g.id === gridId)!;

  const [pieces, setPieces] = useState(() => createPuzzle("jungle", 3, 3));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [bestMoves, setBestMoves] = useState<Record<string, number>>({});
  const [hints, setHints] = useState(3);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  function restart(t = themeKey, g = gridId) {
    const gr = GRIDS.find(x => x.id === g)!;
    setPieces(createPuzzle(t, gr.cols, gr.rows));
    setSelected(null); setMoves(0); setWon(false); setHints(3); setHighlighted(null); setCelebrate(false);
  }

  function changeTheme(t: string) { setThemeKey(t); restart(t, gridId); }
  function changeGrid(g: string) { setGridId(g); restart(themeKey, g); }

  function handleTile(pos: number) {
    if (won) return;
    if (selected === null) { playClick(); setSelected(pos); return; }
    if (selected === pos) { setSelected(null); return; }

    const next = [...pieces];
    const aIdx = next.findIndex(p => p.currentPos === selected);
    const bIdx = next.findIndex(p => p.currentPos === pos);
    next[aIdx] = { ...next[aIdx], currentPos: pos };
    next[bIdx] = { ...next[bIdx], currentPos: selected };
    setPieces(next);
    setMoves(m => m + 1);
    setSelected(null);
    playSwap();

    if (isSolved(next)) {
      playCelebrate();
      setCelebrate(true);
      setWon(true);
      const key = `${themeKey}-${gridId}`;
      setBestMoves(prev => ({ ...prev, [key]: Math.min(moves + 1, prev[key] ?? Infinity) }));
    }
  }

  function useHint() {
    if (hints === 0) return;
    const wrong = pieces.filter(p => p.correctPos !== p.currentPos);
    if (wrong.length === 0) return;
    playClick();
    const pick = wrong[Math.floor(Math.random() * wrong.length)];
    setHighlighted(pick.currentPos);
    setHints(h => h - 1);
    setTimeout(() => setHighlighted(null), 2000);
  }

  const bestKey = `${themeKey}-${gridId}`;
  const solved = pieces.filter(p => p.correctPos === p.currentPos).length;
  const total = grid.cols * grid.rows;

  // Build display grid
  const displayGrid = Array.from({ length: total }, (_, pos) =>
    pieces.find(p => p.currentPos === pos)!
  );

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {celebrate && <Confetti />}
      {/* Theme & grid selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {Object.entries(THEMES).map(([k, t]) => (
          <button key={k} onClick={() => changeTheme(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${themeKey === k ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <div className="flex gap-2">
          {GRIDS.map(g => (
            <button key={g.id} onClick={() => changeGrid(g.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${gridId === g.id ? "bg-secondary text-secondary-foreground border-secondary shadow" : "bg-muted text-muted-foreground border-muted"}`}>
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-sm font-bold text-muted-foreground">
          <span>✅ {solved}/{total}</span>
          <span>🔄 {moves}</span>
          {bestMoves[bestKey] && <span className="text-primary">🏆 {bestMoves[bestKey]}</span>}
        </div>
        <button onClick={useHint} disabled={hints === 0}
          className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${hints > 0 ? "bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200" : "opacity-30 border-muted"}`}>
          💡 {hints} indicii
        </button>
      </div>

      {/* Reference image */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-muted-foreground">Modelul:</p>
        <div className="grid gap-0.5 rounded-xl overflow-hidden border-2 border-dashed border-primary/30"
          style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: total }, (_, i) => pieces.find(p => p.correctPos === i)!).map((p, i) => (
            <div key={i} className="flex items-center justify-center bg-primary/5 text-xl"
              style={{ width: 36, height: 36 }}>
              {p.emoji}
            </div>
          ))}
        </div>
      </div>

      {won ? (
        <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-500 py-4">
          <div className="text-7xl animate-bounce">🏆</div>
          <div className="text-2xl font-display font-bold text-green-600">Puzzle rezolvat!</div>
          <p className="text-muted-foreground">{moves} mutări{bestMoves[bestKey] === moves ? " 🎉 Record nou!" : ""}</p>
          <button onClick={() => restart()} className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:-translate-y-1 transition-all">
            Joacă din nou
          </button>
        </div>
      ) : (
        <>
          {selected !== null && <p className="text-sm text-muted-foreground">Acum apasă pe poziția cu care vrei să schimbi!</p>}
          {selected === null && <p className="text-sm text-muted-foreground">Apasă pe o piesă ca să o selectezi!</p>}
          <div className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}>
            {displayGrid.map((piece, pos) => {
              const isCorrect = piece.correctPos === pos;
              const isSelected = selected === pos;
              const isHighlighted = highlighted === pos;
              const sz = gridId === "4x4" ? 68 : gridId === "3x3" ? 80 : 100;
              return (
                <button key={pos} onClick={() => handleTile(pos)}
                  className={`flex items-center justify-center rounded-2xl border-3 transition-all duration-200 font-bold shadow-md
                    ${isSelected ? "border-primary bg-primary/10 scale-110 shadow-xl ring-4 ring-primary/30" :
                      isCorrect ? "border-green-400 bg-green-50 scale-95" :
                      isHighlighted ? "border-yellow-400 bg-yellow-50 scale-105 ring-2 ring-yellow-300 animate-pulse" :
                      "border-border bg-white hover:border-primary/50 hover:scale-105 hover:shadow-lg cursor-pointer"}
                  `}
                  style={{ width: sz, height: sz, fontSize: sz * 0.44 }}>
                  {piece.emoji}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
