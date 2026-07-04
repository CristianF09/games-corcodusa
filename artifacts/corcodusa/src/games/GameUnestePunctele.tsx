import { useState, useMemo } from "react";
import { playCelebrate, playClick, playCorrect } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";
import { LETTER_STROKES, DIGIT_STROKES, numberStrokes, type Stroke } from "@/lib/stroke-data";

/* ─── Confetti ──────────────────────────────────────────────── */
function Confetti() {
  const PIECES = Array.from({ length: 24 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.7,
    color: ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#a855f7"][i % 6], size: 7 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {PIECES.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.left}%`, top: "-14px", animationDelay: `${p.delay}s` }}>
          <div className="animate-bounce" style={{ width: p.size, height: p.size, background: p.color, borderRadius: "3px", transform: `rotate(${Math.random()*360}deg)` }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Types ─────────────────────────────────────────────────── */
type Pt = [number, number];

interface Puzzle {
  key: string;
  label: string;
  emoji: string;
  color: string;
  dots: Pt[];
  lifts: Set<number>; // dot indices where NO line is drawn from the previous dot
}

/* ─── Stroke → Dot conversion ───────────────────────────────── */
const MID_THRESH = 22; // add midpoint if segment length > this (0-100 space)

function strokesToDots(strokes: Stroke[]): Pick<Puzzle, "dots" | "lifts"> {
  const dots: Pt[] = [];
  const lifts = new Set<number>();

  for (let si = 0; si < strokes.length; si++) {
    const stroke = strokes[si];
    const prevEnd = dots.length ? dots[dots.length - 1] : null;
    const firstPt: Pt = [stroke[0].x, stroke[0].y];

    // Determine if this stroke is a "lift" (starts at a different position)
    const needsLift =
      prevEnd &&
      (Math.abs(prevEnd[0] - firstPt[0]) > 2 || Math.abs(prevEnd[1] - firstPt[1]) > 2);

    if (needsLift || si === 0) lifts.add(dots.length);

    for (let pi = 0; pi < stroke.length; pi++) {
      const pt: Pt = [stroke[pi].x, stroke[pi].y];

      // Add midpoint for long segments (except between strokes)
      if (pi > 0) {
        const prev = stroke[pi - 1];
        const dist = Math.hypot(pt[0] - prev.x, pt[1] - prev.y);
        if (dist > MID_THRESH) {
          const mid: Pt = [(prev.x + pt[0]) / 2, (prev.y + pt[1]) / 2];
          dots.push(mid);
        }
      }
      dots.push(pt);
    }
  }

  return { dots, lifts };
}

/* ─── Image puzzles (custom dot-to-dot pictures) ────────────── */
const IMAGE_PUZZLES: Omit<Puzzle, "key">[] = [
  {
    label: "Inimă", emoji: "❤️", color: "#ef4444",
    // Heart shape, single closed stroke
    dots: [[50,88],[72,70],[85,52],[85,33],[74,18],[60,18],[50,32],[40,18],[26,18],[15,33],[15,52],[28,70],[50,88]],
    lifts: new Set([0]),
  },
  {
    label: "Stea", emoji: "⭐", color: "#f59e0b",
    // 5-pointed star (10 outer+inner points, closed)
    dots: [[50,8],[62,38],[92,38],[68,58],[78,88],[50,70],[22,88],[32,58],[8,38],[38,38],[50,8]],
    lifts: new Set([0]),
  },
  {
    label: "Casă", emoji: "🏠", color: "#3b82f6",
    dots: [[20,88],[80,88],[80,52],[50,15],[20,52],[20,88],[38,88],[38,65],[62,65],[62,88]],
    lifts: new Set([0, 6]),
  },
  {
    label: "Pește", emoji: "🐟", color: "#06b6d4",
    // Fish body (single closed loop) + tail fork
    dots: [[18,50],[25,28],[42,18],[62,20],[75,36],[80,50],[75,64],[62,80],[42,82],[25,72],[18,50]],
    lifts: new Set([0]),
  },
  {
    label: "Fluture", emoji: "🦋", color: "#8b5cf6",
    // Butterfly wings traced as figure-8 like path
    dots: [
      [50,50],[35,38],[18,30],[10,42],[18,55],[35,58],[50,50],
      [65,38],[82,30],[90,42],[82,55],[65,58],[50,50],
      [50,50],[50,75],
    ],
    lifts: new Set([0, 13]),
  },
  {
    label: "Rachetă", emoji: "🚀", color: "#6366f1",
    // Rocket outline
    dots: [[50,5],[62,20],[68,42],[68,72],[58,82],[50,90],[42,82],[32,72],[32,42],[38,20],[50,5]],
    lifts: new Set([0]),
  },
  {
    label: "Nor", emoji: "☁️", color: "#64748b",
    // Cloud bumpy outline
    dots: [[20,70],[15,58],[18,46],[28,40],[38,36],[46,30],[55,28],[65,30],[74,36],[80,44],[82,55],[76,65],[66,72],[34,72],[20,70]],
    lifts: new Set([0]),
  },
  {
    label: "Copac", emoji: "🌲", color: "#22c55e",
    // Triangle crown + trunk
    dots: [[50,10],[75,55],[62,55],[70,75],[55,75],[55,90],[45,90],[45,75],[30,75],[38,55],[25,55],[50,10]],
    lifts: new Set([0]),
  },
  {
    label: "Pisică", emoji: "🐱", color: "#f97316",
    // Cat face outline with ears
    dots: [[25,25],[18,10],[35,22],[50,18],[65,22],[82,10],[75,25],[82,50],[72,75],[50,82],[28,75],[18,50],[25,25]],
    lifts: new Set([0]),
  },
  {
    label: "Soare", emoji: "☀️", color: "#eab308",
    // Sun circle + 8 rays (simplified as 2 strokes each)
    dots: [[50,15],[58,20],[65,28],[68,38],[65,50],[58,58],[50,62],[42,58],[35,50],[32,38],[35,28],[42,20],[50,15]],
    lifts: new Set([0]),
  },
];

/* ─── Puzzle builders ──────────────────────────────────────── */
function buildNumberPuzzle(n: number): Puzzle {
  const strokes = numberStrokes(n);
  const { dots, lifts } = strokesToDots(strokes);
  const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b"];
  return { key: `n${n}`, label: `${n}`, emoji: ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","1️⃣0️⃣"][n <= 10 ? n - 1 : 0] ?? "🔢", color: COLORS[(n - 1) % COLORS.length], dots, lifts };
}

function buildLetterPuzzle(letter: string): Puzzle {
  const strokes = LETTER_STROKES[letter];
  if (!strokes) return { key: `l${letter}`, label: letter, emoji: "🔤", color: "#3b82f6", dots: [], lifts: new Set([0]) };
  const { dots, lifts } = strokesToDots(strokes);
  const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899"];
  const idx = letter.charCodeAt(0) - 65;
  return { key: `l${letter}`, label: letter, emoji: "🔤", color: COLORS[idx % COLORS.length], dots, lifts };
}

/* ─── Category definitions ──────────────────────────────────── */
const CATEGORIES = [
  {
    id: "cifre",   label: "Cifre",   emoji: "🔢", color: "#f97316", bg: "#fff7ed",
    items: Array.from({ length: 20 }, (_, i) => buildNumberPuzzle(i + 1)),
  },
  {
    id: "litere",  label: "Litere",  emoji: "🔤", color: "#3b82f6", bg: "#eff6ff",
    items: "ABCDEFGHIJKLMNOPRSTUVXYZ".split("").map(buildLetterPuzzle),
  },
  {
    id: "imagini", label: "Imagini", emoji: "🎨", color: "#8b5cf6", bg: "#faf5ff",
    items: IMAGE_PUZZLES.map((p, i) => ({ ...p, key: `img${i}` })),
  },
] as const;

type CatId = "cifre" | "litere" | "imagini";

/* ─── Dot SVG renderer ──────────────────────────────────────── */
const DOT_R = 3.5;     // dot radius in SVG units (0-100 space)
const LINE_W = 2.2;    // line stroke width

function PuzzleSVG({
  puzzle, nextIdx, onDotClick,
}: {
  puzzle: Puzzle;
  nextIdx: number;
  onDotClick: (i: number) => void;
}) {
  const { dots, lifts, color } = puzzle;
  const done = nextIdx >= dots.length;

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full max-w-[340px] aspect-square touch-none select-none"
      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}
    >
      <rect width="100" height="100" rx="8" fill="white" />

      {/* Faint guide lines (whole path) */}
      {dots.slice(1).map((d, i) => {
        if (lifts.has(i + 1)) return null;
        const a = dots[i];
        return (
          <line key={`g${i}`}
            x1={a[0]} y1={a[1]} x2={d[0]} y2={d[1]}
            stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="2 3"
          />
        );
      })}

      {/* Drawn lines so far */}
      {nextIdx > 1 && dots.slice(1, nextIdx).map((d, i) => {
        if (lifts.has(i + 1)) return null;
        const a = dots[i];
        return (
          <line key={`l${i}`}
            x1={a[0]} y1={a[1]} x2={d[0]} y2={d[1]}
            stroke={color} strokeWidth={LINE_W} strokeLinecap="round"
          />
        );
      })}

      {/* Dots */}
      {dots.map((d, i) => {
        const connected = i < nextIdx;
        const isNext = i === nextIdx;
        const isPast = i < nextIdx;
        return (
          <g key={`d${i}`}
            onClick={() => onDotClick(i)}
            style={{ cursor: isNext ? "pointer" : "default" }}
          >
            {/* Pulse ring on next dot */}
            {isNext && (
              <circle
                cx={d[0]} cy={d[1]} r={DOT_R + 3}
                fill="none" stroke={color} strokeWidth="1" opacity="0.4"
                style={{ animation: "ping 1s infinite" }}
              />
            )}
            <circle
              cx={d[0]} cy={d[1]} r={DOT_R}
              fill={isPast ? color : isNext ? color : "#f8fafc"}
              stroke={isPast ? color : isNext ? color : "#cbd5e1"}
              strokeWidth="0.8"
              opacity={isPast ? 1 : isNext ? 0.9 : 0.7}
            />
            {!isPast && (
              <text
                x={d[0]} y={d[1] + 1.3}
                textAnchor="middle"
                fontSize="3"
                fontWeight="bold"
                fill={isNext ? "white" : "#94a3b8"}
                style={{ pointerEvents: "none", fontFamily: "monospace" }}
              >
                {i + 1}
              </text>
            )}
          </g>
        );
      })}

      {/* Completion overlay */}
      {done && (
        <text x="50" y="96" textAnchor="middle" fontSize="3.5" fill={color} fontWeight="bold">
          {puzzle.label} ✓
        </text>
      )}
    </svg>
  );
}

/* ─── Main component ────────────────────────────────────────── */
export default function GameUnestePunctele() {
  const [phase, setPhase] = useState<"menu" | "selectCat" | "selectItem" | "playing" | "won">("menu");
  const [catId, setCatId] = useState<CatId>("cifre");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [nextIdx, setNextIdx] = useState(0);
  const [errors, setErrors] = useState(0);

  const cat = CATEGORIES.find(c => c.id === catId)!;

  function pickPuzzle(p: Puzzle) {
    setPuzzle(p);
    setNextIdx(0);
    setErrors(0);
    setPhase("playing");
    playClick();
  }

  function handleDotClick(i: number) {
    if (!puzzle || phase !== "playing") return;
    if (i === nextIdx) {
      playCorrect();
      const newNext = nextIdx + 1;
      setNextIdx(newNext);
      if (newNext >= puzzle.dots.length) {
        setPhase("won");
        playCelebrate();
      }
    } else if (i > nextIdx) {
      // Wrong dot — flash but don't penalize harshly (kids game)
      setErrors(e => e + 1);
    }
  }

  /* ── Menu ── */
  if (phase === "menu") return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🔵</div>
        <h2 className="text-2xl font-black text-[#1F2937]">Unește Punctele</h2>
        <p className="text-sm text-[#6B7280] mt-1">Conectează punctele în ordine ca să desenezi forma!</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setCatId(c.id as CatId); setPhase("selectItem"); playClick(); }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-transparent hover:border-orange-200 bg-gray-50 hover:bg-orange-50 transition-all active:scale-95"
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-sm font-black text-[#1F2937]">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Select item ── */
  if (phase === "selectItem") return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={() => setPhase("menu")} className="text-xs text-gray-400 hover:text-gray-600">← Înapoi</button>
        <span className="text-base font-black text-[#1F2937]">{cat.emoji} {cat.label}</span>
        <div className="w-12" />
      </div>
      <div className="grid gap-2 w-full max-w-sm"
        style={{ gridTemplateColumns: cat.id === "imagini" ? "repeat(5, 1fr)" : "repeat(6, 1fr)" }}
      >
        {cat.items.map((item) => (
          <button key={(item as Puzzle).key}
            onClick={() => pickPuzzle(item as Puzzle)}
            className="flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl bg-white border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all active:scale-95 shadow-sm aspect-square"
            style={{ borderColor: (item as Puzzle).color + "40" }}
          >
            {cat.id === "imagini" ? (
              <span className="text-2xl">{(item as Puzzle).emoji}</span>
            ) : null}
            <span className="text-sm font-black leading-tight" style={{ color: (item as Puzzle).color }}>
              {(item as Puzzle).label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Won ── */
  if (phase === "won" && puzzle) return (
    <div className="flex flex-col items-center gap-5 p-6 min-h-[420px] justify-center">
      <Confetti />
      <KidEmoji emoji="🎉" size={72} />
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#1F2937]">Bravo!</h2>
        <p className="text-[#6B7280] mt-2">
          Ai desenat <strong style={{ color: puzzle.color }}>{puzzle.label}</strong> conectând{" "}
          <strong>{puzzle.dots.length}</strong> puncte!
        </p>
      </div>
      {/* Show completed puzzle */}
      <PuzzleSVG puzzle={puzzle} nextIdx={puzzle.dots.length} onDotClick={() => {}} />
      <div className="flex gap-3">
        <button onClick={() => setPhase("selectItem")}
          className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-[#374151] hover:border-gray-300"
        >← Alege alt desen</button>
        <button onClick={() => pickPuzzle(puzzle)}
          className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] text-white font-black rounded-xl shadow-lg hover:shadow-xl active:scale-95"
        >Din nou! 🔄</button>
      </div>
    </div>
  );

  /* ── Playing ── */
  if (phase === "playing" && puzzle) return (
    <div className="flex flex-col items-center gap-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={() => setPhase("selectItem")} className="text-xs text-gray-400 hover:text-gray-600">← Înapoi</button>
        <span className="text-lg font-black" style={{ color: puzzle.color }}>
          {cat.emoji} {puzzle.label}
        </span>
        <span className="text-sm font-bold text-[#374151]">
          {nextIdx}/{puzzle.dots.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(nextIdx / puzzle.dots.length) * 100}%`, background: puzzle.color }}
        />
      </div>

      {/* Puzzle SVG */}
      <PuzzleSVG puzzle={puzzle} nextIdx={nextIdx} onDotClick={handleDotClick} />

      {/* Instruction */}
      <div className="text-center">
        {nextIdx < puzzle.dots.length ? (
          <p className="text-sm text-[#6B7280]">
            Apasă pe punctul{" "}
            <strong className="text-xl font-black" style={{ color: puzzle.color }}>
              {nextIdx + 1}
            </strong>
          </p>
        ) : (
          <p className="text-sm font-bold text-green-600">✓ Gata! Felicitări!</p>
        )}
      </div>
    </div>
  );

  return null;
}
