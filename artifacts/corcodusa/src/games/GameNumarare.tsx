import { useState, useEffect, useRef } from "react";

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
  let count = lvl.tens ? (Math.floor(Math.random() * 5) + 1) * 10 : Math.floor(Math.random() * (lvl.max - lvl.min + 1)) + lvl.min;
  const set = ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
  const wrong = new Set<number>([count]);
  while (wrong.size < 4) { const w = Math.max(1, count + Math.floor(Math.random() * 7) - 3); if (w !== count && w > 0) wrong.add(w); }
  return { count, ...set, options: shuffle([...wrong]) };
}

/* ─── Tracing ─────────────────────────────────────────────── */
const NUM_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b","#6366f1","#14b8a6","#f43f5e","#84cc16","#0ea5e9","#a855f7","#fb923c","#4ade80","#38bdf8","#c084fc"];
const MIN_NUM_TRACE = 170;

function NumberTracingCanvas({ num, onComplete }: { num: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [done, setDone] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const color = NUM_COLORS[(num - 1) % NUM_COLORS.length];

  function drawTemplate() {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = "bold 190px 'Arial Rounded MT Bold', Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(251,146,60,0.12)"; ctx.fillText(String(num), c.width / 2, c.height / 2 + 8);
    ctx.strokeStyle = "rgba(251,146,60,0.28)"; ctx.lineWidth = 3;
    ctx.strokeText(String(num), c.width / 2, c.height / 2 + 8);
    ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(251,146,60,0.20)";
    ctx.strokeText(String(num), c.width / 2, c.height / 2 + 8);
    ctx.setLineDash([]);
  }

  useEffect(() => { drawTemplate(); setPathLen(0); setDone(false); lastPos.current = null; }, [num]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!; const r = c.getBoundingClientRect(); const s = c.width / r.width;
    if ("touches" in e) return { x: (e.touches[0].clientX - r.left) * s, y: (e.touches[0].clientY - r.top) * s };
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (done) return; setDrawing(true); lastPos.current = getPos(e);
  }

  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing || done) return;
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.strokeStyle = color; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.globalAlpha = 1;
      const d = Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y);
      setPathLen(p => { const nl = p + d; if (nl >= MIN_NUM_TRACE && !done) { setDone(true); setTimeout(onComplete, 900); } return nl; });
    }
    lastPos.current = pos;
  }

  const pct = Math.min(100, Math.round((pathLen / MIN_NUM_TRACE) * 100));

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={300} height={300}
        className={`rounded-3xl border-2 shadow-xl touch-none cursor-crosshair transition-all duration-300 w-64 h-64
          ${done ? "border-green-400 shadow-green-100" : "border-border"}`}
        onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={() => { setDrawing(false); lastPos.current = null; }}
        onMouseLeave={() => { setDrawing(false); lastPos.current = null; }}
        onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={() => { setDrawing(false); lastPos.current = null; }} />
      <div className="flex items-center gap-3 w-64">
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
        </div>
        <button onClick={() => { drawTemplate(); setPathLen(0); setDone(false); }} className="text-sm text-muted-foreground hover:text-foreground">↺</button>
      </div>
      {done && <div className="text-2xl font-bold text-green-600 animate-bounce">✅ Cifra {num}!</div>}
    </div>
  );
}

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

/* ─── Main ────────────────────────────────────────────────── */
type Tab = "count" | "trace";

export default function GameNumarare() {
  const [tab, setTab] = useState<Tab>("count");
  // Count
  const [levelId, setLevelId] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
  const [clicked, setClicked] = useState<Set<number>>(new Set());
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Trace
  const [traceNum, setTraceNum] = useState(1);
  const [traceScore, setTraceScore] = useState(0);
  const [traceCelebrate, setTraceCelebrate] = useState(false);

  function nextRound(lv = levelId) {
    setRound(generateRound(lv)); setClicked(new Set()); setChosen(null); setCelebrate(false); setShowHint(false);
  }
  function handleAnswer(n: number) {
    if (chosen !== null) return;
    setChosen(n); setTotal(t => t + 1);
    const ok = n === round.count;
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); setCelebrate(true); } else setStreak(0);
    timerRef.current = setTimeout(() => nextRound(), 2000);
  }
  function changeLevel(l: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLevelId(l); setScore(0); setTotal(0); setStreak(0); nextRound(l);
  }

  const lvl = COUNT_LEVELS[levelId - 1];
  const correct = chosen === round.count;

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
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${levelId === l.id ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
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
              <button key={i} onClick={() => { if (chosen !== null) return; setClicked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }); }}
                className={`text-3xl transition-all duration-200 active:scale-75 ${clicked.has(i) ? "opacity-30 scale-90" : "hover:scale-110"}`}>
                {round.emoji}
              </button>
            ))}
          </div>
          {clicked.size > 0 && chosen === null && (
            <div className="text-5xl font-display font-black text-primary animate-bounce">{clicked.size}</div>
          )}
          {lvl.parity ? (
            <div className="flex gap-4">
              {[["Par","🟢 Par",true],["Impar","🟡 Impar",false]].map(([key,lbl,isEven]) => {
                const isCorrect = ((round.count % 2 === 0) === isEven) as boolean;
                return (
                  <button key={String(key)} onClick={() => handleAnswer(isEven ? round.count : round.count + 1)} disabled={chosen !== null}
                    className={`px-8 py-4 rounded-2xl text-xl font-bold border-2 transition-all duration-300 shadow-md
                      ${chosen === null ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1" : ""}
                      ${chosen !== null && isCorrect ? "bg-green-100 border-green-400 text-green-700 scale-105" : ""}
                      ${chosen !== null && !isCorrect ? "bg-red-100 border-red-400 text-red-700" : ""}
                    `}>
                    {String(lbl)}
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
          {chosen !== null && (
            <div className={`text-xl font-bold animate-in zoom-in ${correct ? "text-green-600" : "text-red-500"}`}>
              {correct ? (streak >= 3 ? "🔥 Fantastic!" : "🎉 Corect! Bravo!") : `❌ Erau ${round.count} ${round.label}`}
            </div>
          )}
          {!showHint && chosen === null && (
            <button onClick={() => setShowHint(true)} className="text-xs text-muted-foreground underline hover:text-primary">💡 Ajutor</button>
          )}
          {showHint && chosen === null && (
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
              <div className="text-xs text-muted-foreground">Urmărește conturul cu mouse-ul sau degetul!</div>
            </div>
            <span className="text-sm font-bold text-primary">⭐ {traceScore}/20</span>
          </div>

          {/* Number strip */}
          <div className="flex flex-wrap gap-1 justify-center max-w-sm">
            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setTraceNum(n)}
                className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center transition-all border
                  ${n < traceNum && traceScore >= n - 1 ? "bg-green-100 text-green-700 border-green-300" :
                    n === traceNum ? "bg-primary text-white shadow-md scale-110 border-primary" :
                    "bg-muted text-muted-foreground/60 border-transparent"}`}>
                {n}
              </button>
            ))}
          </div>

          {traceCelebrate ? (
            <div className="flex flex-col items-center gap-3 py-6 animate-in zoom-in">
              <div className="text-7xl animate-bounce">🌟</div>
              <div className="text-2xl font-bold text-green-600">Cifra {traceNum} e gata!</div>
            </div>
          ) : (
            <NumberTracingCanvas key={traceNum} num={traceNum} onComplete={() => {
              setTraceCelebrate(true); setTraceScore(s => s + 1);
              setTimeout(() => { setTraceCelebrate(false); if (traceNum < 20) setTraceNum(n => n + 1); }, 1200);
            }} />
          )}

          <div className="flex gap-3">
            <button onClick={() => setTraceNum(n => Math.max(1, n - 1))} disabled={traceNum <= 1}
              className="px-4 py-2 rounded-full text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-30 transition-all">
              ◀ Înapoi
            </button>
            <button onClick={() => { setTraceCelebrate(false); setTraceNum(n => Math.min(20, n + 1)); }} disabled={traceNum >= 20}
              className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-30 transition-all shadow">
              Următor ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
