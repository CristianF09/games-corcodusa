import { useState, useCallback } from "react";

const PUZZLES = [
  {
    name: "Pisicuța", emoji: "🐱",
    pieces: ["🐱😸","😻🙀","😺😼","😽🐈"],
  },
  {
    name: "Jungle", emoji: "🌴",
    pieces: ["🦁🐯","🐘🦒","🐊🦏","🦓🐆"],
  },
  {
    name: "Fermă", emoji: "🚜",
    pieces: ["🐄🐷","🐔🐑","🐴🐐","🦆🐇"],
  },
  {
    name: "Ocean", emoji: "🌊",
    pieces: ["🐳🐬","🦈🐙","🦑🐠","🦀🐡"],
  },
];

const GRID_SIZE = 4; // 2x2 pieces, each shows 2 emoji

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface PieceState { id: number; content: string; correct: number }

function createPuzzle(puzzleIdx: number): PieceState[] {
  const pieces = PUZZLES[puzzleIdx].pieces.map((content, id) => ({ id, content, correct: id }));
  return shuffle(pieces).map((p, idx) => ({ ...p }));
}

export default function GamePuzzle() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [pieces, setPieces] = useState<PieceState[]>(() => createPuzzle(0));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const puzzle = PUZZLES[puzzleIdx];

  function isSolved(ps: PieceState[]) {
    return ps.every((p, i) => p.correct === i);
  }

  function handleTile(idx: number) {
    if (won) return;
    if (selected === null) {
      setSelected(idx);
    } else {
      if (selected === idx) { setSelected(null); return; }
      const next = [...pieces];
      [next[selected], next[idx]] = [next[idx], next[selected]];
      setPieces(next);
      setMoves(m => m + 1);
      setSelected(null);
      if (isSolved(next)) setTimeout(() => setWon(true), 300);
    }
  }

  function restart(pi = puzzleIdx) {
    setPuzzleIdx(pi);
    setPieces(createPuzzle(pi));
    setSelected(null);
    setMoves(0);
    setWon(false);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none">
      {/* Puzzle selector & score */}
      <div className="flex items-center justify-between w-full max-w-sm flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {PUZZLES.map((p, i) => (
            <button key={i} onClick={() => restart(i)}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${puzzleIdx === i ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {p.emoji} {p.name}
            </button>
          ))}
        </div>
        <span className="text-sm font-bold text-muted-foreground">🔄 {moves}</span>
      </div>

      {/* Reference image */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-muted-foreground font-medium">Modelul de completat:</p>
        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border-2 border-dashed border-primary/40 p-1 bg-primary/5">
          {puzzle.pieces.map((content, i) => (
            <div key={i} className="w-16 h-16 flex items-center justify-center text-2xl bg-white rounded-xl">
              {content}
            </div>
          ))}
        </div>
      </div>

      {won ? (
        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
          <div className="text-7xl animate-bounce">🏆</div>
          <div className="text-2xl font-bold text-green-600">Felicitări! Puzzle rezolvat!</div>
          <p className="text-muted-foreground">în {moves} mutări</p>
          <button onClick={() => restart()} className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:-translate-y-1 transition-all">
            Încearcă din nou
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground font-medium">
            {selected !== null ? "Acum apasă pe locul cu care vrei să schimbi! ↓" : "Apasă pe o piesă ca să o selectezi!"}
          </p>
          {/* Puzzle grid */}
          <div className="grid grid-cols-2 gap-3">
            {pieces.map((piece, idx) => (
              <button key={idx} onClick={() => handleTile(idx)}
                className={`w-28 h-28 rounded-2xl text-4xl flex items-center justify-center border-3 transition-all duration-200 shadow-md font-bold
                  ${selected === idx ? "border-primary bg-primary/10 scale-110 shadow-xl ring-4 ring-primary/30" :
                    piece.correct === idx ? "border-green-400 bg-green-50" :
                    "border-border bg-white hover:border-primary/50 hover:scale-105 hover:shadow-lg"
                  }
                `}>
                {piece.content}
              </button>
            ))}
          </div>

          {pieces.filter((p, i) => p.correct === i).length > 0 && (
            <p className="text-sm text-green-600 font-bold">
              ✅ {pieces.filter((p, i) => p.correct === i).length} / {GRID_SIZE} piese la locul lor!
            </p>
          )}
        </>
      )}
    </div>
  );
}
