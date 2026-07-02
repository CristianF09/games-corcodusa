import { useState, type ReactElement } from "react";
import { playCorrect, playWrong, playCelebrate } from "@/lib/sfx";
import StepTraceCanvas from "@/components/step-trace-canvas";
import { shapeStrokes } from "@/lib/stroke-data";

/* ─── Shape SVGs ─────────────────────────────────────────── */
type ShapeName = "cerc" | "pătrat" | "triunghi" | "stea" | "dreptunghi" | "romb" | "pentagon" | "hexagon";
type ColorName = "roșu" | "albastru" | "galben" | "verde" | "portocaliu" | "violet" | "roz" | "turcoaz";

const SHAPE_SVG: Record<ShapeName, (fill: string, stroke?: string) => ReactElement> = {
  cerc:        (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><circle cx="30" cy="30" r="27" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
  pătrat:      (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><rect x="6" y="6" width="48" height="48" rx="5" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
  triunghi:    (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><polygon points="30,4 57,56 3,56" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
  stea:        (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><polygon points="30,4 37,22 57,22 42,34 47,54 30,42 13,54 18,34 3,22 23,22" fill={f} stroke={s ?? "none"} strokeWidth="2"/></svg>,
  dreptunghi:  (f, s) => <svg viewBox="0 0 80 50" width="68" height="42"><rect x="4" y="4" width="72" height="42" rx="5" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
  romb:        (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><polygon points="30,2 58,30 30,58 2,30" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
  pentagon:    (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><polygon points="30,3 57,22 47,55 13,55 3,22" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
  hexagon:     (f, s) => <svg viewBox="0 0 60 60" width="52" height="52"><polygon points="30,2 56,16 56,44 30,58 4,44 4,16" fill={f} stroke={s ?? "none"} strokeWidth="3"/></svg>,
};
const SHAPE_NAMES: Record<ShapeName, string> = {
  cerc:"cerc", pătrat:"pătrat", triunghi:"triunghi", stea:"stea",
  dreptunghi:"dreptunghi", romb:"romb", pentagon:"pentagon", hexagon:"hexagon",
};
const COLOR_HEX: Record<ColorName, string> = {
  roșu:"#ef4444", albastru:"#3b82f6", galben:"#eab308", verde:"#22c55e",
  portocaliu:"#f97316", violet:"#8b5cf6", roz:"#ec4899", turcoaz:"#06b6d4",
};
const SHAPES: ShapeName[] = ["cerc","pătrat","triunghi","stea","dreptunghi","romb","pentagon","hexagon"];
const COLORS: ColorName[] = ["roșu","albastru","galben","verde","portocaliu","violet","roz","turcoaz"];

/** Real-world objects with their natural color, for "Colors to be a little
 *  more real" — color questions grounded in recognizable things, not just
 *  abstract shapes. */
const REAL_OBJECTS: { name: string; emoji: string; color: ColorName; q: string }[] = [
  { name: "stea",      emoji: "⭐", color: "galben",     q: "Ce culoare are o stea?" },
  { name: "nor",       emoji: "☁️", color: "albastru",   q: "Ce culoare are cerul cu un nor?" },
  { name: "copac",     emoji: "🌳", color: "verde",      q: "Ce culoare are un copac?" },
  { name: "măr",       emoji: "🍎", color: "roșu",       q: "Ce culoare are un măr?" },
  { name: "portocală", emoji: "🍊", color: "portocaliu", q: "Ce culoare are o portocală?" },
  { name: "strugure",  emoji: "🍇", color: "violet",     q: "Ce culoare are un strugure?" },
  { name: "flamingo",  emoji: "🦩", color: "roz",        q: "Ce culoare are un flamingo?" },
  { name: "val",       emoji: "🌊", color: "turcoaz",    q: "Ce culoare are un val de ocean?" },
];

/** Color-theory-accurate primary mixes only — keeps the quiz trustworthy. */
const COLOR_MIXING = [
  { a:"roșu" as ColorName,     b:"albastru" as ColorName, result:"violet" as ColorName,     desc:"🔴 + 🔵 = Violet" },
  { a:"roșu" as ColorName,     b:"galben" as ColorName,   result:"portocaliu" as ColorName, desc:"🔴 + 🟡 = Portocaliu" },
  { a:"albastru" as ColorName, b:"galben" as ColorName,   result:"verde" as ColorName,       desc:"🔵 + 🟡 = Verde" },
];

/** Romanian rainbow mnemonic — ROGVAIV (Roșu Portocaliu Galben Verde Albastru Indigo Violet). */
type RainbowColor = "roșu" | "portocaliu" | "galben" | "verde" | "albastru" | "indigo" | "violet";
const RAINBOW_ORDER: RainbowColor[] = ["roșu", "portocaliu", "galben", "verde", "albastru", "indigo", "violet"];
const RAINBOW_HEX: Record<RainbowColor, string> = {
  roșu: "#ef4444", portocaliu: "#f97316", galben: "#eab308", verde: "#22c55e",
  albastru: "#3b82f6", indigo: "#4f46e5", violet: "#8b5cf6",
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

/* ─── Tracing for shapes ─────────────────────────────────── */
// Ordered easiest → hardest: round, then simple polygons, then more vertices, star last (concave points are trickiest).
type TracableShape = "cerc" | "pătrat" | "triunghi" | "dreptunghi" | "romb" | "pentagon" | "hexagon" | "stea";
const TRACEABLE: TracableShape[] = ["cerc", "pătrat", "triunghi", "dreptunghi", "romb", "pentagon", "hexagon", "stea"];
const SHAPE_TRACE_COLORS: Record<TracableShape, string> = {
  cerc:"#ef4444", pătrat:"#3b82f6", triunghi:"#22c55e", dreptunghi:"#8b5cf6",
  romb:"#f97316", pentagon:"#06b6d4", hexagon:"#ec4899", stea:"#eab308",
};


/* ─── Quiz helpers ───────────────────────────────────────── */
type ColorRound =
  | { kind: "shape"; shape: ShapeName; color: ColorName; options: ColorName[] }
  | { kind: "object"; obj: typeof REAL_OBJECTS[number]; color: ColorName; options: ColorName[] };

function genColorRound(): ColorRound {
  if (Math.random() < 0.5) {
    const obj = REAL_OBJECTS[Math.floor(Math.random() * REAL_OBJECTS.length)];
    return { kind: "object", obj, color: obj.color, options: shuffle([obj.color, ...shuffle(COLORS.filter(c => c !== obj.color)).slice(0, 3)]) };
  }
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { kind: "shape", shape, color, options: shuffle([color, ...shuffle(COLORS.filter(c => c !== color)).slice(0, 3)]) };
}
function genShapeRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, options: shuffle([shape, ...shuffle(SHAPES.filter(s => s !== shape)).slice(0, 3)]) };
}
function genCountRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const count = Math.floor(Math.random() * 7) + 2;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) { const w = Math.max(1, count + Math.floor(Math.random() * 5) - 2); if (w !== count) wrong.add(w); }
  return { shape, count, color, options: shuffle([...wrong]) };
}
function genMixRound() {
  const m = COLOR_MIXING[Math.floor(Math.random() * COLOR_MIXING.length)];
  return { ...m, options: shuffle([m.result, ...shuffle(COLORS.filter(c => c !== m.result)).slice(0, 3)]) };
}
function genRainbowRound() {
  const idx = Math.floor(Math.random() * RAINBOW_ORDER.length);
  const correct = RAINBOW_ORDER[idx];
  const wrong = shuffle(RAINBOW_ORDER.filter(c => c !== correct)).slice(0, 3);
  return { idx, correct, options: shuffle([correct, ...wrong]) };
}

/* ─── Main ────────────────────────────────────────────────── */
type Mode = "color" | "shape" | "count" | "mixing" | "rainbow" | "trace";

export default function GameForme() {
  const [mode, setMode] = useState<Mode>("color");
  const [colorR, setColorR] = useState(genColorRound);
  const [shapeR, setShapeR] = useState(genShapeRound);
  const [countR, setCountR] = useState(genCountRound);
  const [mixR, setMixR] = useState(genMixRound);
  const [rainbowR, setRainbowR] = useState(genRainbowRound);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  // Trace
  const [traceIdx, setTraceIdx] = useState(0);
  const [traceScore, setTraceScore] = useState(0);
  const [traceCelebrate, setTraceCelebrate] = useState(false);

  function nextRound() {
    setColorR(genColorRound()); setShapeR(genShapeRound()); setCountR(genCountRound());
    setMixR(genMixRound()); setRainbowR(genRainbowRound());
    setChosen(null);
  }
  function handleAnswer(val: string, correct: string) {
    if (chosen) return; setChosen(val); setTotal(t => t + 1);
    if (val === correct) { setScore(s => s + 1); playCorrect(); } else { playWrong(); }
    setTimeout(() => nextRound(), 1800);
  }
  function changeMode(m: Mode) { setMode(m); setScore(0); setTotal(0); nextRound(); }

  const curShape = TRACEABLE[traceIdx];

  const TABS: [Mode, string, string][] = [
    ["color","🎨","Culori"], ["shape","🔷","Forme"], ["count","🔢","Numără"],
    ["mixing","🧪","Amestec"], ["rainbow","🌈","Curcubeu"], ["trace","✏️","Trasează"],
  ];

  function getCorrectVal() {
    if (mode === "color") return colorR.color;
    if (mode === "shape") return shapeR.shape;
    if (mode === "count") return String(countR.count);
    if (mode === "mixing") return mixR.result;
    return rainbowR.correct;
  }
  const isCorrect = chosen !== null && chosen === getCorrectVal();

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {TABS.map(([m, ic, lbl]) => (
          <button key={m} onClick={() => changeMode(m)}
            className={`px-3 py-2 rounded-full text-xs font-bold transition-all border-2 flex items-center gap-1
              ${mode === m ? "bg-primary text-white border-primary shadow-md" : "bg-white border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
            {ic} {lbl}
          </button>
        ))}
      </div>

      {mode !== "trace" && (
        <div className="text-sm font-bold text-primary">⭐ {score}/{total}</div>
      )}

      {/* ── COLOR MODE ── */}
      {mode === "color" && (
        <>
          <p className="font-bold text-lg text-center">
            {colorR.kind === "object" ? colorR.obj.q : "Ce culoare are această formă?"}
          </p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner flex items-center justify-center">
            {colorR.kind === "object" ? <span className="text-6xl">{colorR.obj.emoji}</span> : SHAPE_SVG[colorR.shape](COLOR_HEX[colorR.color])}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {colorR.options.map(c => (
              <button key={c} onClick={() => handleAnswer(c, colorR.color)} disabled={!!chosen}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === c && c === colorR.color ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === c && c !== colorR.color ? "bg-red-100 border-red-400" : ""}
                  ${chosen && c === colorR.color && chosen !== c ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                <span className="w-5 h-5 rounded-full border border-white shadow-sm flex-shrink-0" style={{ background: COLOR_HEX[c as ColorName] }} />
                <span className="capitalize">{c}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── SHAPE MODE ── */}
      {mode === "shape" && (
        <>
          <p className="font-bold text-lg text-center">Cum se numește această formă?</p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner flex items-center justify-center">
            {SHAPE_SVG[shapeR.shape]("#6366f1")}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {shapeR.options.map(s => (
              <button key={s} onClick={() => handleAnswer(s, shapeR.shape)} disabled={!!chosen}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm capitalize transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === s && s === shapeR.shape ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === s && s !== shapeR.shape ? "bg-red-100 border-red-400" : ""}
                  ${chosen && s === shapeR.shape && chosen !== s ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {SHAPE_SVG[s as ShapeName](chosen && s === shapeR.shape ? "#22c55e" : "#94a3b8")}
                <span>{SHAPE_NAMES[s as ShapeName]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── COUNT MODE ── */}
      {mode === "count" && (
        <>
          <p className="font-bold text-lg text-center">Câte {SHAPE_NAMES[countR.shape]} sunt?</p>
          <div className="flex flex-wrap gap-2 justify-center bg-card rounded-3xl border-2 border-border p-4 shadow-inner max-w-xs">
            {Array.from({ length: countR.count }).map((_, i) => (
              <div key={i}>{SHAPE_SVG[countR.shape](COLOR_HEX[countR.color])}</div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {countR.options.map(n => (
              <button key={n} onClick={() => handleAnswer(String(n), String(countR.count))} disabled={!!chosen}
                className={`text-3xl font-display font-black py-3 rounded-2xl border-2 transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === String(n) && n === countR.count ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === String(n) && n !== countR.count ? "bg-red-100 border-red-400" : ""}
                  ${chosen && n === countR.count && chosen !== String(n) ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── MIXING MODE (interactive quiz) ── */}
      {mode === "mixing" && (
        <>
          <p className="font-bold text-lg text-center">🧪 Ce culoare obții amestecând?</p>
          <div className="flex items-center gap-3 bg-card rounded-3xl border-2 border-border p-6 shadow-inner w-full max-w-sm justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg" style={{ background: COLOR_HEX[mixR.a] }} />
              <span className="text-xs font-bold capitalize">{mixR.a}</span>
            </div>
            <span className="text-3xl font-bold text-muted-foreground">+</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg" style={{ background: COLOR_HEX[mixR.b] }} />
              <span className="text-xs font-bold capitalize">{mixR.b}</span>
            </div>
            <span className="text-3xl font-bold text-muted-foreground">=</span>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-14 h-14 rounded-full border-4 border-white shadow-lg transition-all duration-500 ${chosen ? "" : "bg-gradient-to-br from-muted to-muted/60 animate-pulse"}`}
                style={chosen ? { background: COLOR_HEX[mixR.result] } : {}} />
              <span className="text-xs font-bold text-muted-foreground">{chosen ? mixR.result : "?"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {mixR.options.map(c => (
              <button key={c} onClick={() => handleAnswer(c, mixR.result)} disabled={!!chosen}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === c && c === mixR.result ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === c && c !== mixR.result ? "bg-red-100 border-red-400" : ""}
                  ${chosen && c === mixR.result && chosen !== c ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                <span className="w-5 h-5 rounded-full border border-white shadow-sm flex-shrink-0" style={{ background: COLOR_HEX[c as ColorName] }} />
                <span className="capitalize">{c}</span>
              </button>
            ))}
          </div>
          <div className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 w-full max-w-sm text-center">
            <strong>🎨 Culorile primare:</strong> Roșu · Galben · Albastru<br/>
            <span className="text-xs text-muted-foreground">Din ele se fac toate celelalte culori!</span>
          </div>
        </>
      )}

      {/* ── RAINBOW MODE ── */}
      {mode === "rainbow" && (
        <>
          <p className="font-bold text-lg text-center">🌈 Ce culoare completează curcubeul?</p>
          <div className="flex gap-1.5 sm:gap-2 bg-card rounded-3xl border-2 border-border p-6 shadow-inner items-end">
            {RAINBOW_ORDER.map((c, i) => (
              <div key={c}
                className={`w-7 sm:w-9 h-16 rounded-full transition-all flex items-center justify-center
                  ${i === rainbowR.idx ? "border-2 border-dashed border-muted-foreground/40 bg-muted/40" : ""}`}
                style={i === rainbowR.idx ? {} : { background: RAINBOW_HEX[c] }}>
                {i === rainbowR.idx && <span className="text-lg font-black text-muted-foreground">?</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-xs">Roșu, Portocaliu, Galben, Verde, Albastru, Indigo, Violet</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {rainbowR.options.map(c => (
              <button key={c} onClick={() => handleAnswer(c, rainbowR.correct)} disabled={!!chosen}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === c && c === rainbowR.correct ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === c && c !== rainbowR.correct ? "bg-red-100 border-red-400" : ""}
                  ${chosen && c === rainbowR.correct && chosen !== c ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                <span className="w-5 h-5 rounded-full border border-white shadow-sm flex-shrink-0" style={{ background: RAINBOW_HEX[c] }} />
                <span className="capitalize">{c}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── TRACE MODE ── */}
      {mode === "trace" && (
        <>
          <div className="flex items-center justify-between w-full max-w-sm">
            <div>
              <div className="text-sm font-bold text-foreground">Trasează forma: <span className="text-primary capitalize">{SHAPE_NAMES[curShape]}</span></div>
              <div className="text-xs text-muted-foreground">Urmează pașii numerotați — sau colorează liber!</div>
            </div>
            <span className="text-sm font-bold text-primary">⭐ {traceScore}/{TRACEABLE.length}</span>
          </div>

          {/* Shape progress */}
          <div className="flex gap-3 flex-wrap justify-center">
            {TRACEABLE.map((s, i) => (
              <button key={s} onClick={() => setTraceIdx(i)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all
                  ${i < traceIdx ? "border-green-300 bg-green-50" :
                    i === traceIdx ? "border-primary bg-primary/5 scale-110 shadow-md" :
                    "border-muted bg-muted/30 opacity-50"}`}>
                {SHAPE_SVG[s](i < traceIdx ? "#22c55e" : i === traceIdx ? SHAPE_TRACE_COLORS[s] : "#94a3b8")}
                <span className="text-xs font-bold capitalize text-muted-foreground">{SHAPE_NAMES[s]}</span>
              </button>
            ))}
          </div>

          {traceCelebrate ? (
            <div className="flex flex-col items-center gap-3 py-4 animate-in zoom-in">
              <div className="text-7xl animate-bounce">🌟</div>
              <div className="text-2xl font-bold text-green-600">Bravo! {SHAPE_NAMES[curShape]} e gata!</div>
            </div>
          ) : (
            <StepTraceCanvas key={curShape} strokes={shapeStrokes(curShape)}
              color={SHAPE_TRACE_COLORS[curShape]} onComplete={() => {
              setTraceCelebrate(true); setTraceScore(s => s + 1); playCelebrate();
              setTimeout(() => { setTraceCelebrate(false); if (traceIdx < TRACEABLE.length - 1) setTraceIdx(i => i + 1); }, 1200);
            }} />
          )}

          <div className="flex gap-3">
            <button onClick={() => setTraceIdx(i => Math.max(0, i - 1))} disabled={traceIdx === 0}
              className="px-4 py-2 rounded-full text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-30 transition-all">
              ◀ Înapoi
            </button>
            <button onClick={() => { setTraceCelebrate(false); setTraceIdx(i => Math.min(TRACEABLE.length - 1, i + 1)); }} disabled={traceIdx >= TRACEABLE.length - 1}
              className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-30 transition-all shadow">
              Următor ▶
            </button>
          </div>
        </>
      )}

      {/* Feedback for quiz modes */}
      {chosen !== null && mode !== "trace" && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
          {isCorrect ? "🎉 Corect! Bravo!" : "❌ Mai încearcă!"}
        </div>
      )}
    </div>
  );
}
