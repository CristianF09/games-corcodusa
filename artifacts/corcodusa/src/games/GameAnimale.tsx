import { useState } from "react";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";
import { DeckMap, shuffle } from "@/lib/exercise-deck";

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

/* ─── Data ────────────────────────────────────────────────── */
type Category = "domestice" | "salbatice" | "pasari" | "insecte";

const CATEGORY_TABS: { id: Category; label: string }[] = [
  { id: "domestice", label: "🏡 Domestice" },
  { id: "salbatice", label: "🌲 Sălbatice" },
  { id: "pasari",    label: "🐦 Păsări" },
  { id: "insecte",   label: "🐝 Insecte și gâze" },
];

type Animal = {
  name: string; emoji: string; cat: Category;
  habitat: string; food: string; sound?: string;
};

const ANIMALS: Animal[] = [
  // Domestice
  { name: "Vacă",      emoji: "🐄", cat: "domestice", habitat: "ferma",  food: "iarbă și fân",           sound: "Muu!" },
  { name: "Porc",      emoji: "🐷", cat: "domestice", habitat: "ferma",  food: "orice — e omnivor",      sound: "Groh!" },
  { name: "Câine",     emoji: "🐶", cat: "domestice", habitat: "casa",   food: "carne și oase",          sound: "Ham-ham!" },
  { name: "Pisică",    emoji: "🐱", cat: "domestice", habitat: "casa",   food: "carne și pește",         sound: "Miau!" },
  { name: "Oaie",      emoji: "🐑", cat: "domestice", habitat: "ferma",  food: "iarbă",                  sound: "Bee!" },
  { name: "Cal",       emoji: "🐴", cat: "domestice", habitat: "ferma",  food: "iarbă, fân și ovăz",     sound: "Iîîî!" },
  { name: "Capră",     emoji: "🐐", cat: "domestice", habitat: "ferma",  food: "iarbă și frunze",        sound: "Mee!" },
  { name: "Iepure",    emoji: "🐰", cat: "domestice", habitat: "casa",   food: "morcovi și salată" },
  // Sălbatice
  { name: "Lup",       emoji: "🐺", cat: "salbatice", habitat: "padure", food: "carne",                  sound: "Auuu!" },
  { name: "Urs",       emoji: "🐻", cat: "salbatice", habitat: "padure", food: "miere, fructe și pește", sound: "Morrr!" },
  { name: "Vulpe",     emoji: "🦊", cat: "salbatice", habitat: "padure", food: "șoareci și păsări mici" },
  { name: "Cerb",      emoji: "🦌", cat: "salbatice", habitat: "padure", food: "iarbă și frunze" },
  { name: "Leu",       emoji: "🦁", cat: "salbatice", habitat: "savana", food: "carne",                  sound: "Roarrr!" },
  { name: "Elefant",   emoji: "🐘", cat: "salbatice", habitat: "savana", food: "iarbă și frunze",        sound: "Barrr!" },
  { name: "Girafă",    emoji: "🦒", cat: "salbatice", habitat: "savana", food: "frunze de copac" },
  { name: "Delfin",    emoji: "🐬", cat: "salbatice", habitat: "ocean",  food: "pești",                  sound: "Clic-clic!" },
  { name: "Balenă",    emoji: "🐳", cat: "salbatice", habitat: "ocean",  food: "plancton și pești mici", sound: "Uuuum!" },
  // Păsări
  { name: "Găină",     emoji: "🐔", cat: "pasari",    habitat: "ferma",  food: "semințe și grăunțe",     sound: "Cot-cot-cot!" },
  { name: "Rață",      emoji: "🦆", cat: "pasari",    habitat: "ferma",  food: "plante de apă",          sound: "Mac-mac!" },
  { name: "Cocoș",     emoji: "🐓", cat: "pasari",    habitat: "ferma",  food: "semințe",                sound: "Cucuriguu!" },
  { name: "Bufniță",   emoji: "🦉", cat: "pasari",    habitat: "padure", food: "șoareci",                sound: "U-hu! U-hu!" },
  { name: "Papagal",   emoji: "🦜", cat: "pasari",    habitat: "casa",   food: "semințe și fructe",      sound: "Vorbește ca omul!" },
  { name: "Porumbel",  emoji: "🕊️", cat: "pasari",    habitat: "aer",    food: "semințe și firimituri",  sound: "Gru-gru!" },
  { name: "Vultur",    emoji: "🦅", cat: "pasari",    habitat: "aer",    food: "carne" },
  { name: "Pinguin",   emoji: "🐧", cat: "pasari",    habitat: "ocean",  food: "pești" },
  // Insecte și gâze
  { name: "Albină",    emoji: "🐝", cat: "insecte",   habitat: "aer",    food: "nectar din flori",       sound: "Bzzz!" },
  { name: "Fluture",   emoji: "🦋", cat: "insecte",   habitat: "aer",    food: "nectar" },
  { name: "Buburuză",  emoji: "🐞", cat: "insecte",   habitat: "padure", food: "insecte foarte mici" },
  { name: "Furnică",   emoji: "🐜", cat: "insecte",   habitat: "padure", food: "semințe și firimituri" },
  { name: "Greier",    emoji: "🦗", cat: "insecte",   habitat: "padure", food: "iarbă și frunze",        sound: "Cri-cri!" },
  { name: "Păianjen",  emoji: "🕷️", cat: "insecte",   habitat: "casa",   food: "insecte prinse în pânză" },
];

type Mode = "identifica" | "habitat" | "hrana" | "sunete";

const MODE_TABS: [Mode, string][] = [
  ["identifica", "🔍 Ce animal e?"],
  ["habitat",    "🏡 Unde trăiește?"],
  ["hrana",      "🍽️ Ce mănâncă?"],
  ["sunete",     "🔊 Sunete"],
];

const HABITATS = ["ferma", "casa", "padure", "ocean", "aer", "savana"];
const HABITAT_LABELS: Record<string, string> = {
  ferma: "🌾 La fermă", casa: "🏠 În casa omului", padure: "🌲 În pădure",
  ocean: "🌊 În ocean", aer: "☁️ În aer", savana: "🌍 În savană",
};

const DIFFICULTIES = [
  { id: "usor",  label: "🌱 Ușor",  options: 3 },
  { id: "mediu", label: "🌿 Mediu", options: 4 },
  { id: "greu",  label: "🌳 Greu",  options: 6 },
];

/** Animals are dealt from a per-category+mode deck: every animal in the
 *  category appears once before any repeats. */
const ANIMAL_DECKS = new DeckMap<Animal>((key) => {
  const [cat, mode] = key.split(":");
  const pool = ANIMALS.filter(a => a.cat === cat);
  return mode === "sunete" ? pool.filter(a => a.sound) : pool;
});

function generateRound(mode: Mode, cat: Category, diffId: string) {
  const wrongCount = DIFFICULTIES.find(d => d.id === diffId)!.options - 1;
  const target = ANIMAL_DECKS.next(`${cat}:${mode}`);
  const pool = ANIMALS.filter(a => a.cat === cat);

  if (mode === "habitat") {
    const wrong = shuffle(HABITATS.filter(h => h !== target.habitat)).slice(0, wrongCount);
    return { target, options: shuffle([target.habitat, ...wrong]) };
  }
  if (mode === "hrana") {
    // Wrong choices come from ALL animals' foods so there's always variety.
    const foods = [...new Set(ANIMALS.map(a => a.food).filter(f => f !== target.food))];
    return { target, options: shuffle([target.food, ...shuffle(foods).slice(0, wrongCount)]) };
  }
  // "identifica" and "sunete" — the answer is the animal's name.
  const wrong = shuffle(pool.filter(a => a.name !== target.name)).slice(0, wrongCount);
  return { target, options: shuffle([target.name, ...wrong.map(a => a.name)]) };
}

export default function GameAnimale() {
  const [mode, setMode] = useState<Mode>("identifica");
  const [cat, setCat] = useState<Category>("domestice");
  const [diffId, setDiffId] = useState("usor");
  const [round, setRound] = useState(() => generateRound("identifica", "domestice", "usor"));
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  // The sounds quiz needs at least 3 animals with a sound in the category.
  const soundPoolSize = ANIMALS.filter(a => a.cat === cat && a.sound).length;
  const visibleModes = MODE_TABS.filter(([m]) => m !== "sunete" || soundPoolSize >= 3);

  function nextRound(m = mode, c = cat, d = diffId) {
    setRound(generateRound(m, c, d));
    setChosen(null);
  }

  function resetScore() { setScore(0); setTotal(0); setStreak(0); }

  function changeMode(m: Mode) { setMode(m); resetScore(); nextRound(m, cat, diffId); }
  function changeCat(c: Category) {
    setCat(c);
    resetScore();
    // A category without enough sounds can't keep the sounds quiz.
    const m = mode === "sunete" && ANIMALS.filter(a => a.cat === c && a.sound).length < 3 ? "identifica" : mode;
    setMode(m);
    nextRound(m, c, diffId);
  }
  function changeDifficulty(d: string) { setDiffId(d); resetScore(); nextRound(mode, cat, d); }

  const correctValue =
    mode === "habitat" ? round.target.habitat :
    mode === "hrana" ? round.target.food :
    round.target.name;

  function handleChoice(val: string) {
    if (chosen) return;
    setChosen(val);
    setTotal(t => t + 1);
    if (val === correctValue) {
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
    setTimeout(() => nextRound(), 2000);
  }

  const correct = chosen !== null && chosen === correctValue;

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {celebrate && <Confetti />}

      {/* Animal categories */}
      <div className="flex gap-2 flex-wrap justify-center">
        {CATEGORY_TABS.map(c => (
          <button key={c.id} onClick={() => changeCat(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${cat === c.id ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Quiz modes */}
      <div className="flex gap-2 flex-wrap justify-center">
        {visibleModes.map(([m, lbl]) => (
          <button key={m} onClick={() => changeMode(m)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === m ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Difficulty */}
      <div className="flex gap-2 items-center">
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => changeDifficulty(d.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${diffId === d.id ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
            {d.label}
          </button>
        ))}
        <span className="text-sm font-bold text-primary ml-2">⭐ {score}/{total}</span>
        {streak >= 2 && <span className="text-xs font-bold text-orange-500 animate-pulse">🔥 {streak}</span>}
      </div>

      {/* Question card */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 w-full max-w-xs text-center shadow-inner">
        {mode === "sunete" ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">Ce animal face sunetul:</p>
            <div className="text-2xl font-display font-bold text-primary bg-primary/10 px-6 py-3 rounded-2xl inline-block">
              {round.target.sound}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              {mode === "identifica" ? "Ce animal este în imagine?" :
               mode === "habitat" ? "Unde trăiește acest animal?" :
               "Ce mănâncă acest animal?"}
            </p>
            <div className="flex justify-center"><KidEmoji emoji={round.target.emoji} size={90} /></div>
            {mode !== "identifica" && (
              <div className="text-xl font-bold mt-2">{round.target.name}</div>
            )}
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {round.options.map(opt => {
          const display =
            mode === "habitat" ? HABITAT_LABELS[opt] ?? opt :
            mode === "sunete" ? `${ANIMALS.find(a => a.name === opt)?.emoji ?? ""} ${opt}` :
            opt;
          const isRight = opt === correctValue;
          return (
            <button key={opt} onClick={() => handleChoice(opt)} disabled={!!chosen}
              className={`py-3 px-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 shadow-md text-center
                ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                ${chosen === opt && isRight ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                ${chosen === opt && !isRight ? "bg-red-100 border-red-400 text-red-600" : ""}
                ${chosen && isRight && chosen !== opt ? "bg-green-100 border-green-400 text-green-700" : ""}
              `}>
              {display}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${correct ? "text-green-600" : "text-red-500"}`}>
          {correct ? "🎉 Corect! Bravo!" : (
            mode === "habitat" ? `❌ Trăiește ${HABITAT_LABELS[round.target.habitat].toLowerCase()}` :
            mode === "hrana" ? `❌ Mănâncă ${round.target.food}` :
            `❌ Era ${round.target.name}`
          )}
        </div>
      )}

      {/* Fun fact after a correct answer */}
      {chosen && correct && (
        <div className="text-sm bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-800 text-center max-w-sm">
          🌟 {round.target.name} trăiește {HABITAT_LABELS[round.target.habitat].toLowerCase()} și mănâncă {round.target.food}.
        </div>
      )}
    </div>
  );
}
