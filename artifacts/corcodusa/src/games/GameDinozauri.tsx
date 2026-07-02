import { useState, useMemo } from "react";
import { playWrong, playCelebrate, playClick } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";

/** Words are DEX dictionary base forms (no articled forms like "ursul" or
 *  "mărul") and every emoji matches its word. */
const CATEGORIES: Record<string, { label: string; emoji: string; words: { word: string; emoji: string; hint: string }[] }> = {
  animale: {
    label: "Animale", emoji: "🐾",
    words: [
      { word: "PISICĂ", emoji: "🐱", hint: "Animal de casă care toarce" },
      { word: "CÂINE", emoji: "🐶", hint: "Prietenul omului" },
      { word: "IEPURE", emoji: "🐰", hint: "Sare și are urechi lungi" },
      { word: "URS", emoji: "🐻", hint: "Hibernează iarna" },
      { word: "TIGRU", emoji: "🐯", hint: "Pisică mare cu dungi" },
      { word: "ELEFANT", emoji: "🐘", hint: "Are trompă și e uriaș" },
      { word: "LEU", emoji: "🦁", hint: "Regele animalelor" },
      { word: "VULPE", emoji: "🦊", hint: "Animal viclean din povești" },
      { word: "LUP", emoji: "🐺", hint: "Urlă la lună" },
      { word: "GIRAFĂ", emoji: "🦒", hint: "Are gâtul foarte lung" },
    ],
  },
  fructe: {
    label: "Fructe", emoji: "🍎",
    words: [
      { word: "MĂR", emoji: "🍎", hint: "Fruct roșu sau verde" },
      { word: "PARĂ", emoji: "🍐", hint: "Fruct galben cu formă specială" },
      { word: "BANANĂ", emoji: "🍌", hint: "Galbenă și curbată" },
      { word: "AFINĂ", emoji: "🫐", hint: "Fruct mic și albastru de pădure" },
      { word: "CIREAȘĂ", emoji: "🍒", hint: "Roșie și vine câte două" },
      { word: "PEPENE", emoji: "🍉", hint: "Mare, verde pe dinafară, roșu pe dinăuntru" },
      { word: "CĂPȘUNĂ", emoji: "🍓", hint: "Roșie, cu semințe mici pe coajă" },
      { word: "LĂMÂIE", emoji: "🍋", hint: "Galbenă și foarte acră" },
      { word: "STRUGURE", emoji: "🍇", hint: "Crește în ciorchine" },
      { word: "ANANAS", emoji: "🍍", hint: "Fruct exotic cu coroană" },
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
      { word: "MARO", emoji: "🟤", hint: "Culoarea ciocolatei" },
      { word: "NEGRU", emoji: "⚫", hint: "Culoarea nopții" },
      { word: "ALB", emoji: "⚪", hint: "Culoarea zăpezii" },
      { word: "ROZ", emoji: "🩷", hint: "Culoarea flamingo-ului" },
    ],
  },
  corp: {
    label: "Corpul meu", emoji: "🧒",
    words: [
      { word: "OCHI", emoji: "👁️", hint: "Cu el vedem" },
      { word: "NAS", emoji: "👃", hint: "Cu el mirosim" },
      { word: "URECHE", emoji: "👂", hint: "Cu ea auzim" },
      { word: "MÂNĂ", emoji: "🤚", hint: "Cu ea apucăm lucruri" },
      { word: "PICIOR", emoji: "🦵", hint: "Cu el mergem" },
      { word: "INIMĂ", emoji: "❤️", hint: "Pompează sânge în corp" },
      { word: "GURĂ", emoji: "👄", hint: "Cu ea vorbim și mâncăm" },
      { word: "DINTE", emoji: "🦷", hint: "Alb și tare, în gură" },
      { word: "DEGET", emoji: "☝️", hint: "Avem zece la mâini" },
      { word: "LIMBĂ", emoji: "👅", hint: "Cu ea gustăm" },
    ],
  },
  natura: {
    label: "Natură", emoji: "🌳",
    words: [
      { word: "SOARE", emoji: "☀️", hint: "Ne dă lumină și căldură" },
      { word: "LUNĂ", emoji: "🌙", hint: "Strălucește noaptea" },
      { word: "STEA", emoji: "⭐", hint: "Sclipește pe cerul nopții" },
      { word: "NOR", emoji: "☁️", hint: "Alb și pufos, pe cer" },
      { word: "COPAC", emoji: "🌳", hint: "Are trunchi, ramuri și frunze" },
      { word: "FLOARE", emoji: "🌸", hint: "Colorată și frumos mirositoare" },
      { word: "MUNTE", emoji: "⛰️", hint: "Foarte înalt, cu vârf de piatră" },
      { word: "MARE", emoji: "🌊", hint: "Apă întinsă, cu valuri" },
      { word: "PLOAIE", emoji: "🌧️", hint: "Picături care cad din nori" },
      { word: "ZĂPADĂ", emoji: "❄️", hint: "Albă și rece, iarna" },
    ],
  },
};

const CAT_KEYS = Object.keys(CATEGORIES);

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

/** More keyboard letters + fewer lives = harder. Each difficulty plays
 *  differently: Ușor is almost only the needed letters, Greu is a hunt. */
const DIFFICULTIES = [
  { id: "usor",  label: "🌱 Ușor",  keys: 9,  lives: 5 },
  { id: "mediu", label: "🌿 Mediu", keys: 13, lives: 3 },
  { id: "greu",  label: "🌳 Greu",  keys: 17, lives: 2 },
];

function buildKeyboard(word: string, totalKeys: number) {
  const needed = [...new Set(word.split(""))];
  const extras = shuffle("AEIOUÎĂÂBCDFGHJKLMNPRSȘTVZ".split("").filter(c => !needed.includes(c)))
    .slice(0, Math.max(0, totalKeys - needed.length));
  return shuffle([...needed, ...extras]);
}

export default function GameDinozauri() {
  const [catKey, setCatKey] = useState("animale");
  const [diffId, setDiffId] = useState("mediu");
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const diff = DIFFICULTIES.find(d => d.id === diffId)!;
  const cat = CATEGORIES[catKey];
  // Easiest (shortest) words first, harder/longer words later — gives natural difficulty progression.
  const available = cat.words.filter((_, i) => !usedIndices.has(i)).sort((a, b) => a.word.length - b.word.length);
  const categoryDone = available.length === 0;
  const current = categoryDone ? cat.words[0] : available[0];
  const letters = current.word.split("");
  // Memoized so the keyboard doesn't reshuffle on every render (each typed
  // letter used to scramble the layout under the child's finger).
  const keyboard = useMemo(
    () => buildKeyboard(current.word, diff.keys),
    [current.word, diff.keys],
  );

  function handleLetter(l: string) {
    if (celebrate || lives === 0) return;
    const needed = letters[typed.length];
    if (l === needed) {
      const next = [...typed, l];
      setTyped(next);
      setWrong(new Set());
      if (next.length === letters.length) {
        playCelebrate();
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
      } else {
        playClick();
      }
    } else {
      playWrong();
      setWrong(prev => new Set([...prev, l]));
      setTimeout(() => setWrong(prev => { const n = new Set(prev); n.delete(l); return n; }), 700);
      setLives(lv => {
        const next = lv - 1;
        if (next === 0) setTimeout(() => {
          setLives(diff.lives); setTyped([]); setWrong(new Set()); setCelebrate(false);
          setShowHint(false); setHintUsed(false);
          setWordIndex(wi => wi + 1);
        }, 1500);
        return next;
      });
    }
  }

  function changeCategory(k: string, d = diffId) {
    setCatKey(k);
    setTyped([]);
    setWrong(new Set());
    setCelebrate(false);
    setWordIndex(0);
    setLives(DIFFICULTIES.find(x => x.id === d)!.lives);
    setUsedIndices(new Set());
    setShowHint(false);
    setHintUsed(false);
  }

  function changeDifficulty(d: string) {
    setDiffId(d);
    setScore(0);
    changeCategory(catKey, d);
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

      {/* Difficulty */}
      <div className="flex gap-2">
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => changeDifficulty(d.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${diffId === d.id ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="flex gap-1">
          {Array.from({ length: diff.lives }).map((_, i) => (
            <span key={i} className={`text-xl ${i < lives ? "opacity-100" : "opacity-20"}`}>❤️</span>
          ))}
        </div>
        <span className="text-sm font-bold text-primary">⭐ {score} pct</span>
        <span className="text-sm text-muted-foreground">{usedIndices.size}/{cat.words.length} cuvinte</span>
      </div>

      {categoryDone ? (
        /* Whole category finished — celebrate instead of looping the first
           word forever (the old logic never ended). */
        <div className="flex flex-col items-center gap-3 py-8 animate-in zoom-in duration-500">
          <div className="text-7xl animate-bounce">🏆</div>
          <div className="text-2xl font-display font-bold text-green-600">
            Ai terminat categoria {cat.label}!
          </div>
          <p className="text-muted-foreground">⭐ {score} puncte adunate</p>
          <button onClick={() => changeCategory(catKey)}
            className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:-translate-y-1 transition-all">
            Joacă din nou
          </button>
        </div>
      ) : (
      <>
      <p className="text-sm font-bold text-foreground">🔍 Identifică imaginea și scrie cuvântul!</p>

      {/* Target emoji */}
      <div className={`transition-all duration-300 ${celebrate ? "scale-125 animate-bounce" : ""}`}>
        <KidEmoji emoji={current.emoji} size={76} />
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
      </>
      )}
    </div>
  );
}
