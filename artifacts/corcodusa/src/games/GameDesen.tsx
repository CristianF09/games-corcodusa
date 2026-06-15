import { useRef, useState, useEffect, useCallback } from "react";

const COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#06b6d4",
  "#3b82f6","#8b5cf6","#ec4899","#ffffff","#1f2937",
];

const STAMPS = ["⭐","🌟","❤️","🌸","🌈","🦋","🐶","🐱","🌻","🎈"];

export default function GameDesen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(12);
  const [tool, setTool] = useState<"pen"|"eraser"|"stamp">("pen");
  const [stamp, setStamp] = useState("⭐");
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fef9f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#fef9f0";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === "pen" && lastPos.current) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (tool === "stamp") {
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e, canvas);
      ctx.font = `${size * 4}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stamp, pos.x, pos.y);
      return;
    }
    setDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function stopDraw() {
    setDrawing(false);
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fef9f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function saveCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "desenul-meu.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-center bg-card rounded-2xl p-3 border border-border shadow w-full max-w-xl">
        {/* Tools */}
        <div className="flex gap-1">
          {(["pen","eraser","stamp"] as const).map(t => (
            <button key={t} onClick={() => setTool(t)}
              className={`w-10 h-10 rounded-xl text-lg transition-all ${tool === t ? "bg-primary text-white shadow" : "bg-muted hover:bg-muted/70"}`}>
              {t === "pen" ? "✏️" : t === "eraser" ? "🧹" : "🌟"}
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex gap-1 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${color === c && tool === "pen" ? "border-foreground scale-125 shadow-md" : "border-white shadow"}`}
              style={{ background: c }} />
          ))}
        </div>

        {/* Brush size */}
        <input type="range" min="3" max="30" value={size} onChange={e => setSize(Number(e.target.value))}
          className="w-24 accent-primary" />

        {/* Actions */}
        <div className="flex gap-1">
          <button onClick={clearCanvas} className="px-3 py-1.5 rounded-xl text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all">🗑️ Șterge</button>
          <button onClick={saveCanvas} className="px-3 py-1.5 rounded-xl text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-all">💾 Salvează</button>
        </div>
      </div>

      {/* Stamp picker */}
      {tool === "stamp" && (
        <div className="flex gap-2 flex-wrap justify-center">
          {STAMPS.map(s => (
            <button key={s} onClick={() => setStamp(s)}
              className={`w-10 h-10 rounded-xl text-xl transition-all ${stamp === s ? "bg-primary/20 border-2 border-primary scale-110" : "hover:bg-muted"}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <canvas ref={canvasRef} width={600} height={400}
        className="rounded-3xl border-2 border-border shadow-xl w-full max-w-xl cursor-crosshair touch-none"
        style={{ maxHeight: "400px" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
    </div>
  );
}
