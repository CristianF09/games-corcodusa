import { useState, useEffect, useRef } from "react";

const ITEM_SETS = [
  { emoji: "🍎", label: "mere" }, { emoji: "⭐", label: "stele" },
  { emoji: "🐶", label: "cățeluși" }, { emoji: "🦋", label: "fluturi" },
  { emoji: "🍭", label: "acadele" }, { emoji: "🎈", label: "baloane" },
  { emoji: "🐸", label: "broscuțe" }, { emoji: "🌻", label: "floarea-soarelui" },
  { emoji: "🍓", label: "căpșune" }, { emoji: "🦄", label: "unicorni" },
  { emoji: "🚀", label: "rachete" }, { emoji: "🦊", label: "vulpițe" },
];

const LEVELS = [
  { id: 1, label: "1–5",   min: 1,  max: 5,  desc: "Numere mici" },
  { id: 2, label: "1–10",  min: 1,  max: 10, desc: "Până la 10" },
  { id: 3, label: "5–20",  min: 5,  max: 20, desc: "Până la 20" },
  { id: 4, label: "Pare/Impare", min: 1, max: 10, desc: "Par sau impar?", parity: true },
  { id: 5, label: "Zeci",  min: 10, max: 50, desc: "Multiplii de 10", tens: true },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateRound(levelId: number) {
  const lvl = LEVELS[levelId - 1];
  let count: number;
  if (lvl.tens) {
    count = (Math.floor(Math.random() * 5) + 1) * 10;
  } else {
    count = Math.floor(Math.random() * (lvl.max - lvl.min + 1)) + lvl.min;
  }
  const set = ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) {
    const w = Math.max(1, count + (Math.floor(Math.random() * 7) - 3));
    if (w !== count && w > 0) wrong.add(w);
  }
  return { count, ...set, options: shuffle([...wrong]) };
}

function Confetti() {
  const PIECES = Array.from({ length: 20 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b"][i % 5],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <div key={i} className="absolute animate-bounce"
          style={{ left: `${p.left}%`, top: "-10px", animationDelay: `${p.delay}s`, animationDuration: "0.8s" }}>
          <div style={{ width: p.size, height: p.size, background: p.color, borderRadius: "2px", transform: `rotate(${Math.random() * 360}deg)` }} />
        </div>
      ))}
    </div>
  );
}

export default function GameNumarare() {
  const [levelId, setLevelId] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
  const [clicked, setClicked] = useState<Set<number>>(new Set());
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function nextRound(lvl = levelId) {
    setRound(generateRound(lvl));
    setClicked(new Set());
    setChosen(null);
    setCelebrate(false);
    setShowHint(false);
  }

  function handleItemClick(i: number) {
    if (chosen !== null) return;
    setClicked(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  function handleAnswer(n: number) {
    if (chosen !== null) return;
    setChosen(n);
    setTotal(t => t + 1);
    const correct = n === round.count;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setCelebrate(true);
    } else {
      setStreak(0);
    }
    timerRef.current = setTimeout(() => nextRound(), 2000);
  }

  function changeLevel(l: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLevelId(l);
    setScore(0);
    setTotal(0);
    setStreak(0);
    nextRound(l);
  }

  const lvl = LEVELS[levelId - 1];
  const correct = chosen === round.count;
  const isParity = !!lvl.parity;

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

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm font-bold">
        <span className="text-primary">⭐ {score}/{total}</span>
        {streak >= 3 && <span className="text-orange-500 animate-pulse">🔥 {streak} la rând!</span>}
      </div>

      {/* Instruction */}
      <div className="text-center">
        <p className="text-lg font-bold text-foreground">
          {isParity
            ? `${round.count} este număr par sau impar?`
            : `Câte ${round.label} vezi? Numără-le!`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{lvl.desc}</p>
      </div>

      {/* Items */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md bg-card rounded-3xl p-5 border-2 border-border shadow-inner min-h-24">
        {Array.from({ length: round.count }).map((_, i) => (
          <button key={i} onClick={() => handleItemClick(i)}
            className={`text-3xl transition-all duration-200 active:scale-75 ${clicked.has(i) ? "opacity-30 scale-90" : "hover:scale-110"}`}>
            {round.emoji}
          </button>
        ))}
      </div>

      {/* Counting badge */}
      {clicked.size > 0 && chosen === null && (
        <div className="text-4xl font-display font-bold text-primary animate-bounce">
          {clicked.size}
        </div>
      )}

      {/* Parity game */}
      {isParity ? (
        <div className="flex gap-4">
          {["Par", "Impar"].map(label => {
            const isEven = label === "Par";
            const isCorrect = (round.count % 2 === 0) === isEven;
            return (
              <button key={label} onClick={() => handleAnswer(isEven ? round.count : round.count + 1)}
                disabled={chosen !== null}
                className={`px-8 py-4 rounded-2xl text-xl font-display font-bold border-2 transition-all duration-300 shadow-md
                  ${chosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1" : ""}
                  ${chosen !== null && isCorrect ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen !== null && !isCorrect ? "bg-red-100 border-red-400 text-red-700" : ""}
                `}>
                {isEven ? "🟢 Par" : "🟡 Impar"}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {round.options.map(n => (
            <button key={n} onClick={() => handleAnswer(n)}
              disabled={chosen !== null}
              className={`text-3xl font-display font-bold py-4 rounded-2xl border-2 transition-all duration-300 shadow-md
                ${chosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1 hover:shadow-lg" : ""}
                ${chosen === n && n === round.count ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                ${chosen === n && n !== round.count ? "bg-red-100 border-red-400 text-red-700" : ""}
                ${chosen !== null && n === round.count && chosen !== n ? "bg-green-100 border-green-400 text-green-700" : ""}
              `}>
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {chosen !== null && (
        <div className={`text-2xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? (streak >= 3 ? "🔥 Fantastic!" : "🎉 Bravo! Corect!") : `❌ Erau ${round.count} ${round.label}`}
        </div>
      )}

      {/* Hint */}
      {!showHint && chosen === null && (
        <button onClick={() => setShowHint(true)} className="text-xs text-muted-foreground underline hover:text-primary">
          💡 Ajutor
        </button>
      )}
      {showHint && chosen === null && (
        <div className="text-sm bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-yellow-800">
          Apasă pe fiecare {round.emoji} ca să numeri mai ușor!
        </div>
      )}
    </div>
  );
}
