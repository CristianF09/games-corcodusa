import { useState, useEffect, useRef, useCallback } from "react";
import { playCorrect, playWrong, playCelebrate, playClick } from "@/lib/sfx";

/* ─── Counting game data ──────────────────────────────────── */
const ITEM_SETS = [
  { emoji: "🍎", label: "mere"      }, { emoji: "⭐", label: "stele"     },
  { emoji: "🐶", label: "cățeluși" }, { emoji: "🦋", label: "fluturi"   },
  { emoji: "🍭", label: "acadele"  }, { emoji: "🎈", label: "baloane"   },
  { emoji: "🐸", label: "broscuțe"}, { emoji: "🌻", label: "flori"     },
  { emoji: "🍓", label: "căpșune" }, { emoji: "🚀", label: "rachete"   },
  { emoji: "🦊", label: "vulpițe" }, { emoji: "🐧", label: "pinguini"  },
];
const COUNT_LEVELS = [
  { id: 1, label: "1–5",   min: 1,  max: 5,  desc: "Numere mici"     },
  { id: 2, label: "1–10",  min: 1,  max: 10, desc: "Până la 10"      },
  { id: 3, label: "5–20",  min: 5,  max: 20, desc: "Până la 20"      },
  { id: 4, label: "Par/Impar", min: 1, max: 10, desc: "Par sau impar?", parity: true },
  { id: 5, label: "Zeci",  min: 10, max: 50, desc: "Multiplii de 10", tens: true    },
];
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function generateRound(lv: number) {
  const lvl = COUNT_LEVELS[lv - 1];
  const count = lvl.tens
    ? (Math.floor(Math.random() * 5) + 1) * 10
    : Math.floor(Math.random() * (lvl.max - lvl.min + 1)) + lvl.min;
  const set = ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) {
    const w = Math.max(1, count + Math.floor(Math.random() * 7) - 3);
    if (w !== count && w > 0) wrong.add(w);
  }
  return { count, ...set, options: shuffle([...wrong]) };
}

/* ─── Tracing — OCR via pixel coverage ───────────────────── */
const NUM_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#06b6d4",
  "#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b",
  "#6366f1","#14b8a6","#f43f5e","#84cc16","#0ea5e9",
  "#a855f7","#fb923c","#4ade80","#38bdf8","#c084fc",
];

const CANVAS_SIZE = 300;
const BRUSH_RADIUS = 15;       // pixels — coverage detection radius
const COVERAGE_GOAL = 0.52;    // 52 % of digit pixels must be covered
const SAMPLE_STEP  = 3;        // sample template every 3 px

type Pt = { x: number; y: number };

/** Sample which canvas pixels belong to the digit outline. */
function sampleDigitPoints(num: number): Pt[] {
  const fontSize = num >= 10 ? 120 : 190;
  const off = document.createElement("canvas");
  off.width = CANVAS_SIZE; off.height = CANVAS_SIZE;
  const ctx = off.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.font = `bold ${fontSize}px 'Arial Rounded MT Bold', Arial`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(String(num), CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 8);

  const { data } = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const pts: Pt[] = [];
  for (let y = 0; y < CANVAS_SIZE; y += SAMPLE_STEP) {
    for (let x = 0; x < CANVAS_SIZE; x += SAMPLE_STEP) {
      if (data[(y * CANVAS_SIZE + x) * 4] < 100) pts.push({ x, y });
    }
  }
  return pts;
}

/** Squared distance from point P to line segment (A→B). */
function distSq(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 0.001) return (p.x - a.x) ** 2 + (p.y - a.y) ** 2;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return (p.x - a.x - t * dx) ** 2 + (p.y - a.y - t * dy) ** 2;
}

function NumberTracingCanvas({ num, onComplete }: { num: number; onComplete: () => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const ptsRef     = useRef<Pt[]>([]);
  const coveredRef = useRef<Set<number>>(new Set());
  const [coverage, setCoverage] = useState(0);
  const [done, setDone]         = useState(false);
  const [onTrack, setOnTrack]   = useState(false);
  const drawing  = useRef(false);
  const lastPos  = useRef<Pt | null>(null);
  const color    = NUM_COLORS[(num - 1) % NUM_COLORS.length];
  const fontSize = num >= 10 ? 120 : 190;

  const drawTemplate = useCallback(() => {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `bold ${fontSize}px 'Arial Rounded MT Bold', Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // Filled ghost
    ctx.fillStyle = "rgba(251,146,60,0.10)";
    ctx.fillText(String(num), c.width / 2, c.height / 2 + 8);
    // Solid outline
    ctx.strokeStyle = "rgba(251,146,60,0.32)"; ctx.lineWidth = 3;
    ctx.strokeText(String(num), c.width / 2, c.height / 2 + 8);
    // Dashed inner outline
    ctx.setLineDash([9, 7]); ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(251,146,60,0.22)";
    ctx.strokeText(String(num), c.width / 2, c.height / 2 + 8);
    ctx.setLineDash([]);
  }, [num, fontSize]);

  useEffect(() => {
    ptsRef.current     = sampleDigitPoints(num);
    coveredRef.current = new Set();
    drawTemplate();
    setCoverage(0); setDone(false); setOnTrack(false);
    lastPos.current = null; drawing.current = false;
  }, [num, drawTemplate]);

  function getPos(e: React.MouseEvent | React.TouchEvent): Pt {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    const s = c.width / r.width;
    if ("touches" in e)
      return { x: (e.touches[0].clientX - r.left) * s, y: (e.touches[0].clientY - r.top) * s };
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  }

  function markCoverage(from: Pt, to: Pt) {
    const pts = ptsRef.current; const cov = coveredRef.current;
    const R2  = BRUSH_RADIUS * BRUSH_RADIUS;
    let nearDigit = false;
    for (let i = 0; i < pts.length; i++) {
      const d2 = distSq(pts[i], from, to);
      if (d2 <= R2 * 4) nearDigit = true;   // within 2× radius → on-track feedback
      if (d2 <= R2 && !cov.has(i)) cov.add(i);
    }
    const pct = pts.length ? cov.size / pts.length : 0;
    return { pct, nearDigit };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (done) return; e.preventDefault();
    drawing.current = true; lastPos.current = getPos(e);
  }

  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || done) return; e.preventDefault();
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.strokeStyle = color; ctx.lineWidth = 26;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = 0.88;
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.globalAlpha = 1;

      const { pct, nearDigit } = markCoverage(lastPos.current, pos);
      setCoverage(pct); setOnTrack(nearDigit);

      if (pct >= COVERAGE_GOAL && !done) {
        setDone(true);
        setTimeout(onComplete, 800);
      }
    }
    lastPos.current = pos;
  }

  function stopDraw() { drawing.current = false; lastPos.current = null; setOnTrack(false); }

  function reset() {
    drawTemplate();
    coveredRef.current = new Set();
    setCoverage(0); setDone(false); setOnTrack(false);
  }

  const pct = Math.min(100, Math.round(coverage * 100));
  const goalPct = Math.round(COVERAGE_GOAL * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Canvas */}
      <div className="relative">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE}
          className={`rounded-3xl border-2 shadow-xl touch-none cursor-crosshair transition-all duration-300 w-64 h-64
            ${done ? "border-green-400 shadow-[0_0_24px_rgba(34,197,94,.35)]" :
              onTrack ? "border-[var(--track-color)] shadow-lg" : "border-border"}`}
          style={{ "--track-color": color } as React.CSSProperties}
          onMouseDown={startDraw} onMouseMove={doDraw}
          onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={stopDraw} />

        {/* On-track indicator */}
        {onTrack && !done && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-white text-xs font-bold animate-pulse"
            style={{ background: color }}>
            ✓ Pe cifră!
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 w-64">
        <div className="flex-1 h-3.5 bg-muted rounded-full overflow-hidden relative">
          {/* Goal marker */}
          <div className="absolute top-0 h-full w-0.5 bg-orange-300/60 z-10"
            style={{ left: `${goalPct}%` }} />
          <div className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${pct}%`,
              background: pct >= goalPct ? "#22c55e" : color,
            }} />
        </div>
        <span className="text-sm font-black w-10 text-right transition-colors"
          style={{ color: pct >= goalPct ? "#22c55e" : color }}>
          {pct}%
        </span>
        <button onClick={reset} title="Șterge și încearcă din nou"
          className="text-base text-muted-foreground hover:text-foreground transition-colors">↺</button>
      </div>

      {/* Progress hint */}
      {!done && pct < goalPct && (
        <p className="text-xs text-muted-foreground">
          {pct < 15
            ? "Urmărește conturul cifrei cu degetul 👆"
            : pct < 35
            ? "Continuă — mai ai mult de acoperit!"
            : `Aproape! Mai trebuie ${goalPct - pct}% 💪`}
        </p>
      )}

      {done && (
        <div className="text-2xl font-bold text-green-600 animate-bounce">
          ✅ Cifra {num} trasată!
        </div>
      )}
    </div>
  );
}

/* ─── Confetti ────────────────────────────────────────────── */
function Confetti() {
  const PIECES = Array.from({ length: 22 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.6,
    color: ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b"][i % 5],
    size: 6 + Math.random() * 7,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.left}%`, top: "-12px", animationDelay: `${p.delay}s` }}>
          <div className="animate-bounce" style={{
            width: p.size, height: p.size, background: p.color,
            borderRadius: "2px", transform: `rotate(${Math.random() * 360}deg)`,
          }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────── */
type Tab = "count" | "trace";

export default function GameNumarare() {
  const [tab, setTab] = useState<Tab>("count");

  // Count state
  const [levelId, setLevelId]           = useState(1);
  const [round, setRound]               = useState(() => generateRound(1));
  const [clicked, setClicked]           = useState<Set<number>>(new Set());
  const [chosen, setChosen]             = useState<number | null>(null);
  const [score, setScore]               = useState(0);
  const [streak, setStreak]             = useState(0);
  const [total, setTotal]               = useState(0);
  const [celebrate, setCelebrate]       = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const [parityChosen, setParityChosen] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trace state
  const [traceNum, setTraceNum]           = useState(1);
  const [traceScore, setTraceScore]       = useState(0);
  const [traceCelebrate, setTraceCelebrate] = useState(false);
  const [completedNums, setCompletedNums] = useState<Set<number>>(new Set());

  function nextRound(lv = levelId) {
    setRound(generateRound(lv));
    setClicked(new Set()); setChosen(null); setParityChosen(null);
    setCelebrate(false); setShowHint(false);
  }

  function handleAnswer(n: number) {
    if (chosen !== null) return;
    setChosen(n); setTotal(t => t + 1);
    const ok = n === round.count;
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => { const ns = s + 1; (ns >= 3 ? playCelebrate : playCorrect)(); return ns; });
      setCelebrate(true);
    } else { setStreak(0); playWrong(); }
    timerRef.current = setTimeout(() => nextRound(), 2000);
  }

  function handleParityAnswer(guessEven: boolean) {
    if (parityChosen !== null) return;
    setParityChosen(guessEven); setTotal(t => t + 1);
    const ok = (round.count % 2 === 0) === guessEven;
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => { const ns = s + 1; (ns >= 3 ? playCelebrate : playCorrect)(); return ns; });
      setCelebrate(true);
    } else { setStreak(0); playWrong(); }
    timerRef.current = setTimeout(() => nextRound(), 2000);
  }

  function changeLevel(l: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLevelId(l); setScore(0); setTotal(0); setStreak(0); nextRound(l);
  }

  const lvl     = COUNT_LEVELS[levelId - 1];
  const correct = lvl.parity ? (round.count % 2 === 0) === parityChosen : chosen === round.count;
  const answered = lvl.parity ? parityChosen !== null : chosen !== null;

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {celebrate && tab === "count" && <Confetti />}

      {/* Tab toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-full">
        <button onClick={() => setTab("count")}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${tab === "count" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          🔢 Numără
        </button>
        <button onClick={() => setTab("trace")}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${tab === "trace" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          ✏️ Trasează 1–20
        </button>
      </div>

      {/* ── COUNTING TAB ── */}
      {tab === "count" && (
        <>
          <div className="flex gap-2 flex-wrap justify-center">
            {COUNT_LEVELS.map(l => (
              <button key={l.id} onClick={() => changeLevel(l.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2
                  ${levelId === l.id ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm font-bold">
            <span className="text-primary">⭐ {score}/{total}</span>
            {streak >= 3 && <span className="text-orange-500 animate-pulse">🔥 {streak} la rând!</span>}
          </div>

          <p className="text-base font-bold text-foreground text-center">
            {lvl.parity ? `${round.count} este par sau impar?` : `Câte ${round.label} vezi? Numără-le!`}
          </p>

          <div className="flex flex-wrap justify-center gap-2 max-w-md bg-card rounded-3xl p-5 border-2 border-border shadow-inner min-h-20">
            {Array.from({ length: round.count }).map((_, i) => (
              <button key={i}
                onClick={() => { if (answered) return; playClick(); setClicked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }); }}
                className={`text-3xl transition-all duration-200 active:scale-75 ${clicked.has(i) ? "opacity-30 scale-90" : "hover:scale-110"}`}>
                {round.emoji}
              </button>
            ))}
          </div>

          {clicked.size > 0 && !answered && (
            <div className="text-5xl font-display font-black text-primary animate-bounce">{clicked.size}</div>
          )}

          {lvl.parity ? (
            <div className="flex gap-4">
              {([["Par","🟢 Par",true],["Impar","🟡 Impar",false]] as [string,string,boolean][]).map(([key,lbl,isEven]) => {
                const isThisCorrect = (round.count % 2 === 0) === isEven;
                const isThisChosen  = parityChosen === isEven;
                return (
                  <button key={key} onClick={() => handleParityAnswer(isEven)} disabled={parityChosen !== null}
                    className={`px-8 py-4 rounded-2xl text-xl font-bold border-2 transition-all duration-300 shadow-md
                      ${parityChosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1" : ""}
                      ${parityChosen !== null && isThisCorrect ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                      ${parityChosen !== null && !isThisCorrect && isThisChosen ? "bg-red-100 border-red-400 text-red-700" : ""}
                    `}>
                    {lbl}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {round.options.map(n => (
                <button key={n} onClick={() => handleAnswer(n)} disabled={chosen !== null}
                  className={`text-3xl font-display font-black py-4 rounded-2xl border-2 transition-all duration-300 shadow-md
                    ${chosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1 hover:shadow-lg" : ""}
                    ${chosen === n && n === round.count ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                    ${chosen === n && n !== round.count ? "bg-red-100 border-red-400 text-red-700" : ""}
                    ${chosen !== null && n === round.count && chosen !== n ? "bg-green-100 border-green-400 text-green-700" : ""}
                  `}>
                  {n}
                </button>
              ))}
            </div>
          )}

          {answered && (
            <div className={`text-xl font-bold animate-in zoom-in ${correct ? "text-green-600" : "text-red-500"}`}>
              {correct
                ? (streak >= 3 ? "🔥 Fantastic!" : "🎉 Corect! Bravo!")
                : lvl.parity
                  ? `❌ ${round.count} este ${round.count % 2 === 0 ? "par" : "impar"}`
                  : `❌ Erau ${round.count} ${round.label}`}
            </div>
          )}

          {!showHint && !answered && (
            <button onClick={() => setShowHint(true)} className="text-xs text-muted-foreground underline hover:text-primary">
              💡 Ajutor
            </button>
          )}
          {showHint && !answered && (
            <div className="text-sm bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-yellow-800">
              Apasă pe fiecare {round.emoji} ca să numeri mai ușor!
            </div>
          )}
        </>
      )}

      {/* ── TRACE TAB ── */}
      {tab === "trace" && (
        <>
          <div className="flex items-center justify-between w-full max-w-sm">
            <div>
              <div className="text-sm font-bold text-foreground">Trasează cifra {traceNum}</div>
              <div className="text-xs text-muted-foreground">
                Acoperă conturul cu degetul sau mouse-ul — minim 52%!
              </div>
            </div>
            <span className="text-sm font-bold text-primary">⭐ {traceScore}/20</span>
          </div>

          {/* Number strip */}
          <div className="flex flex-wrap gap-1 justify-center max-w-sm">
            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => { setTraceCelebrate(false); setTraceNum(n); }}
                className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center transition-all border
                  ${completedNums.has(n)
                    ? "bg-green-100 text-green-700 border-green-300"
                    : n === traceNum
                    ? "bg-primary text-white shadow-md scale-110 border-primary"
                    : "bg-muted text-muted-foreground/60 border-transparent"}`}>
                {completedNums.has(n) ? "✓" : n}
              </button>
            ))}
          </div>

          {traceCelebrate ? (
            <div className="flex flex-col items-center gap-3 py-6 animate-in zoom-in">
              <div className="text-7xl animate-bounce">🌟</div>
              <div className="text-2xl font-bold text-green-600">Cifra {traceNum} e gata!</div>
              {traceNum < 20 && (
                <button
                  onClick={() => { setTraceCelebrate(false); setTraceNum(n => n + 1); }}
                  className="mt-2 px-6 py-2 rounded-full bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all">
                  Cifra {traceNum + 1} ▶
                </button>
              )}
            </div>
          ) : (
            <NumberTracingCanvas key={traceNum} num={traceNum} onComplete={() => {
              playCelebrate();
              setTraceCelebrate(true);
              setTraceScore(s => s + 1);
              setCompletedNums(prev => new Set(prev).add(traceNum));
              setTimeout(() => {
                setTraceCelebrate(false);
                if (traceNum < 20) setTraceNum(n => n + 1);
              }, 2000);
            }} />
          )}

          <div className="flex gap-3">
            <button onClick={() => { setTraceCelebrate(false); setTraceNum(n => Math.max(1, n - 1)); }}
              disabled={traceNum <= 1}
              className="px-4 py-2 rounded-full text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-30 transition-all">
              ◀ Înapoi
            </button>
            <button onClick={() => { setTraceCelebrate(false); setTraceNum(n => Math.min(20, n + 1)); }}
              disabled={traceNum >= 20}
              className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-30 transition-all shadow">
              Următor ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
