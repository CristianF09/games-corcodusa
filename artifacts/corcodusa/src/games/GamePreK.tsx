import { useState, useRef, useEffect } from "react";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";
import {
  PREK_MODES, PreKMode, PreKRound, generateRound, isCorrect,
} from "@/lib/prek-logic";

const MODE_ICONS: Record<PreKMode, string> = {
  mare: "🐘", mic: "🐜", urmator: "➡️", inainte: "⬅️", ordinal: "🥇", modele: "🎨",
};

/** Culori pastel pentru cele patru opțiuni — ajută copilul să le deosebească. */
const OPTION_TONES = [
  "from-sky-100 to-sky-50 border-sky-300 text-sky-700",
  "from-rose-100 to-rose-50 border-rose-300 text-rose-700",
  "from-amber-100 to-amber-50 border-amber-300 text-amber-700",
  "from-emerald-100 to-emerald-50 border-emerald-300 text-emerald-700",
];

export default function GamePreK() {
  const [modeId, setModeId]   = useState<PreKMode>("mare");
  const [levelId, setLevelId] = useState(1);
  const [round, setRound]     = useState<PreKRound>(() => generateRound("mare", 1));
  const [chosen, setChosen]   = useState<string | null>(null);
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [total, setTotal]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const mode = PREK_MODES.find(m => m.id === modeId)!;
  const answered = chosen !== null;
  const correct  = answered && isCorrect(round, chosen!);
  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100);

  function nextRound(m = modeId, l = levelId) {
    setRound(generateRound(m, l));
    setChosen(null);
  }

  function handleAnswer(opt: string) {
    if (chosen !== null) return;
    setChosen(opt);
    setTotal(t => t + 1);
    if (isCorrect(round, opt)) {
      const ns = streak + 1;
      setScore(s => s + 1);
      setStreak(ns);
      (ns >= 3 ? playCelebrate : playCorrect)();
    } else {
      setStreak(0);
      playWrong();
    }
    timerRef.current = setTimeout(() => nextRound(), 1800);
  }

  function resetStats() {
    setScore(0); setTotal(0); setStreak(0);
  }

  function changeMode(m: PreKMode) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setModeId(m); setLevelId(1); resetStats();
    nextRound(m, 1);
  }

  function changeLevel(l: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLevelId(l); resetStats();
    nextRound(modeId, l);
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode picker */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
        {PREK_MODES.map(m => {
          const active = modeId === m.id;
          return (
            <button key={m.id} onClick={() => changeMode(m.id)}
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 border-2 text-[11px] font-bold leading-tight transition-all
                ${active
                  ? "bg-primary text-white border-primary shadow-lg -translate-y-0.5"
                  : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:-translate-y-0.5"}`}>
              <span className="text-xl">{MODE_ICONS[m.id]}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Level picker */}
      <div className="flex gap-2 flex-wrap justify-center">
        {mode.levels.map(l => (
          <button key={l.id} onClick={() => changeLevel(l.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-2
              ${levelId === l.id
                ? "bg-secondary text-white border-secondary shadow"
                : "bg-muted border-transparent text-muted-foreground hover:bg-muted/70"}`}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Progress card */}
      <div className="w-full bg-white rounded-2xl border-2 border-border shadow-sm px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
            <span>⭐ {score} din {total}</span>
            <span>{accuracy}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${accuracy}%` }} />
          </div>
        </div>
        {streak >= 3 && (
          <span className="text-sm font-black text-orange-500 animate-pulse whitespace-nowrap">🔥 {streak}</span>
        )}
      </div>

      {/* Question bubble */}
      <div className="relative w-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl px-5 py-4 text-center border-2 border-primary/20">
        <p className="text-lg sm:text-xl font-black text-foreground">{round.question}</p>
      </div>

      {/* Stage: ordinal row or pattern */}
      {round.visual.length > 0 && (
        <div className="w-full rounded-3xl bg-gradient-to-b from-white to-muted/60 border-2 border-border shadow-inner p-4 sm:p-6">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {round.visual.map((item, i) => {
              const isBlank = round.blankIndex === i && !answered;
              const isTarget = round.highlightIndex === i;
              return (
                <div key={i}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isBlank
                      ? "border-[3px] border-dashed border-primary/60 bg-primary/5"
                      : "bg-white shadow-md border-2 border-border"}
                    ${isTarget && !answered ? "ring-4 ring-amber-400 scale-110 -translate-y-1" : ""}`}>
                  {isBlank
                    ? <span className="text-3xl font-black text-primary animate-pulse">?</span>
                    : <KidEmoji emoji={item} size={34} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Options */}
      <div className={`grid gap-3 sm:gap-4 w-full ${round.options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {round.options.map((opt, idx) => {
          const isThisCorrect = opt === round.answer;
          const isThisChosen  = chosen === opt;
          const tone = OPTION_TONES[idx % OPTION_TONES.length];
          const isNumeric = /^\d+$/.test(opt);
          let state = `bg-gradient-to-b ${tone} hover:-translate-y-1 hover:shadow-xl active:scale-95`;
          if (answered && isThisCorrect) state = "bg-green-100 border-green-500 text-green-700 scale-105 shadow-xl";
          else if (answered && isThisChosen) state = "bg-red-100 border-red-400 text-red-700 opacity-90";
          else if (answered) state = "bg-white border-border text-muted-foreground opacity-40";
          return (
            <button key={opt} onClick={() => handleAnswer(opt)} disabled={answered}
              className={`min-h-20 sm:min-h-24 rounded-3xl border-2 shadow-md font-display font-black text-4xl sm:text-5xl transition-all duration-300 flex items-center justify-center ${state}`}>
              {isNumeric ? opt : <KidEmoji emoji={opt} size={56} />}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <div className="h-14 flex items-center justify-center">
        {answered && (
          <div className={`px-5 py-2 rounded-full text-base sm:text-lg font-black animate-in zoom-in
            ${correct ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}>
            {correct
              ? (streak >= 3 ? "🔥 Fantastic!" : "🎉 Corect! Bravo!")
              : `❌ Răspunsul corect era ${round.answer}`}
          </div>
        )}
      </div>
    </div>
  );
}
