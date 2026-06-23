import { useState } from "react";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sfx";

const EMOJI_SETS = ["🍎","🍋","🍓","🍇","🌟","🎈","🐥","🦋","🍩","🪄"];

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

const LEVELS = [
  { id: 1, label: "Adunare 1–5",    desc: "Adunare simplă", op: "add",  max: 5  },
  { id: 2, label: "Adunare 1–10",   desc: "Adunare până la 10", op: "add",  max: 10 },
  { id: 3, label: "Scădere 1–10",   desc: "Scădere simplă", op: "sub",  max: 10 },
  { id: 4, label: "Amestecat",      desc: "Adunare + Scădere", op: "mix",  max: 15 },
  { id: 5, label: "Înmulțire ×2–5", desc: "Primele tabele", op: "mul",  max: 5  },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generateRound(levelId: number) {
  const lvl = LEVELS[levelId - 1];
  const emoji = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
  let a: number, b: number, op: string, answer: number;

  if (lvl.op === "mul") {
    a = Math.floor(Math.random() * 4) + 2; // 2–5
    b = Math.floor(Math.random() * lvl.max) + 1;
    op = "×"; answer = a * b;
  } else if (lvl.op === "sub" || (lvl.op === "mix" && Math.random() > 0.5)) {
    a = Math.floor(Math.random() * lvl.max) + 2;
    b = Math.floor(Math.random() * a) + 1;
    op = "−"; answer = a - b;
  } else {
    a = Math.floor(Math.random() * (lvl.max - 1)) + 1;
    b = Math.floor(Math.random() * Math.max(1, lvl.max - a)) + 1;
    op = "+"; answer = a + b;
  }

  const wrong = new Set([answer]);
  while (wrong.size < 4) {
    const w = Math.max(0, answer + Math.floor(Math.random() * 7) - 3);
    if (w !== answer) wrong.add(w);
  }
  return { a, b, op, answer, emoji, options: shuffle([...wrong]) };
}

const WORD_PROBLEMS: Record<string, (a: number, b: number, emoji: string) => string> = {
  "+": (a, b, e) => `Maria are ${a} ${e}. Primește încă ${b}. Câte are acum?`,
  "−": (a, b, e) => `Sunt ${a} ${e} pe masă. Se mănâncă ${b}. Câte rămân?`,
  "×": (a, b, e) => `Sunt ${a} coșuri cu câte ${b} ${e}. Câte sunt în total?`,
};

export default function GameAdunare() {
  const [levelId, setLevelId] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<"visual"|"word">("visual");
  const [showExplain, setShowExplain] = useState(false);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  function nextRound(lvl = levelId) {
    setRound(generateRound(lvl));
    setChosen(null);
    setShowExplain(false);
  }

  function handleAnswer(n: number) {
    if (chosen !== null) return;
    setChosen(n);
    setTotal(t => t + 1);
    if (n === round.answer) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        if (next >= 3) {
          playCelebrate();
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 1400);
        } else {
          playCorrect();
        }
        return next;
      });
    } else {
      setStreak(0);
      playWrong();
    }
    setTimeout(() => nextRound(), 2200);
  }

  function changeLevel(l: number) {
    setLevelId(l);
    setScore(0);
    setTotal(0);
    setStreak(0);
    nextRound(l);
  }

  const correct = chosen === round.answer;
  const maxVisual = 10;
  const showVisual = round.op !== "×" && round.a <= maxVisual && round.b <= maxVisual;

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {celebrate && <Confetti />}
      {/* Levels */}
      <div className="flex gap-2 flex-wrap justify-center">
        {LEVELS.map(l => (
          <button key={l.id} onClick={() => changeLevel(l.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${levelId === l.id ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Stats + mode toggle */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">⭐ {score}/{total}</span>
          {streak >= 2 && <span className="text-xs font-bold text-orange-500 animate-pulse">🔥 {streak}</span>}
        </div>
        <div className="flex gap-1">
          {(["visual","word"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === m ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
              {m === "visual" ? "🎨 Vizual" : "📖 Probleme"}
            </button>
          ))}
        </div>
      </div>

      {/* Problem display */}
      {mode === "word" ? (
        <div className="bg-card rounded-3xl border-2 border-border p-6 w-full max-w-md text-center shadow-inner">
          <p className="text-lg font-bold text-foreground leading-relaxed">
            {WORD_PROBLEMS[round.op]?.(round.a, round.b, round.emoji) ?? `${round.a} ${round.op} ${round.b} = ?`}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 bg-card rounded-3xl p-5 border-2 border-border shadow-inner w-full max-w-lg justify-center flex-wrap">
          {round.op === "×" ? (
            <div className="flex flex-col items-center gap-3">
              {Array.from({ length: round.a }).map((_, row) => (
                <div key={row} className="flex gap-1">
                  {Array.from({ length: round.b }).map((_, col) => (
                    <span key={col} className="text-2xl">{round.emoji}</span>
                  ))}
                </div>
              ))}
              <p className="text-sm text-muted-foreground">{round.a} rânduri × {round.b} obiecte</p>
            </div>
          ) : showVisual ? (
            <>
              <div className="flex flex-col items-center gap-1">
                <div className="flex flex-wrap gap-1 max-w-[150px] justify-center">
                  {Array.from({ length: round.a }).map((_, i) => <span key={i} className="text-2xl">{round.emoji}</span>)}
                </div>
                <span className="text-2xl font-bold">{round.a}</span>
              </div>
              <span className="text-4xl font-display font-bold text-primary">{round.op}</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex flex-wrap gap-1 max-w-[150px] justify-center">
                  {Array.from({ length: round.b }).map((_, i) => (
                    <span key={i} className={`text-2xl ${round.op === "−" ? "opacity-30 line-through" : ""}`}>{round.emoji}</span>
                  ))}
                </div>
                <span className="text-2xl font-bold">{round.b}</span>
              </div>
              <span className="text-4xl font-display font-bold text-muted-foreground">=</span>
              <span className="text-4xl font-display font-bold text-primary">?</span>
            </>
          ) : (
            <div className="text-5xl font-display font-bold text-center">
              {round.a} <span className="text-primary">{round.op}</span> {round.b} = <span className="text-primary">?</span>
            </div>
          )}
        </div>
      )}

      {/* Explanation toggle */}
      {mode === "visual" && !showVisual && !chosen && (
        <button onClick={() => setShowExplain(s => !s)} className="text-xs text-muted-foreground underline">
          💡 Cum rezolvăm?
        </button>
      )}
      {showExplain && (
        <div className="text-sm bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-800 max-w-sm text-center">
          {round.op === "×"
            ? `Înmulțirea = adunare repetată. ${round.a} × ${round.b} = ${Array.from({length: round.a}, () => round.b).join(" + ")}`
            : round.op === "−"
            ? `Gândește-te: ${round.b} + ? = ${round.a}`
            : `Numără de la ${round.a} încă ${round.b} pași!`}
        </div>
      )}

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

      {chosen !== null && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? "🎉 Corect!" : `❌ ${round.a} ${round.op} ${round.b} = ${round.answer}`}
        </div>
      )}
    </div>
  );
}
