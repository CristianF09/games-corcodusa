import { useState, useEffect, useRef } from "react";
import { playCorrect, playWrong, playCelebrate, playClick } from "@/lib/sfx";

/* ─── Shape SVGs ─────────────────────────────────────────── */
type ShapeName = "cerc" | "pătrat" | "triunghi" | "stea" | "dreptunghi" | "romb" | "pentagon" | "hexagon";
type ColorName = "roșu" | "albastru" | "galben" | "verde" | "portocaliu" | "violet" | "roz" | "turcoaz";

const SHAPE_SVG: Record<ShapeName, (fill: string, stroke?: string) => JSX.Element> = {
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
const COLOR_MIXING = [
  { a:"roșu" as ColorName, b:"albastru" as ColorName, result:"violet" as ColorName, desc:"🔴 + 🔵 = Violet" },
  { a:"roșu" as ColorName,  b:"galben" as ColorName, result:"portocaliu" as ColorName, desc:"🔴 + 🟡 = Portocaliu" },
  { a:"albastru" as ColorName, b:"galben" as ColorName, result:"verde" as ColorName, desc:"🔵 + 🟡 = Verde" },
  { a:"roșu" as ColorName, b:"roz" as ColorName, result:"roșu" as ColorName, desc:"🔴 + 🩷 = Roșu intens" },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

/* ─── Tracing for shapes ─────────────────────────────────── */
type TracableShape = "cerc" | "pătrat" | "triunghi" | "stea" | "dreptunghi" | "romb";
const TRACEABLE: TracableShape[] = ["cerc", "pătrat", "triunghi", "stea", "dreptunghi", "romb"];
const SHAPE_TRACE_COLORS: Record<TracableShape, string> = {
  cerc:"#ef4444", pătrat:"#3b82f6", triunghi:"#22c55e", stea:"#eab308", dreptunghi:"#8b5cf6", romb:"#f97316",
};
const MIN_SHAPE_TRACE = 260;

function drawShapeTemplate(ctx: CanvasRenderingContext2D, shape: TracableShape, size: number) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = "rgba(99,102,241,0.30)"; ctx.lineWidth = 4; ctx.fillStyle = "rgba(99,102,241,0.06)";
  ctx.beginPath();
  if (shape === "cerc") { ctx.arc(cx, cy, r, 0, Math.PI * 2); }
  else if (shape === "pătrat") { const s2 = r * 1.35; ctx.rect(cx - s2, cy - s2, s2 * 2, s2 * 2); }
  else if (shape === "dreptunghi") { ctx.rect(cx - r * 1.6, cy - r * 0.9, r * 3.2, r * 1.8); }
  else if (shape === "triunghi") { ctx.moveTo(cx, cy - r * 1.2); ctx.lineTo(cx + r * 1.1, cy + r * 0.9); ctx.lineTo(cx - r * 1.1, cy + r * 0.9); ctx.closePath(); }
  else if (shape === "stea") {
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const a2 = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a2) * r * 0.42, cy + Math.sin(a2) * r * 0.42);
    }
    ctx.closePath();
  } else if (shape === "romb") { ctx.moveTo(cx, cy - r * 1.2); ctx.lineTo(cx + r * 0.9, cy); ctx.lineTo(cx, cy + r * 1.2); ctx.lineTo(cx - r * 0.9, cy); ctx.closePath(); }
  ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
}

function ShapeTracingCanvas({ shape, onComplete }: { shape: TracableShape; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [done, setDone] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const color = SHAPE_TRACE_COLORS[shape];
  const SIZE = 300;

  function drawTemplate() {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE); ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, SIZE, SIZE);
    drawShapeTemplate(ctx, shape, SIZE);
  }

  useEffect(() => { drawTemplate(); setPathLen(0); setDone(false); lastPos.current = null; }, [shape]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!; const r = c.getBoundingClientRect(); const s = SIZE / r.width;
    if ("touches" in e) return { x: (e.touches[0].clientX - r.left) * s, y: (e.touches[0].clientY - r.top) * s };
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) { if (done) return; setDrawing(true); lastPos.current = getPos(e); }
  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing || done) return;
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.strokeStyle = color; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.globalAlpha = 1;
      const d = Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y);
      setPathLen(p => { const nl = p + d; if (nl >= MIN_SHAPE_TRACE && !done) { setDone(true); setTimeout(onComplete, 900); } return nl; });
    }
    lastPos.current = pos;
  }
  function stopDraw() { setDrawing(false); lastPos.current = null; }

  const pct = Math.min(100, Math.round((pathLen / MIN_SHAPE_TRACE) * 100));

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={SIZE} height={SIZE}
        className={`rounded-3xl border-2 shadow-xl touch-none cursor-crosshair transition-all duration-300 w-64 h-64
          ${done ? "border-green-400 shadow-green-100" : "border-border"}`}
        onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={stopDraw} />
      <div className="flex items-center gap-3 w-64">
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
        </div>
        <button onClick={() => { drawTemplate(); setPathLen(0); setDone(false); }} className="text-sm text-muted-foreground hover:text-foreground">↺</button>
      </div>
      {done && <div className="text-2xl font-bold text-green-600 animate-bounce">✅ Bravo! Forma {SHAPE_NAMES[shape]}!</div>}
    </div>
  );
}

/* ─── Quiz helpers ───────────────────────────────────────── */
function genColorRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    shape, color,
    options: shuffle([color, ...shuffle(COLORS.filter(c => c !== color)).slice(0,3)]),
    shapeOptions: shuffle([shape, ...shuffle(SHAPES.filter(s => s !== shape)).slice(0,3)]),
  };
}
function genCountRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const count = Math.floor(Math.random() * 7) + 2;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) { const w = Math.max(1, count + Math.floor(Math.random() * 5) - 2); if (w !== count) wrong.add(w); }
  return { shape, count, color, options: shuffle([...wrong]) };
}
function genShadowRound() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, options: shuffle([shape, ...shuffle(SHAPES.filter(s => s !== shape)).slice(0,3)]) };
}

/* ─── Main ────────────────────────────────────────────────── */
type Mode = "color" | "shape" | "count" | "mixing" | "shadow" | "trace";

export default function GameForme() {
  const [mode, setMode] = useState<Mode>("color");
  const [colorR, setColorR] = useState(genColorRound);
  const [countR, setCountR] = useState(genCountRound);
  const [shadowR, setShadowR] = useState(genShadowRound);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mixIdx, setMixIdx] = useState(0);
  const [mixRevealed, setMixRevealed] = useState(false);
  // Trace
  const [traceIdx, setTraceIdx] = useState(0);
  const [traceScore, setTraceScore] = useState(0);
  const [traceCelebrate, setTraceCelebrate] = useState(false);

  function nextRound() {
    setColorR(genColorRound()); setCountR(genCountRound()); setShadowR(genShadowRound());
    setChosen(null); setMixRevealed(false);
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
    ["mixing","🧪","Amestec"], ["shadow","👻","Umbra"], ["trace","✏️","Trasează"],
  ];

  function getCorrectVal() {
    if (mode === "color") return colorR.color;
    if (mode === "shape") return colorR.shape;
    if (mode === "count") return String(countR.count);
    return shadowR.shape;
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

      {mode !== "trace" && mode !== "mixing" && (
        <div className="text-sm font-bold text-primary">⭐ {score}/{total}</div>
      )}

      {/* ── COLOR MODE ── */}
      {mode === "color" && (
        <>
          <p className="font-bold text-lg text-center">Ce culoare are această formă?</p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner flex items-center justify-center">
            {SHAPE_SVG[colorR.shape](COLOR_HEX[colorR.color])}
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
            {SHAPE_SVG[colorR.shape]("#6366f1")}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {colorR.shapeOptions.map(s => (
              <button key={s} onClick={() => handleAnswer(s, colorR.shape)} disabled={!!chosen}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm capitalize transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === s && s === colorR.shape ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === s && s !== colorR.shape ? "bg-red-100 border-red-400" : ""}
                  ${chosen && s === colorR.shape && chosen !== s ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {SHAPE_SVG[s as ShapeName](chosen && s === colorR.shape ? "#22c55e" : "#94a3b8")}
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

      {/* ── MIXING MODE ── */}
      {mode === "mixing" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <p className="font-bold text-lg text-center">🧪 Ce culoare obții amestecând?</p>
          <div className="flex items-center gap-3 bg-card rounded-3xl border-2 border-border p-6 shadow-inner w-full justify-center">
            {[COLOR_MIXING[mixIdx % COLOR_MIXING.length].a, COLOR_MIXING[mixIdx % COLOR_MIXING.length].b].map((c, ci) => (
              <div key={c + ci} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg" style={{ background: COLOR_HEX[c] }} />
                <span className="text-xs font-bold capitalize">{c}</span>
              </div>
            )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key="plus" className="text-3xl font-bold text-muted-foreground">+</span>, el], [] as JSX.Element[])}
            <span className="text-3xl font-bold text-muted-foreground">=</span>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => { setMixRevealed(true); playCelebrate(); }}
                className={`w-14 h-14 rounded-full border-4 border-white shadow-lg transition-all duration-500 ${mixRevealed ? "" : "bg-gradient-to-br from-muted to-muted/60 animate-pulse"}`}
                style={mixRevealed ? { background: COLOR_HEX[COLOR_MIXING[mixIdx % COLOR_MIXING.length].result] } : {}} />
              <span className="text-xs font-bold text-muted-foreground">{mixRevealed ? COLOR_MIXING[mixIdx % COLOR_MIXING.length].result : "?"}</span>
            </div>
          </div>
          {mixRevealed ? (
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{COLOR_MIXING[mixIdx % COLOR_MIXING.length].desc}</p>
              <button onClick={() => { playClick(); setMixIdx(i => i + 1); setMixRevealed(false); }}
                className="mt-3 px-6 py-2 bg-primary text-white font-bold rounded-full shadow hover:-translate-y-0.5 transition-all">
                Următoarea ▶
              </button>
            </div>
          ) : <p className="text-sm text-muted-foreground">Apasă pe cercul cu ? ca să vezi rezultatul!</p>}
          <div className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 w-full text-center">
            <strong>🎨 Culorile primare:</strong> Roșu · Galben · Albastru<br/>
            <span className="text-xs text-muted-foreground">Din ele se fac toate celelalte culori!</span>
          </div>
        </div>
      )}

      {/* ── SHADOW MODE ── */}
      {mode === "shadow" && (
        <>
          <p className="font-bold text-lg text-center">Care formă are această umbră?</p>
          <div className="bg-card rounded-3xl border-2 border-border p-8 shadow-inner flex items-center justify-center">
            {SHAPE_SVG[shadowR.shape]("#1f2937")}
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {shadowR.options.map(s => (
              <button key={s} onClick={() => handleAnswer(s, shadowR.shape)} disabled={!!chosen}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 font-bold text-xs capitalize transition-all duration-300 shadow-md
                  ${!chosen ? "bg-white hover:scale-105 hover:border-primary border-border" : ""}
                  ${chosen === s && s === shadowR.shape ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                  ${chosen === s && s !== shadowR.shape ? "bg-red-100 border-red-400" : ""}
                  ${chosen && s === shadowR.shape && chosen !== s ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {SHAPE_SVG[s as ShapeName]("#6366f1")}
                {SHAPE_NAMES[s as ShapeName]}
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
              <div className="text-xs text-muted-foreground">Urmărește conturul cu mouse-ul sau degetul!</div>
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
            <ShapeTracingCanvas key={curShape} shape={curShape} onComplete={() => {
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
      {chosen !== null && !["mixing","trace"].includes(mode) && (
        <div className={`text-xl font-bold animate-in zoom-in duration-300 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
          {isCorrect ? "🎉 Corect! Bravo!" : "❌ Mai încearcă!"}
        </div>
      )}
    </div>
  );
}
