import { useState } from "react";

const CATEGORIES: Record<string, { label: string; emoji: string; words: { word: string; emoji: string; hint: string }[] }> = {
  animale: {
    label: "Animale", emoji: "🐾",
    words: [
      { word: "PISICĂ", emoji: "🐱", hint: "Animal de casă care toarce" },
      { word: "CÂINE", emoji: "🐶", hint: "Prietenul omului" },
      { word: "IEPURE", emoji: "🐰", hint: "Sare și are urechi lungi" },
      { word: "URSUL", emoji: "🐻", hint: "Hibernează iarna" },
      { word: "TIGRU", emoji: "🐯", hint: "Pisică mare cu dungi" },
      { word: "ELEFANT", emoji: "🐘", hint: "Are trompă și e uriaș" },
    ],
  },
  fructe: {
    label: "Fructe", emoji: "🍎",
    words: [
      { word: "MĂRUL", emoji: "🍎", hint: "Fruct roșu sau verde" },
      { word: "PARA", emoji: "🍐", hint: "Fruct galben cu formă specială" },
      { word: "BANANA", emoji: "🍌", hint: "Galbenă și curbată" },
      { word: "PRUNA", emoji: "🫐", hint: "Fruct mic și violet" },
      { word: "CIREAȘA", emoji: "🍒", hint: "Roșie și vine câte două" },
      { word: "PEPENELE", emoji: "🍉", hint: "Mare, verde pe dinafară, roșu pe dinăuntru" },
    ],
  },
  culori: {
    label: "Culori", emoji: "🎨",
    words: [
      { word: "ROȘU", emoji: "🔴", hint: "Culoarea focului" },
      { word: "VERDE", emoji: "🟢", hint: "Culoarea ierbii" },
      { word: "ALBASTRU", emoji: "🔵", hint: "Culoarea cerului" },
      { word: "GALBEN", emoji: "🟡", hint: "Culoarea soarelui" },
      { word: "PORTOCALIU", emoji: "🟠", hint: "Culoarea portocalei" },
      { word: "VIOLET", emoji: "🟣", hint: "Combinație de roșu și albastru" },
    ],
  },
  corp: {
    label: "Corpul meu", emoji: "🧒",
    words: [
      { word: "OCHI", emoji: "👁️", hint: "Cu el vedem" },
      { word: "NAS", emoji: "👃", hint: "Cu el mirosim" },
      { word: "URECHE", emoji: "👂", hint: "Cu ea auzim" },
      { word: "MÂNA", emoji: "🤚", hint: "Cu ea apucăm lucruri" },
      { word: "PICIORUL", emoji: "🦵", hint: "Cu el mergem" },
      { word: "INIMA", emoji: "❤️", hint: "Pompează sânge în corp" },
    ],
  },
};

const CAT_KEYS = Object.keys(CATEGORIES);

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function buildKeyboard(word: string) {
  const needed = [...new Set(word.split(""))];
  const extras = shuffle("AEIOUÎĂÂBCDFGHJKLMNPRSTV".split("").filter(c => !needed.includes(c))).slice(0, Math.max(0, 12 - needed.length));
  return shuffle([...needed, ...extras]).slice(0, 14);
}

export default function GameDinozauri() {
  const [catKey, setCatKey] = useState("animale");
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const cat = CATEGORIES[catKey];
  const available = cat.words.filter((_, i) => !usedIndices.has(i));
  const current = available.length > 0
    ? available[wordIndex % available.length]
    : cat.words[0];
  const letters = current.word.split("");
  const keyboard = buildKeyboard(current.word);

  function handleLetter(l: string) {
    if (celebrate || lives === 0) return;
    const needed = letters[typed.length];
    if (l === needed) {
      const next = [...typed, l];
      setTyped(next);
      setWrong(new Set());
      if (next.length === letters.length) {
        setCelebrate(true);
        setScore(s => s + (hintUsed ? 1 : 2));
        const idx = cat.words.indexOf(current);
        setUsedIndices(prev => new Set([...prev, idx]));
        setTimeout(() => {
          setTyped([]);
          setWrong(new Set());
          setCelebrate(false);
          setShowHint(false);
          setHintUsed(false);
          setWordIndex(wi => wi + 1);
        }, 1800);
      }
    } else {
      setWrong(prev => new Set([...prev, l]));
      setTimeout(() => setWrong(prev => { const n = new Set(prev); n.delete(l); return n; }), 700);
      setLives(lv => {
        const next = lv - 1;
        if (next === 0) setTimeout(() => { setLives(3); setTyped([]); setWrong(new Set()); setCelebrate(false); }, 1500);
        return next;
      });
    }
  }

  function changeCategory(k: string) {
    setCatKey(k);
    setTyped([]);
    setWrong(new Set());
    setCelebrate(false);
    setWordIndex(0);
    setLives(3);
    setUsedIndices(new Set());
    setShowHint(false);
    setHintUsed(false);
  }

  const progress = typed.length / letters.length;

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Category selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {CAT_KEYS.map(k => (
          <button key={k} onClick={() => changeCategory(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${catKey === k ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {CATEGORIES[k].emoji} {CATEGORIES[k].label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-xl ${i < lives ? "opacity-100" : "opacity-20"}`}>❤️</span>
          ))}
        </div>
        <span className="text-sm font-bold text-primary">⭐ {score} pct</span>
        <span className="text-sm text-muted-foreground">{usedIndices.size}/{cat.words.length} cuvinte</span>
      </div>

      {/* Target emoji */}
      <div className={`text-7xl transition-all duration-300 ${celebrate ? "scale-125 animate-bounce" : ""}`}>
        {current.emoji}
      </div>

      {/* Hint */}
      {showHint && (
        <div className="text-sm bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-yellow-800 text-center">
          💡 {current.hint}
        </div>
      )}

      {/* Dino progress bar */}
      <div className="w-full max-w-sm bg-muted rounded-full h-10 overflow-hidden border-2 border-border relative">
        <div className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${Math.max(8, progress * 100)}%` }}>
          <span className="text-2xl">🦕</span>
        </div>
      </div>

      {/* Word slots */}
      <div className="flex gap-2 flex-wrap justify-center">
        {letters.map((l, i) => (
          <div key={i}
            className={`w-11 h-13 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-2 transition-all duration-200
              ${typed[i] ? "bg-secondary/20 border-secondary text-foreground" : "bg-white border-dashed border-muted-foreground/40"}
              ${celebrate && typed[i] ? "bg-green-100 border-green-400 text-green-700" : ""}
            `}
            style={{ height: "52px" }}>
            {typed[i] || ""}
          </div>
        ))}
      </div>

      {celebrate && (
        <div className="text-2xl font-bold text-green-600 animate-bounce">
          🎉 {hintUsed ? "+1" : "+2"} pct — ai scris {current.word}!
        </div>
      )}
      {lives === 0 && !celebrate && (
        <div className="text-xl font-bold text-red-500 animate-bounce">❌ Cuvântul era: {current.word}</div>
      )}

      {/* Letter keyboard */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {keyboard.map((l, i) => (
          <button key={i} onClick={() => handleLetter(l)}
            disabled={celebrate || lives === 0}
            className={`w-11 h-11 rounded-xl text-xl font-display font-bold border-2 transition-all duration-200
              ${wrong.has(l) ? "bg-red-100 border-red-400 text-red-600 scale-90" :
                typed.includes(l) ? "bg-secondary/20 border-secondary/30 text-secondary-foreground" :
                "bg-white hover:bg-primary/10 hover:border-primary border-border hover:scale-110 shadow-sm"}
            `}>
            {l}
          </button>
        ))}
      </div>

      {/* Hint button */}
      {!showHint && !celebrate && lives > 0 && (
        <button onClick={() => { setShowHint(true); setHintUsed(true); }}
          className="text-xs text-muted-foreground underline hover:text-primary">
          💡 Arată indiciu (-1 punct)
        </button>
      )}
    </div>
  );
}
