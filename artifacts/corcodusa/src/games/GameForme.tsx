import { useState } from "react";

type Shape = "cerc" | "pătrat" | "triunghi" | "stea";
type Color = "roșu" | "albastru" | "galben" | "verde";

interface Item { shape: Shape; color: Color; id: number }

const SHAPE_EMOJIS: Record<Shape, string> = {
  cerc: "⬤", pătrat: "■", triunghi: "▲", stea: "★",
};
const COLOR_HEX: Record<Color, string> = {
  roșu: "#ef4444", albastru: "#3b82f6", galben: "#eab308", verde: "#22c55e",
};
const SHAPES: Shape[] = ["cerc", "pătrat", "triunghi", "stea"];
const COLORS: Color[] = ["roșu", "albastru", "galben", "verde"];

function generateItems(): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < 8; i++) {
    items.push({
      id: i,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }
  return items;
}

export default function GameForme() {
  const [mode, setMode] = useState<"color" | "shape">("color");
  const [items, setItems] = useState<Item[]>(generateItems());
  const [selected, setSelected] = useState<number | null>(null);
  const [sorted, setSorted] = useState<Record<string, number[]>>({});
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ id: number; ok: boolean } | null>(null);

  const buckets = mode === "color" ? COLORS : SHAPES;
  const remaining = items.filter(item => !Object.values(sorted).flat().includes(item.id));

  function handleItemClick(id: number) {
    setSelected(id);
  }

  function handleBucket(bucket: string) {
    if (selected === null) return;
    const item = items.find(i => i.id === selected)!;
    const correct = mode === "color" ? item.color === bucket : item.shape === bucket;
    setFeedback({ id: selected, ok: correct });
    if (correct) {
      setSorted(prev => ({ ...prev, [bucket]: [...(prev[bucket] || []), selected] }));
      setScore(s => s + 1);
    }
    setTimeout(() => { setSelected(null); setFeedback(null); }, 700);
  }

  function restart() {
    setItems(generateItems());
    setSorted({});
    setSelected(null);
    setFeedback(null);
  }

  const done = remaining.length === 0;

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Mode & score */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex gap-2">
          <button onClick={() => { setMode("color"); restart(); }}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${mode === "color" ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
            🎨 Culori
          </button>
          <button onClick={() => { setMode("shape"); restart(); }}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${mode === "shape" ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
            🔷 Forme
          </button>
        </div>
        <span className="text-sm font-bold text-primary">⭐ {score}</span>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-4 py-6 animate-in zoom-in">
          <div className="text-7xl">🎉</div>
          <p className="text-2xl font-bold text-green-600">Ai sortat tot! Bravo!</p>
          <button onClick={restart} className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:-translate-y-1 transition-all">
            Joacă din nou
          </button>
        </div>
      ) : (
        <>
          <p className="text-base font-bold text-muted-foreground">
            {selected === null
              ? `Alege o formă și sortează după ${mode === "color" ? "culoare" : "formă"}!`
              : `Acum apasă pe ${mode === "color" ? "culoarea" : "forma"} potrivită ↓`}
          </p>

          {/* Items */}
          <div className="flex flex-wrap justify-center gap-3 max-w-sm bg-card rounded-3xl p-4 border-2 border-border shadow-inner min-h-20">
            {remaining.map(item => (
              <button key={item.id} onClick={() => handleItemClick(item.id)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border-3 transition-all duration-200
                  ${selected === item.id ? "scale-125 shadow-xl border-primary ring-4 ring-primary/30" : "hover:scale-110 border-transparent shadow-md hover:border-primary/40"}
                  ${feedback?.id === item.id ? (feedback.ok ? "bg-green-100" : "bg-red-100 animate-bounce") : "bg-white"}
                `}
                style={{ color: COLOR_HEX[item.color] }}>
                {SHAPE_EMOJIS[item.shape]}
              </button>
            ))}
          </div>

          {/* Buckets */}
          <div className="flex gap-3 flex-wrap justify-center">
            {buckets.map(bucket => (
              <button key={bucket} onClick={() => handleBucket(bucket)}
                disabled={selected === null}
                className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200
                  ${selected !== null ? "hover:scale-105 hover:shadow-lg cursor-pointer border-border bg-white" : "border-dashed border-muted-foreground/30 bg-muted/20 cursor-default opacity-60"}
                `}>
                {mode === "color" ? (
                  <span className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ background: COLOR_HEX[bucket as Color] }} />
                ) : (
                  <span className="text-2xl text-muted-foreground">{SHAPE_EMOJIS[bucket as Shape]}</span>
                )}
                <span className="capitalize text-foreground">{bucket}</span>
                <span className="text-xs text-muted-foreground">({sorted[bucket]?.length ?? 0})</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
