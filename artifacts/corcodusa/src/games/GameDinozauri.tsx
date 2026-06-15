import { useState } from "react";

const WORDS = [
  { word: "PISICĂ", emoji: "🐱", hint: "Animal de casă care toarce" },
  { word: "CÂINE", emoji: "🐶", hint: "Prietenul omului" },
  { word: "CASĂ", emoji: "🏠", hint: "Unde locuiești" },
  { word: "CARTE", emoji: "📚", hint: "Citești din ea" },
  { word: "MERE", emoji: "🍎", hint: "Fruct roșu și dulce" },
  { word: "SOARE", emoji: "☀️", hint: "Strălucește pe cer" },
  { word: "LUNĂ", emoji: "🌙", hint: "Se vede noaptea" },
  { word: "COPAC", emoji: "🌳", hint: "Crește în pădure" },
  { word: "FLOARE", emoji: "🌸", hint: "Parfum frumos" },
  { word: "STEA", emoji: "⭐", hint: "Luminează noaptea" },
  { word: "BROASCĂ", emoji: "🐸", hint: "Sare și cronzăie" },
  { word: "PLOAIE", emoji: "🌧️", hint: "Cade din nori" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function GameDinozauri() {
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);

  const current = WORDS[wordIndex % WORDS.length];
  const letters = current.word.split("");
  const availableLetters = shuffle([...new Set(letters), ...shuffle("AEIOUÎĂÂ".split("")).slice(0, 3)]).filter((_, i, a) => a.indexOf(_) === i).slice(0, 12);

  function handleLetter(l: string) {
    if (celebrate) return;
    const needed = letters[typed.length];
    if (l === needed) {
      const next = [...typed, l];
      setTyped(next);
      setWrong([]);
      if (next.length === letters.length) {
        setCelebrate(true);
        setScore(s => s + 1);
        setTimeout(() => {
          setWordIndex(wi => wi + 1);
          setTyped([]);
          setWrong([]);
          setCelebrate(false);
        }, 1800);
      }
    } else {
      setWrong(prev => [...prev, l]);
      setTimeout(() => setWrong(w => w.filter(x => x !== l)), 600);
    }
  }

  const dinoProgress = typed.length / letters.length;

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none">
      {/* Score & word count */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <p className="text-sm text-muted-foreground font-medium">{current.hint}</p>
        <span className="text-sm font-bold text-primary">⭐ {score} cuvinte</span>
      </div>

      {/* Target emoji */}
      <div className={`text-7xl transition-all duration-300 ${celebrate ? "scale-125 animate-bounce" : ""}`}>
        {current.emoji}
      </div>

      {/* Dino progress bar */}
      <div className="w-full max-w-lg bg-muted rounded-full h-10 overflow-hidden border-2 border-border relative">
        <div
          className="h-full bg-gradient-to-r from-secondary to-secondary/70 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${Math.max(10, dinoProgress * 100)}%` }}>
          <span className="text-2xl">🦕</span>
        </div>
      </div>

      {/* Word slots */}
      <div className="flex gap-2 flex-wrap justify-center">
        {letters.map((l, i) => (
          <div key={i}
            className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-2 transition-all duration-200
              ${typed[i] ? "bg-secondary/20 border-secondary text-foreground scale-105" : "bg-white border-dashed border-muted-foreground/40"}
              ${celebrate && typed[i] ? "bg-green-100 border-green-400 text-green-700" : ""}
            `}>
            {typed[i] || ""}
          </div>
        ))}
      </div>

      {celebrate && (
        <div className="text-2xl font-bold text-green-600 animate-bounce">🎉 Bravo! Ai scris {current.word}!</div>
      )}

      {/* Letter keyboard */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {availableLetters.map((l, i) => (
          <button key={i} onClick={() => handleLetter(l)}
            disabled={celebrate}
            className={`w-12 h-12 rounded-xl text-xl font-display font-bold border-2 transition-all duration-200
              ${wrong.includes(l) ? "bg-red-100 border-red-400 text-red-600 scale-90" : "bg-white hover:bg-primary/10 hover:border-primary border-border hover:scale-110 shadow-sm"}
            `}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
