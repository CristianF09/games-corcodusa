import { useState, useEffect, useRef } from "react";

/* ─── Data ───────────────────────────────────────────────── */
const LETTERS_DATA: Record<string, { word: string; emoji: string; desc: string; type: "vocala" | "consoana" }> = {
  A: { word: "Arici",    emoji: "🦔", desc: "Animal mic cu țepi",               type: "vocala"   },
  Ă: { word: "Ăsta",     emoji: "👆", desc: "Cuvânt de indicat",                type: "vocala"   },
  Â: { word: "Âncă",     emoji: "🔁", desc: "Mai mult, în plus",                type: "vocala"   },
  B: { word: "Broscuță", emoji: "🐸", desc: "Sare și croncăne la baltă",        type: "consoana" },
  C: { word: "Cal",      emoji: "🐴", desc: "Animal care nechează",             type: "consoana" },
  D: { word: "Delfin",   emoji: "🐬", desc: "Înoată în ocean",                  type: "consoana" },
  E: { word: "Elefant",  emoji: "🐘", desc: "Cel mai mare animal de uscat",     type: "vocala"   },
  F: { word: "Fluture",  emoji: "🦋", desc: "Zboară cu aripi colorate",         type: "consoana" },
  G: { word: "Găină",    emoji: "🐔", desc: "Face ouă și cotcodăcește",         type: "consoana" },
  H: { word: "Hamster",  emoji: "🐹", desc: "Animal mic și drăgălaș",           type: "consoana" },
  I: { word: "Iepure",   emoji: "🐰", desc: "Are urechi lungi și sare",         type: "vocala"   },
  Î: { word: "Înger",    emoji: "👼", desc: "Are aripi și e bun",               type: "vocala"   },
  J: { word: "Jirafă",   emoji: "🦒", desc: "Are gâtul cel mai lung",           type: "consoana" },
  K: { word: "Koala",    emoji: "🐨", desc: "Stă în copaci, mănâncă frunze",   type: "consoana" },
  L: { word: "Leu",      emoji: "🦁", desc: "Regele junglei",                   type: "consoana" },
  M: { word: "Maimuță",  emoji: "🐒", desc: "Se cațără în copaci",              type: "consoana" },
  N: { word: "Nufăr",    emoji: "🪷", desc: "Floare pe apă",                    type: "consoana" },
  O: { word: "Oaie",     emoji: "🐑", desc: "Dă lână și bâie",                  type: "vocala"   },
  P: { word: "Pisică",   emoji: "🐱", desc: "Toarce și prinde șoareci",          type: "consoana" },
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
const TRACE_ALPHABET = "ABCDEFGHIJKLMNOPRSTUVXYZ".split("");

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function generateQuiz() {
  const t = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  return { target: t, options: shuffle([t, ...shuffle(ALL_LETTERS.filter(l => l !== t)).slice(0, 3)]) };
}

/* ─── TracingCanvas ──────────────────────────────────────── */
const LETTER_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899",
  "#f43f5e","#10b981","#0ea5e9","#a855f7",
];
const MIN_TRACE = 220;

function TracingCanvas({ template, colorIdx, onComplete }: { template: string; colorIdx: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [pathLen, setPathLen] = useState(0);
  const [done, setDone] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const color = LETTER_COLORS[colorIdx % LETTER_COLORS.length];

  function drawTemplate() {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = "bold 190px 'Arial Rounded MT Bold', Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // Shadow
    ctx.shadowColor = "rgba(99,102,241,0.1)"; ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(99,102,241,0.10)"; ctx.fillText(template, c.width / 2, c.height / 2 + 8);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(99,102,241,0.22)"; ctx.lineWidth = 3;
    ctx.strokeText(template, c.width / 2, c.height / 2 + 8);
    // Dotted guide
    ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(99,102,241,0.18)";
    ctx.strokeText(template, c.width / 2, c.height / 2 + 8);
    ctx.setLineDash([]);
  }

  useEffect(() => { drawTemplate(); setPathLen(0); setDone(false); lastPos.current = null; }, [template]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    const s = c.width / r.width;
    if ("touches" in e) return { x: (e.touches[0].clientX - r.left) * s, y: (e.touches[0].clientY - r.top) * s };
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (done) return;
    setDrawing(true); lastPos.current = getPos(e);
  }

  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing || done) return;
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.strokeStyle = color; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      ctx.globalAlpha = 1;
      const dist = Math.hypot(pos.x - lastPos.current.x, pos.y - lastPos.current.y);
      setPathLen(p => {
        const nl = p + dist;
        if (nl >= MIN_TRACE && !done) { setDone(true); setTimeout(onComplete, 900); }
        return nl;
      });
    }
    lastPos.current = pos;
  }

  function stopDraw() { setDrawing(false); lastPos.current = null; }

  const pct = Math.min(100, Math.round((pathLen / MIN_TRACE) * 100));

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={300} height={300}
        className={`rounded-3xl border-3 shadow-xl touch-none cursor-crosshair transition-all duration-300 w-64 h-64
          ${done ? "border-green-400 shadow-green-100" : "border-border"}`}
        onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={stopDraw} />
      <div className="flex items-center gap-3 w-64">
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: color }} />
        </div>
        <button onClick={() => { drawTemplate(); setPathLen(0); setDone(false); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors">↺</button>
      </div>
      {done && (
        <div className="text-2xl font-bold text-green-600 animate-bounce">
          ✅ Perfect! Litera {template}!
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
type Mode = "explore" | "quiz" | "trace" | "vowels";

export default function GameAlfabet() {
  const [mode, setMode] = useState<Mode>("explore");
  const [selected, setSelected] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "vocala" | "consoana">("all");

  // Quiz
  const [quiz, setQuiz] = useState(generateQuiz);
  const [quizChosen, setQuizChosen] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  // Trace
  const [traceIdx, setTraceIdx] = useState(0);
  const [traceScore, setTraceScore] = useState(0);
  const [traceCelebrate, setTraceCelebrate] = useState(false);

  const filteredLetters = ALL_LETTERS.filter(l => filter === "all" || LETTERS_DATA[l].type === filter);

  function handleQuizAnswer(l: string) {
    if (quizChosen) return;
    setQuizChosen(l); setQuizTotal(t => t + 1);
    if (l === quiz.target) setQuizScore(s => s + 1);
    setTimeout(() => { setQuiz(generateQuiz()); setQuizChosen(null); }, 1800);
  }

  function handleTraceComplete() {
    setTraceCelebrate(true);
    setTraceScore(s => s + 1);
    setTimeout(() => {
      setTraceCelebrate(false);
      setTraceIdx(i => (i + 1) % TRACE_ALPHABET.length);
    }, 1200);
  }

  const curLetter = TRACE_ALPHABET[traceIdx];
  const curData = LETTERS_DATA[curLetter];

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([["explore","🔍","Descoperă"],["quiz","🎯","Quiz"],["trace","✏️","Trasează"],["vowels","🔤","Vocale"]] as [Mode,string,string][]).map(([m,ic,lbl]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 flex items-center gap-1.5
              ${mode === m ? "bg-primary text-white border-primary shadow-md" : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
            <span>{ic}</span>{lbl}
          </button>
        ))}
      </div>

      {/* ── EXPLORE ── */}
      {mode === "explore" && (
        <>
          <div className="flex gap-2 justify-center flex-wrap">
            {(["all","vocala","consoana"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === f ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
                {f === "all" ? "Toate" : f === "vocala" ? "🔵 Vocale" : "🟠 Consoane"}
              </button>
            ))}
          </div>

          {selected && LETTERS_DATA[selected] && (
            <div className="w-full max-w-sm bg-gradient-to-br from-primary/10 via-white to-secondary/10 rounded-3xl border-2 border-primary/20 p-6 text-center shadow-xl animate-in zoom-in duration-300">
              <div className="text-7xl mb-2 drop-shadow-sm">{LETTERS_DATA[selected].emoji}</div>
              <div className="text-7xl font-display font-black text-primary leading-none mb-1 drop-shadow">{selected}</div>
              <div className="text-2xl font-bold text-foreground">{LETTERS_DATA[selected].word}</div>
              <div className="text-sm text-muted-foreground mt-1 italic">{LETTERS_DATA[selected].desc}</div>
              <span className={`mt-3 inline-block px-4 py-1 rounded-full text-xs font-bold ${LETTERS_DATA[selected].type === "vocala" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                {LETTERS_DATA[selected].type === "vocala" ? "🔵 Vocală" : "🟠 Consoană"}
              </span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {filteredLetters.map(l => (
              <button key={l} onClick={() => { setSelected(l); setDiscovered(p => new Set([...p, l])); }}
                className={`w-12 h-12 rounded-2xl text-xl font-display font-bold transition-all duration-200 border-2 shadow-sm
                  ${selected === l ? "bg-primary text-white scale-115 shadow-lg border-primary" :
                    discovered.has(l) ? (LETTERS_DATA[l].type === "vocala" ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-orange-100 border-orange-300 text-orange-700") :
                    "bg-white border-border hover:bg-primary/10 hover:border-primary hover:scale-105"}`}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{discovered.size}/{ALL_LETTERS.length} litere descoperite</p>
        </>
      )}

      {/* ── QUIZ ── */}
      {mode === "quiz" && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">⭐ {quizScore}/{quizTotal}</span>
            <div className="h-2 bg-muted rounded-full w-32 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quizTotal ? (quizScore / quizTotal) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border-2 border-border p-8 text-center shadow-inner w-full max-w-sm">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Ce literă vine din cuvântul care înseamnă:</p>
            <div className="text-6xl mb-3 drop-shadow">{LETTERS_DATA[quiz.target]?.emoji}</div>
            <div className="text-xl font-bold text-foreground">{LETTERS_DATA[quiz.target]?.desc}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {quiz.options.map(l => (
              <button key={l} onClick={() => handleQuizAnswer(l)} disabled={!!quizChosen}
                className={`text-4xl font-display font-black py-4 rounded-2xl border-2 transition-all duration-300 shadow-md
                  ${!quizChosen ? "bg-white hover:bg-primary/10 hover:border-primary border-border hover:-translate-y-1 hover:shadow-lg" : ""}
                  ${quizChosen === l && l === quiz.target ? "bg-green-100 border-green-400 text-green-700 scale-105 shadow-green-200" : ""}
                  ${quizChosen === l && l !== quiz.target ? "bg-red-100 border-red-400 text-red-700" : ""}
                  ${quizChosen && l === quiz.target && quizChosen !== l ? "bg-green-100 border-green-400 text-green-700" : ""}
                `}>
                {l}
              </button>
            ))}
          </div>
          {quizChosen && (
            <div className={`text-xl font-bold animate-in zoom-in ${quizChosen === quiz.target ? "text-green-600" : "text-red-500"}`}>
              {quizChosen === quiz.target ? "🎉 Corect! Bravo!" : `❌ Era litera ${quiz.target}`}
            </div>
          )}
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
                <div className="text-xs text-muted-foreground">Trasează litera!</div>
              </div>
            </div>
            <span className="text-sm font-bold text-primary">⭐ {traceScore}/{TRACE_ALPHABET.length}</span>
          </div>

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
                Urmărește conturul literei cu degetul sau mouse-ul!
              </p>
              <TracingCanvas
                key={curLetter}
                template={curLetter}
                colorIdx={traceIdx}
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

      {/* ── VOWELS ── */}
      {mode === "vowels" && (
        <>
          <div className="text-center">
            <p className="font-bold text-lg">Apasă doar pe <span className="text-blue-600 font-black">Vocale</span>!</p>
            <p className="text-sm text-muted-foreground">Vocalele limbii române: A, Ă, Â, E, I, Î, O, U</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            {shuffle([...ALL_LETTERS]).map(l => {
              const isV = LETTERS_DATA[l].type === "vocala";
              return (
                <button key={l} onClick={() => setDiscovered(p => new Set([...p, l]))}
                  className={`w-12 h-12 rounded-2xl text-xl font-display font-bold transition-all duration-200 border-2 shadow-sm
                    ${discovered.has(l) ? (isV ? "bg-green-100 border-green-400 text-green-700 scale-110 shadow-green-100" : "bg-red-100 border-red-300 text-red-600 scale-95") :
                      "bg-white border-border hover:bg-primary/10 hover:border-primary hover:scale-105"}`}>
                  {l}
                </button>
              );
            })}
          </div>
          <div className="flex gap-6 text-sm font-bold">
            <span className="text-green-600">✅ Vocale: {[...discovered].filter(l => LETTERS_DATA[l]?.type === "vocala").length}/8</span>
            <span className="text-red-500">❌ Greșit: {[...discovered].filter(l => LETTERS_DATA[l]?.type === "consoana").length}</span>
          </div>
          <button onClick={() => setDiscovered(new Set())}
            className="text-xs text-muted-foreground underline hover:text-primary transition-colors">Resetează</button>
        </>
      )}
    </div>
  );
}
