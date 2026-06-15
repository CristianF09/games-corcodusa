import { useState } from "react";

type Shape = "cerc" | "pătrat" | "triunghi" | "stea" | "dreptunghi" | "romb";
type Color = "roșu" | "albastru" | "galben" | "verde" | "portocaliu" | "violet";

const SHAPE_SVG: Record<Shape, (color: string) => JSX.Element> = {
  cerc: (c) => <svg viewBox="0 0 60 60" width="48" height="48"><circle cx="30" cy="30" r="28" fill={c} /></svg>,
  pătrat: (c) => <svg viewBox="0 0 60 60" width="48" height="48"><rect x="6" y="6" width="48" height="48" rx="4" fill={c} /></svg>,
  triunghi: (c) => <svg viewBox="0 0 60 60" width="48" height="48"><polygon points="30,4 56,56 4,56" fill={c} /></svg>,
  stea: (c) => <svg viewBox="0 0 60 60" width="48" height="48"><polygon points="30,4 37,22 56,22 42,34 47,54 30,42 13,54 18,34 4,22 23,22" fill={c} /></svg>,
  dreptunghi: (c) => <svg viewBox="0 0 80 50" width="64" height="40"><rect x="4" y="4" width="72" height="42" rx="4" fill={c} /></svg>,
  romb: (c) => <svg viewBox="0 0 60 60" width="48" height="48"><polygon points="30,2 58,30 30,58 2,30" fill={c} /></svg>,
};

const SHAPE_NAMES: Record<Shape, string> = {
  cerc: "cerc", pătrat: "pătrat", triunghi: "triunghi",
  stea: "stea", dreptunghi: "dreptunghi", romb: "romb",
};

const COLOR_HEX: Record<Color, string> = {
  roșu: "#ef4444", albastru: "#3b82f6", galben: "#eab308",
  verde: "#22c55e", portocaliu: "#f97316", violet: "#8b5cf6",
};

const COLOR_NAMES: Record<Color, string> = {
  roșu: "Roșu", albastru: "Albastru", galben: "Galben",
  verde: "Verde", portocaliu: "Portocaliu", violet: "Violet",
};

const SHAPES: Shape[] = ["cerc", "pătrat", "triunghi", "stea", "dreptunghi", "romb"];
const COLORS: Color[] = ["roșu", "albastru", "galben", "verde", "portocaliu", "violet"];

const COLOR_MIXING: { a: Color; b: Color; result: Color; desc: string }[] = [
  { a: "roșu", b: "albastru", result: "violet", desc: "Roșu + Albastru = Violet" },
  { a: "roșu", b: "galben", result: "portocaliu", desc: "Roșu + Galben = Portocaliu" },
  { a: "albastru", b: "galben", result: "verde", desc: "Albastru + Galben = Verde" },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

type Mode = "color" | "shape" | "count" | "mixing" | "shadow";

function generateColorRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrongColors = shuffle(COLORS.filter(c => c !== color)).slice(0, 3);
  return { shape, color, options: shuffle([color, ...wrongColors]) };
}

function generateCountRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const count = Math.floor(Math.random() * 7) + 2;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) { const w = Math.max(1, count + Math.floor(Math.random() * 5) - 2); if (w !== count) wrong.add(w); }
  return { shape, count, color, options: shuffle([...wrong]) };
}

function generateShadowRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const wrong = shuffle(SHAPES.filter(s => s !== shape)).slice(0, 3);
  return { shape, options: shuffle([shape, ...wrong]) };
}

export default function GameForme() {
  const [mode, setMode] = useState<Mode>("color");
  const [colorRound, setColorRound] = useState(generateColorRound);
  const [countRound, setCountRound] = useState(generateCountRound);
  const [shadowRound, setShadowRound] = useState(generateShadowRound);
  const [mixIdx, setMixIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mixRevealed, setMixRevealed] = useState(false);

  function nextRound() {
    setColorRound(generateColorRound());
    setCountRound(generateCountRound());
    setShadowRound(generateShadowRound());
    setChosen(null);
    setMixRevealed(false);
  }

  function handleAnswer(val: string, correct: string) {
    if (chosen) return;
    setChosen(val);
    setTotal(t => t + 1);
    if (val === correct) setScore(s => s + 1);
    setTimeout(() => nextRound(), 1800);
  }

  function changeMode(m: Mode) { setMode(m); setScore(0); setTotal(0); nextRound(); }

  const mixItem = COLOR_MIXING[mixIdx % COLOR_MIXING.length];

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([["color","🎨 Culori"],["shape","🔷 Forme"],["count","🔢 Numără"],["mixing","🧪 Amestec"],["shadow","👻 Umbra"]] as [Mode,string][]).map(([m, lbl]) => (
          <button key={m} onClick={() => changeMode(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${mode === m ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="text-sm font-bold text-primary">⭐ {score}/{total}</div>

      {/* COLOR MODE */}
      {mode === "color" && (
        <>
          <p className="font-bold text-lg text-center">Ce culoare are această formă?</p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner">
            {SHAPE_SVG[colorRound.shape](COLOR_HEX[colorRound.color])}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {colorRound.options.map(c => (
              <button key={c} onClick={() => handleAnswer(c, colorRound.color)}
                disabled={!!chosen}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === c && c === colorRound.color ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === c && c !== colorRound.color ? "bg-red-100 border-red-400 text-red-600" : ""}
                  ${chosen && c === colorRound.color && chosen !== c ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                <span className="w-5 h-5 rounded-full border border-white shadow flex-shrink-0" style={{ background: COLOR_HEX[c as Color] }} />
                {COLOR_NAMES[c as Color]}
              </button>
            ))}
          </div>
        </>
      )}

      {/* SHAPE MODE */}
      {mode === "shape" && (
        <>
          <p className="font-bold text-lg text-center">Cum se numește această formă?</p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner">
            {SHAPE_SVG[colorRound.shape]("#6366f1")}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {shuffle([colorRound.shape, ...shuffle(SHAPES.filter(s => s !== colorRound.shape)).slice(0, 3)]).map(s => (
              <button key={s} onClick={() => handleAnswer(s, colorRound.shape)}
                disabled={!!chosen}
                className={`px-4 py-3 rounded-2xl border-2 font-bold capitalize transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === s && s === colorRound.shape ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === s && s !== colorRound.shape ? "bg-red-100 border-red-400" : ""}
                  ${chosen && s === colorRound.shape && chosen !== s ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {SHAPE_NAMES[s]}
              </button>
            ))}
          </div>
        </>
      )}

      {/* COUNT MODE */}
      {mode === "count" && (
        <>
          <p className="font-bold text-lg text-center">Câte {SHAPE_NAMES[countRound.shape]} sunt?</p>
          <div className="flex flex-wrap gap-2 justify-center bg-card rounded-3xl border-2 border-border p-5 shadow-inner max-w-xs">
            {Array.from({ length: countRound.count }).map((_, i) => (
              <div key={i}>{SHAPE_SVG[countRound.shape](COLOR_HEX[countRound.color])}</div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {countRound.options.map(n => (
              <button key={n} onClick={() => handleAnswer(String(n), String(countRound.count))}
                disabled={!!chosen}
                className={`text-3xl font-display font-bold py-3 rounded-2xl border-2 transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === String(n) && n === countRound.count ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === String(n) && n !== countRound.count ? "bg-red-100 border-red-400" : ""}
                  ${chosen && n === countRound.count && chosen !== String(n) ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {/* MIXING MODE */}
      {mode === "mixing" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <p className="font-bold text-lg text-center">🧪 Ce culoare obții dacă amesteci?</p>
          <div className="flex items-center gap-4 bg-card rounded-3xl border-2 border-border p-6 shadow-inner w-full justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg" style={{ background: COLOR_HEX[mixItem.a] }} />
              <span className="text-xs font-bold">{COLOR_NAMES[mixItem.a]}</span>
            </div>
            <span className="text-3xl font-bold">+</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg" style={{ background: COLOR_HEX[mixItem.b] }} />
              <span className="text-xs font-bold">{COLOR_NAMES[mixItem.b]}</span>
            </div>
            <span className="text-3xl font-bold text-muted-foreground">=</span>
            <button onClick={() => setMixRevealed(true)}
              className={`w-14 h-14 rounded-full border-4 border-white shadow-lg transition-all duration-500 ${mixRevealed ? "" : "bg-muted animate-pulse"}`}
              style={mixRevealed ? { background: COLOR_HEX[mixItem.result] } : {}} />
          </div>
          {mixRevealed ? (
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{mixItem.desc}</p>
              <button onClick={() => { setMixIdx(i => i + 1); setMixRevealed(false); }}
                className="mt-3 px-6 py-2 bg-primary text-white font-bold rounded-full shadow hover:-translate-y-1 transition-all">
                Următoarea ▶
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Apasă pe cercul gol ca să vezi rezultatul!</p>
          )}
          <div className="mt-2 text-sm text-muted-foreground text-center bg-muted/30 rounded-xl p-3">
            <strong>Culorile primare:</strong> Roșu, Galben, Albastru<br/>
            <span className="text-xs">Din ele se fac toate celelalte culori!</span>
          </div>
        </div>
      )}

      {/* SHADOW MODE */}
      {mode === "shadow" && (
        <>
          <p className="font-bold text-lg text-center">Care formă are această umbră?</p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner">
            {SHAPE_SVG[shadowRound.shape]("#1f2937")}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {shadowRound.options.map(s => (
              <button key={s} onClick={() => handleAnswer(s, shadowRound.shape)}
                disabled={!!chosen}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 font-bold transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === s && s === shadowRound.shape ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === s && s !== shadowRound.shape ? "bg-red-100 border-red-400" : ""}
                  ${chosen && s === shadowRound.shape && chosen !== s ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {SHAPE_SVG[s]("#6366f1")}
                <span className="text-xs capitalize">{SHAPE_NAMES[s]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {chosen !== null && mode !== "mixing" && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${chosen === (mode === "color" ? colorRound.color : mode === "count" ? String(countRound.count) : mode === "shadow" ? shadowRound.shape : colorRound.shape) ? "text-green-600" : "text-red-500"}`}>
          {chosen === (mode === "color" ? colorRound.color : mode === "count" ? String(countRound.count) : mode === "shadow" ? shadowRound.shape : colorRound.shape) ? "🎉 Corect! Bravo!" : "❌ Mai încearcă!"}
        </div>
      )}
    </div>
  );
}
