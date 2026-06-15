import { useState } from "react";
import { Button } from "@/components/ui/button";

const EMOJIS = ["🍎","🍋","🍓","🍇","🌟","🎈","🐥","🦋"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateRound(level: number) {
  const max = level === 1 ? 5 : level === 2 ? 10 : 15;
  const useSubtract = level === 3 && Math.random() > 0.5;
  let a: number, b: number;
  if (useSubtract) {
    a = Math.floor(Math.random() * max) + 2;
    b = Math.floor(Math.random() * a) + 1;
  } else {
    a = Math.floor(Math.random() * (max - 1)) + 1;
    b = Math.floor(Math.random() * (max - a)) + 1;
  }
  const op = useSubtract ? "-" : "+";
  const answer = op === "+" ? a + b : a - b;
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const wrong = new Set([answer]);
  while (wrong.size < 4) {
    const w = Math.max(0, answer + Math.floor(Math.random() * 7) - 3);
    if (w !== answer) wrong.add(w);
  }
  return { a, b, op, answer, emoji, options: shuffle([...wrong]) };
}

export default function GameAdunare() {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showResult, setShowResult] = useState(false);

  function nextRound(lvl = level) {
    setRound(generateRound(lvl));
    setChosen(null);
    setShowResult(false);
  }

  function handleAnswer(n: number) {
    if (chosen !== null) return;
    setChosen(n);
    setTotal(t => t + 1);
    if (n === round.answer) setScore(s => s + 1);
    setShowResult(true);
    setTimeout(() => nextRound(), 2000);
  }

  function changeLevel(l: number) {
    setLevel(l);
    setScore(0);
    setTotal(0);
    nextRound(l);
  }

  const correct = chosen === round.answer;

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none">
      {/* Level selector */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex gap-2">
          {[1,2,3].map(l => (
            <button key={l} onClick={() => changeLevel(l)}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${level === l ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              Nivel {l}
            </button>
          ))}
        </div>
        <div className="text-sm font-bold text-muted-foreground">⭐ {score} / {total}</div>
      </div>

      {/* Visual items */}
      <div className="flex items-center gap-6 bg-card rounded-3xl p-6 border-2 border-border shadow-inner w-full max-w-lg justify-center flex-wrap">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
            {Array.from({ length: round.a }).map((_, i) => (
              <span key={i} className="text-3xl">{round.emoji}</span>
            ))}
          </div>
          <span className="text-3xl font-bold text-foreground">{round.a}</span>
        </div>

        <div className="text-5xl font-display font-bold text-primary">{round.op}</div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
            {Array.from({ length: round.b }).map((_, i) => (
              <span key={i} className={`text-3xl ${round.op === "-" ? "opacity-40 line-through" : ""}`}>{round.emoji}</span>
            ))}
          </div>
          <span className="text-3xl font-bold text-foreground">{round.b}</span>
        </div>

        <div className="text-5xl font-display font-bold text-muted-foreground">=</div>
        <div className="text-5xl font-display font-bold text-primary">?</div>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {round.options.map(n => (
          <button key={n} onClick={() => handleAnswer(n)}
            disabled={chosen !== null}
            className={`text-3xl font-display font-bold py-4 rounded-2xl border-2 transition-all duration-300 shadow-md
              ${chosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1 hover:shadow-lg" : ""}
              ${chosen === n && n === round.answer ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
              ${chosen === n && n !== round.answer ? "bg-red-100 border-red-400 text-red-700" : ""}
              ${chosen !== null && n === round.answer && chosen !== n ? "bg-green-100 border-green-400 text-green-700" : ""}
            `}>
            {n}
          </button>
        ))}
      </div>

      {showResult && (
        <div className={`text-2xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? "🎉 Bravo! Corect!" : `❌ ${round.a} ${round.op} ${round.b} = ${round.answer}`}
        </div>
      )}
    </div>
  );
}
