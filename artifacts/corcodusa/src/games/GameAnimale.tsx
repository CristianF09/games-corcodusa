import { useState, useEffect } from "react";

const ANIMALS = [
  { name: "Vacă", emoji: "🐄", sound: "Muu!", color: "bg-amber-50 border-amber-200" },
  { name: "Porc", emoji: "🐷", sound: "Groh!", color: "bg-pink-50 border-pink-200" },
  { name: "Câine", emoji: "🐶", sound: "Ham!", color: "bg-orange-50 border-orange-200" },
  { name: "Pisică", emoji: "🐱", sound: "Miau!", color: "bg-purple-50 border-purple-200" },
  { name: "Oaie", emoji: "🐑", sound: "Bee!", color: "bg-sky-50 border-sky-200" },
  { name: "Cal", emoji: "🐴", sound: "Iîîî!", color: "bg-brown-50 border-yellow-200" },
  { name: "Rață", emoji: "🦆", sound: "Mac!", color: "bg-green-50 border-green-200" },
  { name: "Cocoș", emoji: "🐓", sound: "Cucuriguu!", color: "bg-red-50 border-red-200" },
];

type Mode = "sound-to-animal" | "animal-to-sound";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateRound(mode: Mode) {
  const target = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const wrong = shuffle(ANIMALS.filter(a => a.name !== target.name)).slice(0, 3);
  const options = shuffle([target, ...wrong]);
  return { target, options };
}

export default function GameAnimale() {
  const [mode, setMode] = useState<Mode>("sound-to-animal");
  const [round, setRound] = useState(() => generateRound("sound-to-animal"));
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showSound, setShowSound] = useState(false);

  function nextRound(m = mode) {
    setRound(generateRound(m));
    setChosen(null);
    setShowSound(false);
  }

  function handleChoice(name: string) {
    if (chosen) return;
    setChosen(name);
    setTotal(t => t + 1);
    if (name === round.target.name) setScore(s => s + 1);
    setTimeout(() => nextRound(), 1800);
  }

  function changeMode(m: Mode) {
    setMode(m);
    setScore(0);
    setTotal(0);
    nextRound(m);
  }

  const correct = chosen === round.target.name;

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none">
      {/* Mode & score */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex gap-2">
          <button onClick={() => changeMode("sound-to-animal")}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${mode === "sound-to-animal" ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
            🔊 → 🐄
          </button>
          <button onClick={() => changeMode("animal-to-sound")}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${mode === "animal-to-sound" ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
            🐄 → 🔊
          </button>
        </div>
        <span className="text-sm font-bold text-primary">⭐ {score} / {total}</span>
      </div>

      {/* Question */}
      <div className="flex flex-col items-center gap-3 bg-card rounded-3xl border-2 border-border p-8 w-full max-w-xs shadow-inner">
        {mode === "sound-to-animal" ? (
          <>
            <p className="text-sm text-muted-foreground font-medium">Ce animal face sunetul:</p>
            <button onClick={() => setShowSound(s => !s)}
              className="text-4xl font-display font-bold text-primary bg-primary/10 px-8 py-4 rounded-2xl hover:bg-primary/20 transition-all">
              {round.target.sound}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-medium">Ce sunet face:</p>
            <div className="text-8xl animate-bounce">{round.target.emoji}</div>
            <div className="text-2xl font-bold text-foreground">{round.target.name}</div>
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {round.options.map(opt => (
          <button key={opt.name} onClick={() => handleChoice(opt.name)}
            disabled={!!chosen}
            className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 font-bold transition-all duration-300
              ${!chosen ? `${opt.color} hover:scale-105 hover:shadow-lg cursor-pointer` : ""}
              ${chosen === opt.name && opt.name === round.target.name ? "bg-green-100 border-green-400 scale-105 shadow-lg" : ""}
              ${chosen === opt.name && opt.name !== round.target.name ? "bg-red-100 border-red-400" : ""}
              ${chosen && opt.name === round.target.name && chosen !== opt.name ? "bg-green-100 border-green-400" : ""}
            `}>
            {mode === "sound-to-animal" ? (
              <>
                <span className="text-4xl">{opt.emoji}</span>
                <span className="text-sm text-foreground">{opt.name}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-foreground px-2 text-center">{opt.sound}</span>
            )}
          </button>
        ))}
      </div>

      {chosen && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? "🎉 Corect! Bravo!" : `❌ Era ${mode === "sound-to-animal" ? round.target.name : round.target.sound}`}
        </div>
      )}
    </div>
  );
}
