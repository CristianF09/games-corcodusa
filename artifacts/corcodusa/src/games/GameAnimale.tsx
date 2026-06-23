import { useState } from "react";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sfx";

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

const ANIMALS = [
  { name: "Vacă",    emoji: "🐄", sound: "Muu!",       habitat: "ferma",   legs: 4, food: "plante", baby: "vițel" },
  { name: "Porc",    emoji: "🐷", sound: "Groh!",      habitat: "ferma",   legs: 4, food: "orice",  baby: "purcel" },
  { name: "Câine",   emoji: "🐶", sound: "Ham!",       habitat: "casa",    legs: 4, food: "carne",  baby: "cățel" },
  { name: "Pisică",  emoji: "🐱", sound: "Miau!",      habitat: "casa",    legs: 4, food: "carne",  baby: "pisicuță" },
  { name: "Oaie",    emoji: "🐑", sound: "Bee!",       habitat: "ferma",   legs: 4, food: "plante", baby: "miel" },
  { name: "Cal",     emoji: "🐴", sound: "Iîîî!",      habitat: "ferma",   legs: 4, food: "plante", baby: "mânz" },
  { name: "Rață",    emoji: "🦆", sound: "Mac!",       habitat: "apa",     legs: 2, food: "plante", baby: "rățușcă" },
  { name: "Cocoș",   emoji: "🐓", sound: "Cucuriguu!", habitat: "ferma",   legs: 2, food: "seminte",baby: "pui" },
  { name: "Delfin",  emoji: "🐬", sound: "Clic-clic!", habitat: "ocean",   legs: 0, food: "pești",  baby: "delfinel" },
  { name: "Leu",     emoji: "🦁", sound: "Roarrr!",    habitat: "savana",  legs: 4, food: "carne",  baby: "pui de leu" },
  { name: "Elefant", emoji: "🐘", sound: "Barrr!",     habitat: "savana",  legs: 4, food: "plante", baby: "puiul de elefant" },
  { name: "Pinguin", emoji: "🐧", sound: "Scârțâit!",  habitat: "arctic",  legs: 2, food: "pești",  baby: "pui de pinguin" },
];

type Mode = "sound" | "habitat" | "legs" | "baby";

const HABITATS = ["ferma", "casa", "apa", "ocean", "savana", "arctic"];
const HABITAT_LABELS: Record<string, string> = { ferma: "🌾 Fermă", casa: "🏠 Casă", apa: "💧 Apă", ocean: "🌊 Ocean", savana: "🌍 Savană", arctic: "🧊 Arctic" };
const LEGS_OPTIONS = [0, 2, 4, 6, 8];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generateRound(mode: Mode) {
  const target = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  if (mode === "habitat") {
    const wrongHabitats = shuffle(HABITATS.filter(h => h !== target.habitat)).slice(0, 3);
    return { target, options: shuffle([target.habitat, ...wrongHabitats]) };
  }
  if (mode === "legs") {
    const wrongLegs = shuffle(LEGS_OPTIONS.filter(l => l !== target.legs)).slice(0, 3);
    return { target, options: shuffle([target.legs, ...wrongLegs]).map(String) };
  }
  if (mode === "baby") {
    const wrongBabies = shuffle(ANIMALS.filter(a => a.baby !== target.baby)).slice(0, 3).map(a => a.baby);
    return { target, options: shuffle([target.baby, ...wrongBabies]) };
  }
  // sound
  const wrong = shuffle(ANIMALS.filter(a => a.name !== target.name)).slice(0, 3);
  return { target, options: shuffle([target.name, ...wrong.map(a => a.name)]) };
}

export default function GameAnimale() {
  const [mode, setMode] = useState<Mode>("sound");
  const [round, setRound] = useState(() => generateRound("sound"));
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  function nextRound(m = mode) {
    setRound(generateRound(m));
    setChosen(null);
  }

  function handleChoice(val: string) {
    if (chosen) return;
    setChosen(val);
    setTotal(t => t + 1);
    const correct = mode === "sound" ? val === round.target.name
      : mode === "habitat" ? val === round.target.habitat
      : mode === "legs" ? val === String(round.target.legs)
      : val === round.target.baby;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        if (next >= 3) { playCelebrate(); setCelebrate(true); setTimeout(() => setCelebrate(false), 1400); }
        else playCorrect();
        return next;
      });
    } else {
      setStreak(0);
      playWrong();
    }
    setTimeout(() => nextRound(), 1800);
  }

  function changeMode(m: Mode) {
    setMode(m);
    setScore(0);
    setTotal(0);
    setStreak(0);
    nextRound(m);
  }

  const isCorrect = (val: string) =>
    mode === "sound" ? val === round.target.name
    : mode === "habitat" ? val === round.target.habitat
    : mode === "legs" ? val === String(round.target.legs)
    : val === round.target.baby;

  const correct = chosen !== null && isCorrect(chosen);

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {celebrate && <Confetti />}
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([["sound","🔊 Sunete"],["habitat","🏡 Habitat"],["legs","🦵 Picioare"],["baby","👶 Pui"]] as [Mode,string][]).map(([m, lbl]) => (
          <button key={m} onClick={() => changeMode(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${mode === m ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-primary">⭐ {score} / {total}</span>
        {streak >= 2 && <span className="text-xs font-bold text-orange-500 animate-pulse">🔥 {streak}</span>}
      </div>

      {/* Question card */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 w-full max-w-xs text-center shadow-inner">
        {mode === "sound" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">Ce animal face sunetul:</p>
            <div className="text-3xl font-display font-bold text-primary bg-primary/10 px-6 py-3 rounded-2xl inline-block">
              {round.target.sound}
            </div>
          </>
        )}
        {mode === "habitat" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">Unde trăiește:</p>
            <div className="text-7xl">{round.target.emoji}</div>
            <div className="text-xl font-bold mt-2">{round.target.name}</div>
          </>
        )}
        {mode === "legs" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">Câte picioare are:</p>
            <div className="text-7xl">{round.target.emoji}</div>
            <div className="text-xl font-bold mt-2">{round.target.name}</div>
          </>
        )}
        {mode === "baby" && (
          <>
            <p className="text-sm text-muted-foreground mb-3">Cum se numește puiul de:</p>
            <div className="text-7xl">{round.target.emoji}</div>
            <div className="text-xl font-bold mt-2">{round.target.name}</div>
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {(round.options as string[]).map((opt) => {
          const display = mode === "sound" ? ANIMALS.find(a => a.name === opt)?.emoji + " " + opt
            : mode === "habitat" ? HABITAT_LABELS[opt] ?? opt
            : mode === "legs" ? opt + " picioare"
            : opt;
          const ic = isCorrect(opt);
          return (
            <button key={opt} onClick={() => handleChoice(opt)}
              disabled={!!chosen}
              className={`py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 shadow-md text-center
                ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                ${chosen === opt && ic ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                ${chosen === opt && !ic ? "bg-red-100 border-red-400 text-red-600" : ""}
                ${chosen && ic && chosen !== opt ? "bg-green-100 border-green-400 text-green-700" : ""}
              `}>
              {display}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? "🎉 Corect! Bravo!" : (
            mode === "sound" ? `❌ Era ${round.target.name}` :
            mode === "habitat" ? `❌ Trăiește la ${HABITAT_LABELS[round.target.habitat]}` :
            mode === "legs" ? `❌ Are ${round.target.legs} picioare` :
            `❌ Puiul se numește ${round.target.baby}`
          )}
        </div>
      )}

      {/* Fun fact */}
      {chosen && correct && (
        <div className="text-sm bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-800 text-center max-w-sm">
          🌟 Știai că {round.target.name.toLowerCase()} {round.target.food === "plante" ? "mănâncă plante (e ierbivor)" : round.target.food === "carne" ? "mănâncă carne (e carnivor)" : "mănâncă orice (e omnivor)"}?
        </div>
      )}
    </div>
  );
}
