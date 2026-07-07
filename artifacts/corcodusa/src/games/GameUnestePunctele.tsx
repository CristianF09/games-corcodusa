import { useState } from "react";
import { playCelebrate, playClick, playCorrect } from "@/lib/sfx";
import { KidEmoji } from "@/components/kid-emoji";

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

/* ─── Image puzzles (dot-to-dot pictures, 0-100 coordinate space) ── */
const IMAGE_PUZZLES: Omit<Puzzle, "key">[] = [
  {
    label: "Inimă", emoji: "❤️", color: "#ef4444",
    dots: [[50,88],[72,70],[85,52],[85,33],[74,18],[60,18],[50,32],[40,18],[26,18],[15,33],[15,52],[28,70],[50,88]],
    lifts: new Set([0]),
  },
  {
    label: "Stea", emoji: "⭐", color: "#f59e0b",
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
    dots: [[18,50],[25,28],[42,18],[62,20],[75,36],[80,50],[75,64],[62,80],[42,82],[25,72],[18,50]],
    lifts: new Set([0]),
  },
  {
    label: "Fluture", emoji: "🦋", color: "#8b5cf6",
    dots: [
      [50,50],[35,38],[18,30],[10,42],[18,55],[35,58],[50,50],
      [65,38],[82,30],[90,42],[82,55],[65,58],[50,50],
      [50,50],[50,75],
    ],
    lifts: new Set([0, 13]),
  },
  {
    label: "Rachetă", emoji: "🚀", color: "#6366f1",
    dots: [[50,5],[62,20],[68,42],[68,72],[58,82],[50,90],[42,82],[32,72],[32,42],[38,20],[50,5]],
    lifts: new Set([0]),
  },
  {
    label: "Nor", emoji: "☁️", color: "#64748b",
    dots: [[20,70],[15,58],[18,46],[28,40],[38,36],[46,30],[55,28],[65,30],[74,36],[80,44],[82,55],[76,65],[66,72],[34,72],[20,70]],
    lifts: new Set([0]),
  },
  {
    label: "Brad", emoji: "🌲", color: "#22c55e",
    dots: [[50,10],[75,55],[62,55],[70,75],[55,75],[55,90],[45,90],[45,75],[30,75],[38,55],[25,55],[50,10]],
    lifts: new Set([0]),
  },
  {
    label: "Pisică", emoji: "🐱", color: "#f97316",
    dots: [[25,25],[18,10],[35,22],[50,18],[65,22],[82,10],[75,25],[82,50],[72,75],[50,82],[28,75],[18,50],[25,25]],
    lifts: new Set([0]),
  },
  {
    label: "Soare", emoji: "☀️", color: "#eab308",
    dots: [[50,15],[58,20],[65,28],[68,38],[65,50],[58,58],[50,62],[42,58],[35,50],[32,38],[35,28],[42,20],[50,15]],
    lifts: new Set([0]),
  },
  {
    label: "Lună", emoji: "🌙", color: "#facc15",
    dots: [[60,8],[76,16],[86,34],[88,52],[82,72],[68,88],[55,93],[68,80],[74,62],[74,42],[66,24],[60,8]],
    lifts: new Set([0]),
  },
  {
    label: "Barcă", emoji: "⛵", color: "#0ea5e9",
    dots: [[18,68],[82,68],[72,86],[28,86],[18,68],[50,62],[50,12],[76,62],[50,62]],
    lifts: new Set([0, 5]),
  },
  {
    label: "Mașină", emoji: "🚗", color: "#ef4444",
    dots: [[8,72],[12,54],[28,52],[36,36],[64,36],[72,52],[92,54],[92,72],[8,72]],
    lifts: new Set([0]),
  },
  {
    label: "Balon", emoji: "🎈", color: "#ec4899",
    dots: [[50,8],[64,14],[72,28],[70,44],[60,56],[50,60],[40,56],[30,44],[28,28],[36,14],[50,8],[50,64],[46,74],[54,84],[50,92]],
    lifts: new Set([0, 11]),
  },
  {
    label: "Umbrelă", emoji: "☂️", color: "#8b5cf6",
    dots: [[10,48],[20,30],[36,18],[50,15],[64,18],[80,30],[90,48],[10,48],[50,48],[50,78],[54,86],[62,84]],
    lifts: new Set([0, 8]),
  },
  {
    label: "Măr", emoji: "🍎", color: "#ef4444",
    dots: [[50,26],[62,18],[74,24],[82,40],[78,58],[66,74],[54,80],[50,76],[46,80],[34,74],[22,58],[18,40],[26,24],[38,18],[50,26],[50,22],[54,10]],
    lifts: new Set([0, 15]),
  },
  {
    label: "Floare", emoji: "🌸", color: "#ec4899",
    dots: [[50,10],[58,30],[78,20],[68,40],[90,50],[68,60],[78,80],[58,70],[50,90],[42,70],[22,80],[32,60],[10,50],[32,40],[22,20],[42,30],[50,10]],
    lifts: new Set([0]),
  },
  {
    label: "Ciupercă", emoji: "🍄", color: "#f97316",
    dots: [[15,50],[22,32],[38,20],[62,20],[78,32],[85,50],[15,50],[40,50],[38,82],[62,82],[60,50]],
    lifts: new Set([0, 7]),
  },
  {
    label: "Om de zăpadă", emoji: "⛄", color: "#38bdf8",
    dots: [[50,10],[60,14],[64,25],[58,34],[42,34],[36,25],[40,14],[50,10],[40,36],[27,46],[23,62],[30,78],[50,86],[70,78],[77,62],[73,46],[60,36]],
    lifts: new Set([0, 8]),
  },
  {
    label: "Cadou", emoji: "🎁", color: "#f43f5e",
    dots: [[20,48],[80,48],[80,88],[20,88],[20,48],[50,48],[50,88],[50,44],[38,32],[44,22],[50,34],[56,22],[62,32],[50,44]],
    lifts: new Set([0, 5, 7]),
  },
  {
    label: "Balenă", emoji: "🐳", color: "#3b82f6",
    dots: [[12,55],[24,40],[42,32],[62,34],[76,44],[84,58],[78,70],[60,78],[36,76],[18,66],[12,55],[84,52],[93,42],[95,58],[86,62]],
    lifts: new Set([0, 11]),
  },
  {
    label: "Iepuraș", emoji: "🐰", color: "#f472b6",
    dots: [
      [36,52],[40,42],[50,38],[60,42],[64,52],[60,64],[50,70],[40,64],[36,52],
      [43,40],[37,18],[43,8],[49,20],[48,38],
      [57,40],[63,18],[57,8],[51,20],[52,38],
    ],
    lifts: new Set([0, 9, 14]),
  },
  {
    label: "Fulger", emoji: "⚡", color: "#eab308",
    dots: [[58,6],[30,54],[46,54],[38,92],[72,42],[54,42],[64,6],[58,6]],
    lifts: new Set([0]),
  },
  {
    label: "Coroană", emoji: "👑", color: "#f59e0b",
    dots: [[15,75],[15,35],[32,55],[50,25],[68,55],[85,35],[85,75],[15,75]],
    lifts: new Set([0]),
  },
  {
    label: "Diamant", emoji: "💎", color: "#06b6d4",
    dots: [[30,22],[70,22],[90,45],[50,88],[10,45],[30,22],[10,45],[90,45]],
    lifts: new Set([0, 6]),
  },
  {
    label: "Înghețată", emoji: "🍦", color: "#f9a8d4",
    dots: [[34,44],[29,32],[38,20],[50,16],[62,20],[71,32],[66,44],[50,90],[34,44]],
    lifts: new Set([0]),
  },
  {
    label: "Pară", emoji: "🍐", color: "#84cc16",
    dots: [[50,10],[57,18],[59,30],[67,42],[72,56],[68,72],[56,82],[44,82],[32,72],[28,56],[33,42],[41,30],[43,18],[50,10]],
    lifts: new Set([0]),
  },
  {
    label: "Morcov", emoji: "🥕", color: "#fb923c",
    dots: [[40,20],[60,20],[53,88],[47,88],[40,20],[45,16],[38,5],[50,16],[50,4],[55,16],[62,5]],
    lifts: new Set([0, 5, 7, 9]),
  },
  {
    label: "Avion", emoji: "✈️", color: "#64748b",
    dots: [[8,52],[90,18],[62,86],[48,58],[8,52],[48,58],[90,18]],
    lifts: new Set([0, 5]),
  },
  {
    label: "Steag", emoji: "🚩", color: "#dc2626",
    dots: [[32,92],[32,10],[32,14],[74,24],[32,36]],
    lifts: new Set([0, 2]),
  },
  {
    label: "Ou", emoji: "🥚", color: "#a78bfa",
    dots: [[50,10],[62,17],[70,32],[72,50],[68,68],[58,81],[50,84],[42,81],[32,68],[28,50],[30,32],[38,17],[50,10]],
    lifts: new Set([0]),
  },
  {
    label: "Cireșe", emoji: "🍒", color: "#dc2626",
    dots: [
      [36,62],[43,56],[49,62],[47,74],[38,76],[32,70],[36,62],
      [42,56],[52,20],
      [62,66],[69,60],[75,66],[73,78],[64,80],[58,74],[62,66],
      [68,60],[54,20],
    ],
    lifts: new Set([0, 7, 9, 16]),
  },
  {
    label: "Pizza", emoji: "🍕", color: "#f59e0b",
    dots: [[20,22],[80,22],[50,90],[20,22],[24,30],[76,30]],
    lifts: new Set([0, 4]),
  },
  {
    label: "Șarpe", emoji: "🐍", color: "#22c55e",
    dots: [[18,20],[38,14],[58,18],[70,30],[62,44],[42,48],[30,58],[36,70],[56,76],[74,72],[85,82]],
    lifts: new Set([0]),
  },
  {
    label: "Fantomă", emoji: "👻", color: "#94a3b8",
    dots: [[50,10],[66,18],[74,36],[74,82],[64,72],[57,84],[50,74],[43,84],[36,72],[26,82],[26,36],[34,18],[50,10]],
    lifts: new Set([0]),
  },
  {
    label: "Brioșă", emoji: "🧁", color: "#f472b6",
    dots: [[32,52],[28,40],[38,30],[50,26],[62,30],[72,40],[68,52],[62,86],[38,86],[32,52]],
    lifts: new Set([0]),
  },
  {
    label: "Ceașcă", emoji: "☕", color: "#a16207",
    dots: [[24,40],[70,40],[68,74],[56,84],[40,84],[26,74],[24,40],[70,48],[82,50],[82,62],[68,64]],
    lifts: new Set([0, 7]),
  },
  {
    label: "Curcubeu", emoji: "🌈", color: "#a855f7",
    dots: [[10,80],[14,56],[30,36],[50,28],[70,36],[86,56],[90,80],[74,80],[70,62],[58,48],[50,46],[42,48],[30,62],[26,80]],
    lifts: new Set([0, 7]),
  },
];

const PUZZLES: Puzzle[] = IMAGE_PUZZLES.map((p, i) => ({ ...p, key: `img${i}` }));

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
      className="w-full max-w-[min(92vw,520px)] aspect-square touch-none select-none"
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
  const [phase, setPhase] = useState<"menu" | "playing" | "won">("menu");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [nextIdx, setNextIdx] = useState(0);

  function pickPuzzle(p: Puzzle) {
    setPuzzle(p);
    setNextIdx(0);
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
    }
  }

  /* ── Menu: pick a picture ── */
  if (phase === "menu") return (
    <div className="flex flex-col items-center gap-5 p-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🔵</div>
        <h2 className="text-2xl font-black text-[#1F2937]">Unește Punctele</h2>
        <p className="text-sm text-[#6B7280] mt-1">Alege un desen și conectează punctele în ordine!</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 w-full max-w-2xl">
        {PUZZLES.map((p) => (
          <button key={p.key}
            onClick={() => pickPuzzle(p)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border-2 hover:bg-orange-50 transition-all active:scale-95 shadow-sm aspect-square"
            style={{ borderColor: p.color + "40" }}
          >
            <KidEmoji emoji={p.emoji} size={34} />
            <span className="text-[11px] font-black leading-tight text-center" style={{ color: p.color }}>
              {p.label}
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
        <button onClick={() => setPhase("menu")}
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
      <div className="flex items-center justify-between w-full max-w-lg">
        <button onClick={() => setPhase("menu")} className="text-xs text-gray-400 hover:text-gray-600">← Înapoi</button>
        <span className="text-lg font-black flex items-center gap-2" style={{ color: puzzle.color }}>
          <KidEmoji emoji={puzzle.emoji} size={24} /> {puzzle.label}
        </span>
        <span className="text-sm font-bold text-[#374151]">
          {nextIdx}/{puzzle.dots.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg h-2 bg-gray-100 rounded-full overflow-hidden">
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
