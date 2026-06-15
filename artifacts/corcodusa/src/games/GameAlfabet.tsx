import { useState } from "react";

const LETTERS: Record<string, { word: string; emoji: string; desc: string; type: "vocala"|"consoana" }> = {
  A: { word: "Arici", emoji: "🦔", desc: "Animal mic cu țepi", type: "vocala" },
  Ă: { word: "Ăsta", emoji: "👆", desc: "Cuvânt de indicat", type: "vocala" },
  Â: { word: "Înainte", emoji: "➡️", desc: "Direcție", type: "vocala" },
  B: { word: "Broscuță", emoji: "🐸", desc: "Sare și cronzăie la baltă", type: "consoana" },
  C: { word: "Cal", emoji: "🐴", desc: "Animal care nechează", type: "consoana" },
  D: { word: "Delfin", emoji: "🐬", desc: "Înoată în ocean și e inteligent", type: "consoana" },
  E: { word: "Elefant", emoji: "🐘", desc: "Cel mai mare animal de uscat", type: "vocala" },
  F: { word: "Fluture", emoji: "🦋", desc: "Zboară și are aripi colorate", type: "consoana" },
  G: { word: "Găină", emoji: "🐔", desc: "Face ouă și cotcodăcește", type: "consoana" },
  H: { word: "Hamster", emoji: "🐹", desc: "Animal mic și drăgălaș", type: "consoana" },
  I: { word: "Iepure", emoji: "🐰", desc: "Are urechi lungi și sare", type: "vocala" },
  Î: { word: "Înger", emoji: "👼", desc: "Are aripi și e bun", type: "vocala" },
  J: { word: "Jirafă", emoji: "🦒", desc: "Are gâtul cel mai lung", type: "consoana" },
  K: { word: "Koala", emoji: "🐨", desc: "Stă în copaci și mănâncă frunze", type: "consoana" },
  L: { word: "Leu", emoji: "🦁", desc: "Regele junglei", type: "consoana" },
  M: { word: "Maimuță", emoji: "🐒", desc: "Se cațără în copaci", type: "consoana" },
  N: { word: "Nufăr", emoji: "🪷", desc: "Floare care crește pe apă", type: "consoana" },
  O: { word: "Oaie", emoji: "🐑", desc: "Dă lână și bâie", type: "vocala" },
  P: { word: "Pisică", emoji: "🐱", desc: "Toarce și prinde șoareci", type: "consoana" },
  R: { word: "Rățușcă", emoji: "🦆", desc: "Înoată și face mac-mac", type: "consoana" },
  S: { word: "Soare", emoji: "☀️", desc: "Ne dă lumină și căldură", type: "consoana" },
  Ș: { word: "Șarpe", emoji: "🐍", desc: "Animal lung fără picioare", type: "consoana" },
  T: { word: "Tigru", emoji: "🐯", desc: "Pisică mare cu dungi", type: "consoana" },
  Ț: { word: "Țestoasă", emoji: "🐢", desc: "Merge încet și stă în carapace", type: "consoana" },
  U: { word: "Urs", emoji: "🐻", desc: "Hibernează iarna", type: "vocala" },
  V: { word: "Vulpe", emoji: "🦊", desc: "Animal viclean din povești", type: "consoana" },
  Z: { word: "Zebră", emoji: "🦓", desc: "Cal cu dungi albe și negre", type: "consoana" },
};

const ALL_LETTERS = Object.keys(LETTERS);

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

type Mode = "explore" | "quiz" | "match" | "vowels";

function generateQuiz() {
  const target = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  const wrong = shuffle(ALL_LETTERS.filter(l => l !== target)).slice(0, 3);
  return { target, options: shuffle([target, ...wrong]) };
}

function generateMatchRound() {
  const pairs = shuffle(ALL_LETTERS).slice(0, 4);
  return { pairs, shuffled: shuffle([...pairs]) };
}

export default function GameAlfabet() {
  const [mode, setMode] = useState<Mode>("explore");
  const [selected, setSelected] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all"|"vocala"|"consoana">("all");

  // Quiz state
  const [quiz, setQuiz] = useState(generateQuiz);
  const [quizChosen, setQuizChosen] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  // Match state
  const [match, setMatch] = useState(generateMatchRound);
  const [matchSelected, setMatchSelected] = useState<string | null>(null);
  const [matchPaired, setMatchPaired] = useState<string[]>([]);
  const [matchWrong, setMatchWrong] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState(0);

  const filteredLetters = ALL_LETTERS.filter(l =>
    filter === "all" || LETTERS[l].type === filter
  );

  // Explorer
  function handleLetter(l: string) {
    setSelected(l);
    setDiscovered(prev => new Set([...prev, l]));
  }

  // Quiz
  function handleQuizAnswer(l: string) {
    if (quizChosen) return;
    setQuizChosen(l);
    setQuizTotal(t => t + 1);
    if (l === quiz.target) setQuizScore(s => s + 1);
    setTimeout(() => { setQuiz(generateQuiz()); setQuizChosen(null); }, 1800);
  }

  // Match — match letters to their emoji description
  function handleMatchLetter(l: string) {
    if (matchPaired.includes(l)) return;
    if (!matchSelected) { setMatchSelected(l); return; }
    if (matchSelected === l) { setMatchSelected(null); return; }
    if (match.pairs.includes(matchSelected) && match.pairs.includes(l)) {
      // Swap — find matching pair from shuffled
      const correct = matchSelected === l || (match.pairs.indexOf(matchSelected) === match.shuffled.indexOf(l));
      if (matchSelected === l || match.shuffled[match.pairs.indexOf(matchSelected)] === l) {
        setMatchPaired(prev => [...prev, matchSelected, l]);
        setMatchScore(s => s + 1);
        setMatchSelected(null);
        if (matchPaired.length + 2 >= match.pairs.length * 2) {
          setTimeout(() => { setMatch(generateMatchRound()); setMatchPaired([]); }, 1500);
        }
      } else {
        setMatchWrong(l);
        setTimeout(() => { setMatchSelected(null); setMatchWrong(null); }, 700);
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {(["explore","quiz","vowels"] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border-2 ${mode === m ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {m === "explore" ? "🔍 Descoperă" : m === "quiz" ? "🎯 Quiz" : "🔤 Vocale/Consoane"}
          </button>
        ))}
      </div>

      {/* EXPLORE MODE */}
      {mode === "explore" && (
        <>
          <div className="flex gap-2 justify-center">
            {(["all","vocala","consoana"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === f ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
                {f === "all" ? "Toate" : f === "vocala" ? "🔵 Vocale" : "🟠 Consoane"}
              </button>
            ))}
          </div>

          {selected && (
            <div className="w-full max-w-sm bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border-2 border-primary/20 p-6 text-center shadow-xl animate-in zoom-in duration-300">
              <div className="text-7xl mb-2">{LETTERS[selected].emoji}</div>
              <div className="text-6xl font-display font-bold text-primary leading-none mb-1">{selected}</div>
              <div className="text-xl font-bold text-foreground">{LETTERS[selected].word}</div>
              <div className="text-sm text-muted-foreground mt-1 italic">{LETTERS[selected].desc}</div>
              <div className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold inline-block ${LETTERS[selected].type === "vocala" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                {LETTERS[selected].type === "vocala" ? "🔵 Vocală" : "🟠 Consoană"}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {filteredLetters.map(l => (
              <button key={l} onClick={() => handleLetter(l)}
                className={`w-12 h-12 rounded-2xl text-xl font-display font-bold transition-all duration-200 border-2 shadow-sm
                  ${selected === l ? "bg-primary text-white scale-110 shadow-lg border-primary" :
                    discovered.has(l) ? (LETTERS[l].type === "vocala" ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-orange-100 border-orange-300 text-orange-700") :
                    "bg-white border-border hover:bg-primary/10 hover:border-primary hover:scale-105"
                  }`}>
                {l}
              </button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{discovered.size} / {ALL_LETTERS.length} litere descoperite</div>
        </>
      )}

      {/* QUIZ MODE */}
      {mode === "quiz" && (
        <>
          <div className="text-sm font-bold text-primary">⭐ {quizScore} / {quizTotal}</div>
          <div className="bg-card rounded-3xl border-2 border-border p-8 text-center shadow-inner w-full max-w-sm">
            <p className="text-sm text-muted-foreground mb-3">Ce literă vine din:</p>
            <div className="text-6xl mb-3">{LETTERS[quiz.target].emoji}</div>
            <div className="text-xl font-bold text-foreground">{LETTERS[quiz.target].desc}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {quiz.options.map(l => (
              <button key={l} onClick={() => handleQuizAnswer(l)}
                disabled={!!quizChosen}
                className={`text-4xl font-display font-bold py-4 rounded-2xl border-2 transition-all duration-300 shadow-md
                  ${!quizChosen ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1" : ""}
                  ${quizChosen === l && l === quiz.target ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${quizChosen === l && l !== quiz.target ? "bg-red-100 border-red-400 text-red-700" : ""}
                  ${quizChosen && l === quiz.target && quizChosen !== l ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}

      {/* VOWELS MODE */}
      {mode === "vowels" && (
        <>
          <div className="text-center">
            <p className="font-bold text-lg">Apasă doar pe <span className="text-blue-600">Vocale</span></p>
            <p className="text-sm text-muted-foreground">Vocalele sunt: A, Ă, Â, E, I, Î, O, U</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {shuffle([...ALL_LETTERS]).map(l => {
              const isVowel = LETTERS[l].type === "vocala";
              return (
                <button key={l} onClick={() => {
                  setDiscovered(prev => new Set([...prev, l]));
                }}
                  className={`w-12 h-12 rounded-2xl text-xl font-display font-bold transition-all duration-200 border-2 shadow-sm
                    ${discovered.has(l)
                      ? (isVowel ? "bg-green-100 border-green-400 text-green-700 scale-110" : "bg-red-100 border-red-300 text-red-600")
                      : "bg-white border-border hover:bg-primary/10 hover:border-primary hover:scale-105"
                    }`}>
                  {l}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 text-sm font-bold">
            <span className="text-green-600">✅ Vocale: {[...discovered].filter(l => LETTERS[l]?.type === "vocala").length}</span>
            <span className="text-red-500">❌ Greșit: {[...discovered].filter(l => LETTERS[l]?.type === "consoana").length}</span>
          </div>
          <button onClick={() => setDiscovered(new Set())} className="text-xs text-muted-foreground underline">Resetează</button>
        </>
      )}
    </div>
  );
}
