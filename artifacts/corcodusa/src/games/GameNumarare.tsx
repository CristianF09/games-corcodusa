import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const ITEMS = ["🍎","🌟","🐶","🦋","🍭","🎈","🐸","🌻","🍓","🦄"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateRound(level: number) {
  const max = level === 1 ? 5 : level === 2 ? 10 : 15;
  const count = Math.floor(Math.random() * max) + 1;
  const emoji = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) {
    const w = Math.max(1, count + Math.floor(Math.random() * 7) - 3);
    if (w !== count) wrong.add(w);
  }
  return { count, emoji, options: shuffle([...wrong]) };
}

export default function GameNumarare() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
  const [clicked, setClicked] = useState<number[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showResult, setShowResult] = useState(false);

  function nextRound(lvl = level) {
    setRound(generateRound(lvl));
    setClicked([]);
    setChosen(null);
    setShowResult(false);
  }

  function handleItemClick(i: number) {
    if (chosen !== null) return;
    setClicked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  function handleAnswer(n: number) {
    if (chosen !== null) return;
    setChosen(n);
    setTotal(t => t + 1);
    if (n === round.count) setScore(s => s + 1);
    setShowResult(true);
    setTimeout(() => nextRound(), 1800);
  }

  function changeLevel(l: number) {
    setLevel(l);
    setScore(0);
    setTotal(0);
    nextRound(l);
  }

  const correct = chosen === round.count;

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex gap-2">
          {[1,2,3].map(l => (
            <button key={l} onClick={() => changeLevel(l)}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${level === l ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              Nivel {l}
            </button>
          ))}
        </div>
        <div className="text-sm font-bold text-muted-foreground">
          ⭐ {score} / {total}
        </div>
      </div>

      {/* Instruction */}
      <p className="text-lg font-bold text-foreground text-center">
        Câte {round.emoji} vezi? Numără-le!
      </p>

      {/* Items grid */}
      <div className="flex flex-wrap justify-center gap-3 max-w-sm bg-card rounded-3xl p-6 border-2 border-border shadow-inner min-h-32">
        {Array.from({ length: round.count }).map((_, i) => (
          <button key={i} onClick={() => handleItemClick(i)}
            className={`text-4xl transition-all duration-200 active:scale-75 ${
              clicked.includes(i) ? "opacity-40 scale-90" : "hover:scale-110"
            }`}
            aria-label={`Item ${i + 1}`}>
            {round.emoji}
          </button>
        ))}
      </div>

      {/* Count badge */}
      {clicked.length > 0 && chosen === null && (
        <div className="text-3xl font-display font-bold text-primary animate-bounce">
          {clicked.length}
        </div>
      )}

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {round.options.map(n => (
          <button key={n} onClick={() => handleAnswer(n)}
            disabled={chosen !== null}
            className={`text-3xl font-display font-bold py-4 rounded-2xl border-3 transition-all duration-300 shadow-md
              ${chosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1 hover:shadow-lg" : ""}
              ${chosen === n && n === round.count ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
              ${chosen === n && n !== round.count ? "bg-red-100 border-red-400 text-red-700" : ""}
              ${chosen !== null && n === round.count && chosen !== n ? "bg-green-100 border-green-400 text-green-700" : ""}
            `}>
            {n}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={`text-2xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? "🎉 Bravo! Corect!" : `❌ Răspunsul era ${round.count}`}
        </div>
      )}
    </div>
  );
}
