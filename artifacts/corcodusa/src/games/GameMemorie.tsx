import { useState, useEffect } from "react";
import { playFlip, playCorrect, playWrong, playCelebrate } from "@/lib/sfx";

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

const THEMES: Record<string, { label: string; emoji: string; pairs: string[] }> = {
  animale: {
    label: "Animale", emoji: "🐾",
    pairs: ["🐶","🐱","🐸","🦋","🦄","🐬","🦊","🐧","🐘","🦁","🦒","🐯"],
  },
  fructe: {
    label: "Fructe & Mâncare", emoji: "🍎",
    pairs: ["🍎","🍋","🍓","🍇","🍉","🍒","🥝","🍑","🥭","🍍","🫐","🍊"],
  },
  numere: {
    label: "Cifre", emoji: "🔢",
    pairs: ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","0️⃣","💯"],
  },
  spatiu: {
    label: "Spațiu", emoji: "🚀",
    pairs: ["🚀","⭐","🌙","☀️","🪐","🌍","🌟","☄️","🛸","🌌","👨‍🚀","🔭"],
  },
};

const DIFFICULTIES = [
  { id: "easy",   label: "Ușor",  pairs: 6,  cols: 4 },
  { id: "medium", label: "Mediu", pairs: 8,  cols: 4 },
  { id: "hard",   label: "Greu",  pairs: 12, cols: 6 },
];

/* Non-repeating draw per theme — works like a shuffled deck: deal `count`
   emojis off the top, and only reshuffle used ones back in when the deck runs
   low. Consecutive rounds therefore never show the exact same set of cards
   (before this, `pairs.slice(0, count)` gave the SAME emojis every round). */
const decks = new Map<string, string[]>();
function drawPairs(themeKey: string, pool: string[], count: number): string[] {
  let deck = decks.get(themeKey) ?? [];
  if (deck.length < count) {
    const refill = pool.filter(e => !deck.includes(e)).sort(() => Math.random() - 0.5);
    deck = [...deck, ...refill];
  }
  decks.set(themeKey, deck.slice(count));
  return deck.slice(0, count);
}

function createCards(themeKey: string, pairs: string[], count: number) {
  const chosen = drawPairs(themeKey, pairs, count);
  return [...chosen, ...chosen]
    .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function GameMemorie() {
  const [themeKey, setThemeKey] = useState("animale");
  const [diffId, setDiffId] = useState("easy");
  const diff = DIFFICULTIES.find(d => d.id === diffId)!;
  const theme = THEMES[themeKey];

  const [cards, setCards] = useState(() => createCards(themeKey, theme.pairs, diff.pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [startMs, setStartMs] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [bestMoves, setBestMoves] = useState<Record<string, number>>({});
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startMs) / 1000)), 1000);
    return () => clearInterval(t);
  }, [won, startMs]);

  function restart(t = themeKey, d = diffId) {
    const theme = THEMES[t];
    const diff = DIFFICULTIES.find(x => x.id === d)!;
    setCards(createCards(t, theme.pairs, diff.pairs));
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
    setElapsed(0);
    setStartMs(Date.now());
    setCelebrate(false);
  }

  function changeTheme(t: string) { setThemeKey(t); restart(t, diffId); }
  function changeDiff(d: string) { setDiffId(d); restart(themeKey, d); }

  function handleFlip(id: number) {
    if (locked || won) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched || flipped.includes(id)) return;

    playFlip();
    const newFlipped = [...flipped, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [aId, bId] = newFlipped;
      const a = cards.find(c => c.id === aId)!;
      const b = cards.find(c => c.id === bId)!;
      if (a.emoji === b.emoji) {
        const next = cards.map(c => newFlipped.includes(c.id) ? { ...c, matched: true, flipped: true } : c);
        setCards(next);
        setFlipped([]);
        setLocked(false);
        const allDone = next.every(c => c.matched);
        if (allDone) {
          playCelebrate();
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 1800);
          setWon(true);
          const key = `${themeKey}-${diffId}`;
          setBestMoves(prev => ({ ...prev, [key]: Math.min(moves + 1, prev[key] ?? Infinity) }));
        } else {
          playCorrect();
        }
      } else {
        playWrong();
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  const matched = cards.filter(c => c.matched).length / 2;
  const key = `${themeKey}-${diffId}`;
  const best = bestMoves[key];

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {celebrate && <Confetti />}
      {/* Theme */}
      <div className="flex gap-2 flex-wrap justify-center">
        {Object.entries(THEMES).map(([k, t]) => (
          <button key={k} onClick={() => changeTheme(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${themeKey === k ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Difficulty */}
      <div className="flex gap-2">
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => changeDiff(d.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${diffId === d.id ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-5 text-sm font-bold text-muted-foreground">
        <span>🎯 {matched}/{diff.pairs}</span>
        <span>🔄 {moves}</span>
        <span>⏱ {elapsed}s</span>
        {best && <span className="text-primary">🏆 Record: {best}</span>}
      </div>

      {won ? (
        <div className="flex flex-col items-center gap-4 py-4 animate-in zoom-in duration-500">
          <div className="text-7xl animate-bounce">🏆</div>
          <div className="text-2xl font-display font-bold text-green-600">Felicitări!</div>
          <div className="text-center text-muted-foreground">
            <p>{elapsed}s · {moves} mutări</p>
            {best && moves <= best && <p className="text-primary font-bold">🎉 Nou record!</p>}
          </div>
          <button onClick={() => restart()} className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Joacă din nou
          </button>
        </div>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${diff.cols}, minmax(0, 1fr))` }}>
          {cards.map(card => (
            <button key={card.id} onClick={() => handleFlip(card.id)}
              className={`flex items-center justify-center rounded-2xl transition-all duration-300 font-bold select-none
                ${card.flipped || card.matched
                  ? "bg-white border-2 border-primary/20 shadow-sm"
                  : "bg-gradient-to-br from-primary to-primary/70 hover:from-primary/90 hover:scale-105 cursor-pointer shadow-md"}
                ${card.matched ? "opacity-50 scale-95" : ""}
              `}
              style={{
                width: diffId === "hard" ? "58px" : "70px",
                height: diffId === "hard" ? "58px" : "70px",
                fontSize: diffId === "hard" ? "24px" : "28px",
              }}>
              {card.flipped || card.matched ? card.emoji : "❓"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
