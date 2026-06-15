import { useState, useEffect } from "react";

const EMOJI_PAIRS = ["🐶","🐱","🐸","🦋","🌟","🍎","🎈","🦄","🐬","🦊","🐧","🦁"];

function createCards(pairCount: number) {
  const emojis = EMOJI_PAIRS.slice(0, pairCount);
  const pairs = [...emojis, ...emojis].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  return pairs.sort(() => Math.random() - 0.5);
}

export default function GameMemorie() {
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard">("easy");
  const pairCount = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12;
  const cols = difficulty === "easy" ? 4 : difficulty === "medium" ? 4 : 6;

  const [cards, setCards] = useState(() => createCards(6));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [won]);

  function restart(diff = difficulty) {
    const pc = diff === "easy" ? 6 : diff === "medium" ? 8 : 12;
    setCards(createCards(pc));
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
    setElapsed(0);
  }

  function changeDiff(d: "easy"|"medium"|"hard") {
    setDifficulty(d);
    restart(d);
  }

  function handleFlip(id: number) {
    if (locked || won) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!);
      if (a.emoji === b.emoji) {
        setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
        setFlipped([]);
        setLocked(false);
        if (cards.filter(c => !c.matched).length === 2) {
          setTimeout(() => setWon(true), 300);
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  const matched = cards.filter(c => c.matched).length / 2;

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Controls */}
      <div className="flex items-center justify-between w-full max-w-xl flex-wrap gap-3">
        <div className="flex gap-2">
          {(["easy","medium","hard"] as const).map(d => (
            <button key={d} onClick={() => changeDiff(d)}
              className={`px-3 py-1 rounded-full text-sm font-bold capitalize transition-all ${difficulty === d ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
              {d === "easy" ? "Ușor" : d === "medium" ? "Mediu" : "Greu"}
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-sm font-bold text-muted-foreground">
          <span>🎯 {matched}/{pairCount}</span>
          <span>🔄 {moves}</span>
          <span>⏱ {elapsed}s</span>
        </div>
      </div>

      {won ? (
        <div className="flex flex-col items-center gap-4 py-6 animate-in zoom-in duration-500">
          <div className="text-8xl">🏆</div>
          <div className="text-3xl font-display font-bold text-green-600">Felicitări!</div>
          <p className="text-muted-foreground text-center">
            Ai terminat în {elapsed} secunde cu {moves} mutări!
          </p>
          <button onClick={() => restart()}
            className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Joacă din nou
          </button>
        </div>
      ) : (
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {cards.map(card => (
            <button key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-400 shadow-md font-bold
                ${card.flipped || card.matched
                  ? "bg-white border-2 border-primary/30 scale-95"
                  : "bg-gradient-to-br from-primary to-primary/70 hover:from-primary/90 hover:scale-105 cursor-pointer"
                }
                ${card.matched ? "opacity-60" : ""}
              `}
              style={{ width: difficulty === "hard" ? "56px" : "70px", height: difficulty === "hard" ? "56px" : "70px" }}>
              {card.flipped || card.matched ? card.emoji : "❓"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
