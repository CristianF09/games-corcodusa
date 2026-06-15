import { useState } from "react";

const LETTERS: Record<string, { word: string; emoji: string; sound: string }> = {
  A: { word: "Arici", emoji: "🦔", sound: "A ca în Arici" },
  Ă: { word: "Ăla", emoji: "👆", sound: "Ă ca în Ăla" },
  Â: { word: "Âncă", emoji: "⚓", sound: "Â ca în Âncă" },
  B: { word: "Broscuță", emoji: "🐸", sound: "B ca în Broscuță" },
  C: { word: "Cal", emoji: "🐴", sound: "C ca în Cal" },
  D: { word: "Delfin", emoji: "🐬", sound: "D ca în Delfin" },
  E: { word: "Elefant", emoji: "🐘", sound: "E ca în Elefant" },
  F: { word: "Fluture", emoji: "🦋", sound: "F ca în Fluture" },
  G: { word: "Găină", emoji: "🐔", sound: "G ca în Găină" },
  H: { word: "Hamster", emoji: "🐹", sound: "H ca în Hamster" },
  I: { word: "Iepure", emoji: "🐰", sound: "I ca în Iepure" },
  Î: { word: "Îngheță", emoji: "🧊", sound: "Î ca în Îngheță" },
  J: { word: "Jirafă", emoji: "🦒", sound: "J ca în Jirafă" },
  K: { word: "Koala", emoji: "🐨", sound: "K ca în Koala" },
  L: { word: "Leu", emoji: "🦁", sound: "L ca în Leu" },
  M: { word: "Maimuță", emoji: "🐒", sound: "M ca în Maimuță" },
  N: { word: "Nufăr", emoji: "🪷", sound: "N ca în Nufăr" },
  O: { word: "Oaie", emoji: "🐑", sound: "O ca în Oaie" },
  P: { word: "Pisică", emoji: "🐱", sound: "P ca în Pisică" },
  R: { word: "Rățușcă", emoji: "🦆", sound: "R ca în Rățușcă" },
  S: { word: "Soare", emoji: "☀️", sound: "S ca în Soare" },
  Ș: { word: "Șarpe", emoji: "🐍", sound: "Ș ca în Șarpe" },
  T: { word: "Tigru", emoji: "🐯", sound: "T ca în Tigru" },
  Ț: { word: "Țestoasă", emoji: "🐢", sound: "Ț ca în Țestoasă" },
  U: { word: "Urs", emoji: "🐻", sound: "U ca în Urs" },
  V: { word: "Vulpe", emoji: "🦊", sound: "V ca în Vulpe" },
  Z: { word: "Zebră", emoji: "🦓", sound: "Z ca în Zebră" },
};

const ALL_LETTERS = Object.keys(LETTERS);

export default function GameAlfabet() {
  const [selected, setSelected] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  function handleLetter(l: string) {
    setSelected(l);
    setDiscovered(prev => new Set([...prev, l]));
  }

  const info = selected ? LETTERS[selected] : null;

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none">
      {/* Progress */}
      <div className="flex items-center justify-between w-full max-w-xl">
        <p className="text-sm font-bold text-muted-foreground">
          Apasă pe o literă ca să o înveți!
        </p>
        <div className="text-sm font-bold text-primary">
          {discovered.size} / {ALL_LETTERS.length} litere
        </div>
      </div>

      {/* Letter popup */}
      {info && (
        <div className="w-full max-w-xs bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border-2 border-primary/30 p-6 text-center shadow-xl animate-in zoom-in duration-300">
          <div className="text-8xl mb-2">{info.emoji}</div>
          <div className="text-7xl font-display font-bold text-primary leading-none mb-2">{selected}</div>
          <div className="text-2xl font-bold text-foreground">{info.word}</div>
          <div className="text-sm text-muted-foreground mt-1">{info.sound}</div>
        </div>
      )}

      {/* Letter grid */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {ALL_LETTERS.map(l => (
          <button key={l}
            onClick={() => handleLetter(l)}
            className={`w-12 h-12 rounded-2xl text-xl font-display font-bold transition-all duration-200 shadow-sm
              ${selected === l ? "bg-primary text-white scale-110 shadow-lg" :
                discovered.has(l) ? "bg-secondary/30 text-secondary-foreground border-2 border-secondary/50" :
                "bg-white hover:bg-primary/10 hover:border-primary border-2 border-border hover:scale-105"
              }`}>
            {l}
          </button>
        ))}
      </div>

      {discovered.size === ALL_LETTERS.length && (
        <div className="text-2xl font-bold text-green-600 animate-bounce">
          🎉 Ai descoperit tot alfabetul! Bravo!
        </div>
      )}
    </div>
  );
}
