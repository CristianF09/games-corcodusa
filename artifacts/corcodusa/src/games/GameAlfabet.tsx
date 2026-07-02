import { useState } from "react";
import { playCorrect, playWrong, playClick, playCelebrate } from "@/lib/sfx";
import StepTraceCanvas from "@/components/step-trace-canvas";
import { LETTER_STROKES } from "@/lib/stroke-data";
import { KidEmoji } from "@/components/kid-emoji";

/* ─── Data ───────────────────────────────────────────────── */
const LETTERS_DATA: Record<string, { word: string; emoji: string; desc: string; type: "vocala" | "consoana" }> = {
  A: { word: "Arici",    emoji: "🦔", desc: "Animal mic cu țepi",               type: "vocala"   },
  // Ă and Â never start Romanian words — show a word that CONTAINS them,
  // which is how school primers teach these letters.
  Ă: { word: "Măr",      emoji: "🍎", desc: "Fruct dulce — «ă» e în mijloc: m-ă-r", type: "vocala" },
  Â: { word: "Pâine",    emoji: "🍞", desc: "«â» stă mereu în mijloc: p-â-ine",  type: "vocala"   },
  B: { word: "Broscuță", emoji: "🐸", desc: "Sare și croncăne la baltă",        type: "consoana" },
  C: { word: "Cal",      emoji: "🐴", desc: "Animal care nechează",             type: "consoana" },
  D: { word: "Delfin",   emoji: "🐬", desc: "Înoată în ocean",                  type: "consoana" },
  E: { word: "Elefant",  emoji: "🐘", desc: "Cel mai mare animal de uscat",     type: "vocala"   },
  F: { word: "Fluture",  emoji: "🦋", desc: "Zboară cu aripi colorate",         type: "consoana" },
  G: { word: "Găină",    emoji: "🐔", desc: "Face ouă și cotcodăcește",         type: "consoana" },
  H: { word: "Hamster",  emoji: "🐹", desc: "Animal mic și drăgălaș",           type: "consoana" },
  I: { word: "Iepure",   emoji: "🐰", desc: "Are urechi lungi și sare",         type: "vocala"   },
  Î: { word: "Înger",    emoji: "👼", desc: "Are aripi și e bun",               type: "vocala"   },
  J: { word: "Jaguar",   emoji: "🐆", desc: "Pisică mare și rapidă din junglă", type: "consoana" },
  K: { word: "Koala",    emoji: "🐨", desc: "Stă în copaci, mănâncă frunze",   type: "consoana" },
  L: { word: "Leu",      emoji: "🦁", desc: "Regele junglei",                   type: "consoana" },
  M: { word: "Maimuță",  emoji: "🐒", desc: "Se cațără în copaci",              type: "consoana" },
  N: { word: "Nufăr",    emoji: "🪷", desc: "Floare pe apă",                    type: "consoana" },
  O: { word: "Oaie",     emoji: "🐑", desc: "Dă lână și behăie",                type: "vocala"   },
  P: { word: "Pisică",   emoji: "🐱", desc: "Toarce și prinde șoareci",          type: "consoana" },
  Q: { word: "Quokka",   emoji: "🦘", desc: "Animal mic și fericit din Australia", type: "consoana" },
  R: { word: "Rățușcă",  emoji: "🦆", desc: "Înoată și face mac-mac",           type: "consoana" },
  S: { word: "Soare",    emoji: "☀️",  desc: "Ne dă lumină și căldură",          type: "consoana" },
  Ș: { word: "Șarpe",    emoji: "🐍", desc: "Animal lung fără picioare",         type: "consoana" },
  T: { word: "Tigru",    emoji: "🐯", desc: "Pisică mare cu dungi",              type: "consoana" },
  Ț: { word: "Țestoasă", emoji: "🐢", desc: "Merge încet, stă în carapace",     type: "consoana" },
  U: { word: "Urs",      emoji: "🐻", desc: "Hibernează iarna",                 type: "vocala"   },
  V: { word: "Vulpe",    emoji: "🦊", desc: "Animal viclean din povești",        type: "consoana" },
  X: { word: "Xilofon",  emoji: "🎶", desc: "Instrument muzical colorat",        type: "consoana" },
  Y: { word: "Yo-yo",    emoji: "🪀", desc: "Jucărie care urcă și coboară",     type: "consoana" },
  Z: { word: "Zebră",    emoji: "🦓", desc: "Cal cu dungi albe și negre",       type: "consoana" },
};
const ALL_LETTERS = Object.keys(LETTERS_DATA);
const TRACE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVXYZ".split("");

/** 3 example words per traceable letter, shown next to the canvas so the
 *  child connects the letter shape to real words — capital letter on top. */
const TRACE_WORDS: Record<string, { word: string; emoji: string }[]> = {
  A: [{ word: "Avion", emoji: "✈️" }, { word: "Ananas", emoji: "🍍" }, { word: "Arici", emoji: "🦔" }],
  B: [{ word: "Banană", emoji: "🍌" }, { word: "Broască", emoji: "🐸" }, { word: "Bicicletă", emoji: "🚲" }],
  C: [{ word: "Casă", emoji: "🏠" }, { word: "Cal", emoji: "🐴" }, { word: "Cireșe", emoji: "🍒" }],
  D: [{ word: "Delfin", emoji: "🐬" }, { word: "Dovleac", emoji: "🎃" }, { word: "Dinozaur", emoji: "🦖" }],
  E: [{ word: "Elefant", emoji: "🐘" }, { word: "Elicopter", emoji: "🚁" }, { word: "Eschimos", emoji: "🧊" }],
  F: [{ word: "Fluture", emoji: "🦋" }, { word: "Fragă", emoji: "🍓" }, { word: "Furnică", emoji: "🐜" }],
  G: [{ word: "Girafă", emoji: "🦒" }, { word: "Gheață", emoji: "🧊" }, { word: "Greier", emoji: "🦗" }],
  H: [{ word: "Hamster", emoji: "🐹" }, { word: "Hipopotam", emoji: "🦛" }, { word: "Homar", emoji: "🦞" }],
  I: [{ word: "Iepure", emoji: "🐰" }, { word: "Insectă", emoji: "🐛" }, { word: "Iarnă", emoji: "❄️" }],
  J: [{ word: "Jaguar", emoji: "🐆" }, { word: "Jucărie", emoji: "🧸" }, { word: "Joben", emoji: "🎩" }],
  K: [{ word: "Koala", emoji: "🐨" }, { word: "Kiwi", emoji: "🥝" }, { word: "Kilogram", emoji: "⚖️" }],
  L: [{ word: "Leu", emoji: "🦁" }, { word: "Lămâie", emoji: "🍋" }, { word: "Lup", emoji: "🐺" }],
  M: [{ word: "Maimuță", emoji: "🐒" }, { word: "Morcov", emoji: "🥕" }, { word: "Mașină", emoji: "🚗" }],
  N: [{ word: "Nufăr", emoji: "🪷" }, { word: "Nor", emoji: "☁️" }, { word: "Nucă", emoji: "🌰" }],
  O: [{ word: "Oaie", emoji: "🐑" }, { word: "Ou", emoji: "🥚" }, { word: "Ochelari", emoji: "👓" }],
  P: [{ word: "Pisică", emoji: "🐱" }, { word: "Pepene", emoji: "🍉" }, { word: "Pinguin", emoji: "🐧" }],
  Q: [{ word: "Quokka", emoji: "🦘" }, { word: "Quiz", emoji: "🧠" }, { word: "Quad", emoji: "🏍️" }],
  R: [{ word: "Rățușcă", emoji: "🦆" }, { word: "Rachetă", emoji: "🚀" }, { word: "Rac", emoji: "🦀" }],
  S: [{ word: "Soare", emoji: "☀️" }, { word: "Stea", emoji: "⭐" }, { word: "Struț", emoji: "🦤" }],
  T: [{ word: "Tigru", emoji: "🐯" }, { word: "Telefon", emoji: "📱" }, { word: "Tort", emoji: "🎂" }],
  U: [{ word: "Urs", emoji: "🐻" }, { word: "Umbrelă", emoji: "☂️" }, { word: "Unicorn", emoji: "🦄" }],
  V: [{ word: "Vulpe", emoji: "🦊" }, { word: "Vapor", emoji: "🚢" }, { word: "Vacă", emoji: "🐄" }],
  X: [{ word: "Xilofon", emoji: "🎶" }],
  Y: [{ word: "Yo-yo", emoji: "🪀" }, { word: "Yeti", emoji: "❄️" }],
  Z: [{ word: "Zebră", emoji: "🦓" }, { word: "Zmeu", emoji: "🪁" }, { word: "Zahăr", emoji: "🍬" }],
};

/** Word bank for the "complete the word" picture game — first letter blanked. */
const WORD_BLANKS = [
  { word: "Casă",    emoji: "🏠" }, { word: "Avion",   emoji: "✈️" },
  { word: "Balon",   emoji: "🎈" }, { word: "Delfin",  emoji: "🐬" },
  { word: "Elefant", emoji: "🐘" }, { word: "Fluture", emoji: "🦋" },
  { word: "Girafă",  emoji: "🦒" }, { word: "Hamster", emoji: "🐹" },
  { word: "Iepure",  emoji: "🐰" }, { word: "Jaguar",  emoji: "🐆" },
  { word: "Koala",   emoji: "🐨" }, { word: "Leu",     emoji: "🦁" },
  { word: "Maimuță", emoji: "🐒" }, { word: "Nor",     emoji: "☁️" },
  { word: "Oaie",    emoji: "🐑" }, { word: "Pisică",  emoji: "🐱" },
  { word: "Rachetă", emoji: "🚀" }, { word: "Soare",   emoji: "☀️" },
  { word: "Tigru",   emoji: "🐯" }, { word: "Urs",     emoji: "🐻" },
  { word: "Vulpe",   emoji: "🦊" }, { word: "Zebră",   emoji: "🦓" },
].map(w => ({ ...w, letter: w.word[0].toUpperCase(), blanked: "_" + w.word.slice(1).toUpperCase() }));

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function genWordOptions(correctLetter: string) {
  const wrong = shuffle(TRACE_ALPHABET.filter(l => l !== correctLetter)).slice(0, 3);
  return shuffle([correctLetter, ...wrong]);
}
function genWordRound(order: number[], pos: number) {
  const item = WORD_BLANKS[order[pos % order.length]];
  return { item, options: genWordOptions(item.letter) };
}

/* ─── Cartoon letter with a face — googly eyes + smile drawn ON the letter
       itself, like classic kids' alphabet posters. ─────────── */
function LetterFace({ letter, color, size = 110 }: { letter: string; color: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-md flex-shrink-0">
      {/* Fat colorful letter body with dark outline */}
      <text x="50" y="82" fontSize="88" fontWeight="900" textAnchor="middle"
        fontFamily="'Arial Rounded MT Bold', 'Comic Sans MS', Arial, sans-serif"
        fill={color} stroke="#273043" strokeWidth="2.5" paintOrder="stroke">
        {letter}
      </text>
      {/* Googly eyes */}
      <circle cx="38" cy="34" r="10.5" fill="white" stroke="#273043" strokeWidth="2.2" />
      <circle cx="62" cy="34" r="10.5" fill="white" stroke="#273043" strokeWidth="2.2" />
      <circle cx="40.5" cy="36.5" r="4.6" fill="#273043" />
      <circle cx="64.5" cy="36.5" r="4.6" fill="#273043" />
      <circle cx="42" cy="35" r="1.6" fill="white" />
      <circle cx="66" cy="35" r="1.6" fill="white" />
      {/* Smile + rosy cheeks */}
      <path d="M41 55 Q50 65 59 55" stroke="#273043" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="50" r="4" fill="#f87171" opacity="0.55" />
      <circle cx="70" cy="50" r="4" fill="#f87171" opacity="0.55" />
    </svg>
  );
}

/* ─── Trace colors ───────────────────────────────────────── */
const LETTER_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899",
  "#f43f5e","#10b981","#0ea5e9","#a855f7",
];

/* ─── Main Component ──────────────────────────────────────── */
type Mode = "discover" | "trace" | "wordgame";

export default function GameAlfabet() {
  const [mode, setMode] = useState<Mode>("discover");

  // Discover
  const [selected, setSelected] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "vocala" | "consoana">("all");

  // Trace
  const [traceIdx, setTraceIdx] = useState(0);
  const [traceScore, setTraceScore] = useState(0);
  const [traceCelebrate, setTraceCelebrate] = useState(false);

  // Word game ("complete the word")
  const [wbOrder, setWbOrder] = useState(() => shuffle(WORD_BLANKS.map((_, i) => i)));
  const [wbPos, setWbPos] = useState(0);
  const [wbRound, setWbRound] = useState(() => genWordRound(wbOrder, 0));
  const [wbChosen, setWbChosen] = useState<string | null>(null);
  const [wbScore, setWbScore] = useState(0);
  const [wbTotal, setWbTotal] = useState(0);

  const filteredLetters = ALL_LETTERS.filter(l => filter === "all" || LETTERS_DATA[l].type === filter);

  function handleTraceComplete() {
    setTraceCelebrate(true);
    setTraceScore(s => s + 1);
    playCelebrate();
    setTimeout(() => {
      setTraceCelebrate(false);
      setTraceIdx(i => (i + 1) % TRACE_ALPHABET.length);
    }, 1200);
  }

  function handleWordAnswer(letter: string) {
    if (wbChosen) return;
    setWbChosen(letter);
    setWbTotal(t => t + 1);
    if (letter === wbRound.item.letter) {
      setWbScore(s => s + 1);
      playCorrect();
      setTimeout(() => {
        const next = wbPos + 1;
        setWbPos(next);
        setWbRound(genWordRound(wbOrder, next));
        setWbChosen(null);
      }, 1400);
    } else {
      playWrong();
      // Give an error, then let the child try again on the same word.
      setTimeout(() => setWbChosen(null), 900);
    }
  }

  function resetWordGame() {
    const order = shuffle(WORD_BLANKS.map((_, i) => i));
    setWbOrder(order); setWbPos(0); setWbRound(genWordRound(order, 0));
    setWbChosen(null); setWbScore(0); setWbTotal(0);
  }

  const curLetter = TRACE_ALPHABET[traceIdx];
  const curData = LETTERS_DATA[curLetter];

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([["discover","📖","Alfabetul"],["trace","✏️","Trasează"],["wordgame","🧩","Completează"]] as [Mode,string,string][]).map(([m,ic,lbl]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 flex items-center gap-1.5
              ${mode === m ? "bg-primary text-white border-primary shadow-md" : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
            <span>{ic}</span>{lbl}
          </button>
        ))}
      </div>

      {/* ── DISCOVER ── */}
      {mode === "discover" && (
        <>
          <div className="text-center">
            <p className="font-display font-bold text-xl text-foreground">Să învățăm alfabetul 😊</p>
            <p className="text-sm text-muted-foreground">Fiecare literă are un prieten vesel! Apasă pe o literă ca să-l descoperi.</p>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {(["all","vocala","consoana"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === f ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
                {f === "all" ? "Toate" : f === "vocala" ? "🔵 Vocale" : "🟠 Consoane"}
              </button>
            ))}
          </div>

          {selected && LETTERS_DATA[selected] && (
            <div className="w-full max-w-md bg-gradient-to-br from-primary/10 via-white to-secondary/10 rounded-3xl border-2 border-primary/20 p-6 shadow-xl animate-in zoom-in duration-300">
              <div className="flex items-center justify-center gap-5">
                {/* Left: the letter with its funny face */}
                <LetterFace letter={selected}
                  color={LETTER_COLORS[ALL_LETTERS.indexOf(selected) % LETTER_COLORS.length]} size={120} />
                {/* Right: the example image + details */}
                <div className="flex flex-col items-center text-center gap-1 min-w-0">
                  <KidEmoji emoji={LETTERS_DATA[selected].emoji} size={80} />
                  <div className="text-2xl font-bold text-foreground">{LETTERS_DATA[selected].word}</div>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${LETTERS_DATA[selected].type === "vocala" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    {LETTERS_DATA[selected].type === "vocala" ? "🔵 Vocală" : "🟠 Consoană"}
                  </span>
                  <div className="text-sm text-muted-foreground italic">{LETTERS_DATA[selected].desc}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {filteredLetters.map(l => {
              const isSel = selected === l;
              const isDisc = discovered.has(l);
              const tint = isSel ? "white" : isDisc ? (LETTERS_DATA[l].type === "vocala" ? "#1d4ed8" : "#c2410c") : "#94a3b8";
              return (
                <button key={l} onClick={() => { playClick(); setSelected(l); setDiscovered(p => new Set([...p, l])); }}
                  className={`w-14 h-14 rounded-2xl text-lg font-display font-bold transition-all duration-200 border-2 shadow-sm flex flex-col items-center justify-center gap-0.5
                    ${isSel ? "bg-primary text-white scale-110 shadow-lg border-primary" :
                      isDisc ? (LETTERS_DATA[l].type === "vocala" ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-orange-100 border-orange-300 text-orange-700") :
                      "bg-white border-border hover:bg-primary/10 hover:border-primary hover:scale-105"}`}>
                  <span className="leading-none">{l}</span>
                  <span className="flex gap-1">
                    <span className="w-[3px] h-[3px] rounded-full" style={{ background: tint }} />
                    <span className="w-[3px] h-[3px] rounded-full" style={{ background: tint }} />
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">{discovered.size}/{ALL_LETTERS.length} litere descoperite</p>
        </>
      )}

      {/* ── TRACE ── */}
      {mode === "trace" && (
        <>
          <div className="flex items-center justify-between w-full max-w-sm">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{curData?.emoji ?? "✏️"}</span>
              <div>
                <div className="text-sm font-bold text-foreground">{curData?.word ?? curLetter}</div>
                <div className="text-xs text-muted-foreground">Trasează litera mare (majusculă) {curLetter}!</div>
              </div>
            </div>
            <span className="text-sm font-bold text-primary">⭐ {traceScore}/{TRACE_ALPHABET.length}</span>
          </div>

          {/* Example words for this letter */}
          <div className="flex gap-2 justify-center flex-wrap">
            {(TRACE_WORDS[curLetter] ?? []).map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 bg-muted/50 rounded-xl px-3 py-2">
                <span className="text-2xl">{w.emoji}</span>
                <span className="text-xs font-bold text-muted-foreground">{w.word}</span>
              </div>
            ))}
          </div>
          {curLetter === "Q" && (
            <p className="text-xs italic text-muted-foreground -mt-2">Q e o literă rară în română — apare mai ales în cuvinte împrumutate.</p>
          )}

          {/* Progress through alphabet */}
          <div className="flex flex-wrap gap-1 justify-center max-w-sm">
            {TRACE_ALPHABET.map((l, i) => (
              <div key={l}
                className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center transition-all
                  ${i < traceIdx ? "bg-green-100 text-green-700 border border-green-300" :
                    i === traceIdx ? "bg-primary text-white shadow-md scale-110 border border-primary" :
                    "bg-muted text-muted-foreground/50"}`}>
                {l}
              </div>
            ))}
          </div>

          {traceCelebrate ? (
            <div className="flex flex-col items-center gap-3 py-4 animate-in zoom-in">
              <div className="text-7xl animate-bounce">🌟</div>
              <div className="text-2xl font-bold text-green-600">Bravo! Litera {curLetter}!</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground font-medium">
                Urmează pașii numerotați — sau colorează liber!
              </p>
              <StepTraceCanvas
                key={curLetter}
                strokes={LETTER_STROKES[curLetter]}
                color={LETTER_COLORS[traceIdx % LETTER_COLORS.length]}
                onComplete={handleTraceComplete} />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setTraceIdx(i => (i + TRACE_ALPHABET.length - 1) % TRACE_ALPHABET.length)}
              className="px-4 py-2 rounded-full text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/70 transition-all">
              ◀ Înapoi
            </button>
            <button onClick={() => { setTraceCelebrate(false); setTraceIdx(i => (i + 1) % TRACE_ALPHABET.length); }}
              className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow">
              Următor ▶
            </button>
          </div>
        </>
      )}

      {/* ── WORD GAME ── */}
      {mode === "wordgame" && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">⭐ {wbScore}/{wbTotal}</span>
            <div className="h-2 bg-muted rounded-full w-32 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${wbTotal ? (wbScore / wbTotal) * 100 : 0}%` }} />
            </div>
          </div>

          <p className="font-bold text-lg text-center">Ce literă completează cuvântul?</p>

          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border-2 border-border p-8 text-center shadow-inner w-full max-w-sm">
            <div className="text-7xl mb-3 drop-shadow">{wbRound.item.emoji}</div>
            <div className={`text-4xl font-display font-black tracking-wide ${wbChosen === wbRound.item.letter ? "text-green-600" : "text-foreground"}`}>
              {wbChosen === wbRound.item.letter ? wbRound.item.word.toUpperCase() : wbRound.item.blanked}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {wbRound.options.map(l => (
              <button key={l} onClick={() => handleWordAnswer(l)} disabled={wbChosen === wbRound.item.letter}
                className={`text-4xl font-display font-black py-4 rounded-2xl border-2 transition-all duration-300 shadow-md
                  ${!wbChosen ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1 hover:shadow-lg" : ""}
                  ${wbChosen === l && l === wbRound.item.letter ? "bg-green-100 border-green-400 text-green-700 scale-105 shadow-green-200" : ""}
                  ${wbChosen === l && l !== wbRound.item.letter ? "bg-red-100 border-red-400 text-red-700" : ""}
                `}>
                {l}
              </button>
            ))}
          </div>

          {wbChosen && (
            <div className={`text-xl font-bold animate-in zoom-in ${wbChosen === wbRound.item.letter ? "text-green-600" : "text-red-500"}`}>
              {wbChosen === wbRound.item.letter ? "🎉 Corect! Bravo!" : "❌ Nu e corect. Încearcă din nou!"}
            </div>
          )}

          <button onClick={resetWordGame} className="text-xs text-muted-foreground underline hover:text-primary transition-colors">
            Resetează scorul
          </button>
        </>
      )}
    </div>
  );
}
