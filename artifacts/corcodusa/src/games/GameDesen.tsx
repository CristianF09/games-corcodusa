import { useRef, useState, useEffect } from "react";
import { playClick, playSwap, playCelebrate } from "@/lib/sfx";

const PALETTE = [
  "#ef4444","#f97316","#eab308","#84cc16","#22c55e",
  "#06b6d4","#3b82f6","#8b5cf6","#ec4899","#ffffff",
  "#d1d5db","#6b7280","#1f2937","#000000","#fef3c7",
];

const STAMP_SETS = {
  "Natură": ["🌸","🌻","🌈","⭐","☀️","🌙","☁️","🌊","🍀","🌲"],
  "Animale": ["🐶","🐱","🐸","🦋","🐬","🦊","🐼","🦁","🐧","🦄"],
  "Obiecte": ["❤️","⚡","🎈","🏆","🎵","🍭","🚀","🏠","🎨","🔮"],
};

const COLORING_PAGES = [
  {
    name: "Soare și nori",
    draw: (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, 600, 420);
      // Sun
      ctx.strokeStyle = "#333"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(300, 130, 70, 0, Math.PI * 2); ctx.stroke();
      // Sun rays
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(300 + Math.cos(a) * 80, 130 + Math.sin(a) * 80);
        ctx.lineTo(300 + Math.cos(a) * 105, 130 + Math.sin(a) * 105);
        ctx.stroke();
      }
      // Clouds
      for (const [cx, cy] of [[150, 80], [450, 100]] as [number, number][]) {
        ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 30, cy - 10, 28, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 55, cy, 32, 0, Math.PI * 2); ctx.stroke();
      }
      // Ground
      ctx.beginPath(); ctx.moveTo(0, 320); ctx.lineTo(600, 320); ctx.stroke();
      // Flowers
      for (const fx of [80, 180, 420, 530] as number[]) {
        ctx.beginPath(); ctx.moveTo(fx, 320); ctx.lineTo(fx, 260); ctx.stroke();
        ctx.beginPath(); ctx.arc(fx, 248, 16, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(fx - 18, 248, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(fx + 18, 248, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(fx, 230, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(fx, 266, 12, 0, Math.PI * 2); ctx.stroke();
      }
    },
  },
  {
    name: "Casă drăguță",
    draw: (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, 600, 420);
      ctx.strokeStyle = "#333"; ctx.lineWidth = 3;
      // House body
      ctx.strokeRect(150, 200, 300, 200);
      // Roof
      ctx.beginPath(); ctx.moveTo(120, 200); ctx.lineTo(300, 60); ctx.lineTo(480, 200); ctx.closePath(); ctx.stroke();
      // Door
      ctx.strokeRect(245, 310, 70, 90);
      ctx.beginPath(); ctx.arc(280, 355, 35, Math.PI, 0); ctx.stroke();
      // Windows
      ctx.strokeRect(170, 240, 70, 60);
      ctx.strokeRect(360, 240, 70, 60);
      ctx.beginPath(); ctx.moveTo(170, 270); ctx.lineTo(240, 270); ctx.moveTo(205, 240); ctx.lineTo(205, 300); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(360, 270); ctx.lineTo(430, 270); ctx.moveTo(395, 240); ctx.lineTo(395, 300); ctx.stroke();
      // Chimney
      ctx.strokeRect(360, 80, 40, 80);
      // Ground
      ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(600, 400); ctx.stroke();
      // Tree
      ctx.beginPath(); ctx.moveTo(520, 400); ctx.lineTo(520, 300); ctx.stroke();
      ctx.beginPath(); ctx.arc(520, 270, 45, 0, Math.PI * 2); ctx.stroke();
    },
  },
  {
    name: "Pește în mare",
    draw: (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, 600, 420);
      ctx.strokeStyle = "#333"; ctx.lineWidth = 3;
      // Waves
      for (let y = 30; y < 420; y += 60) {
        ctx.beginPath();
        for (let x = 0; x <= 600; x += 20) ctx[x === 0 ? "moveTo" : "lineTo"](x, y + Math.sin(x / 30) * 12);
        ctx.stroke();
      }
      // Big fish
      ctx.beginPath(); ctx.ellipse(260, 210, 110, 65, 0, 0, Math.PI * 2); ctx.stroke();
      // Tail
      ctx.beginPath(); ctx.moveTo(150, 210); ctx.lineTo(80, 160); ctx.lineTo(80, 260); ctx.closePath(); ctx.stroke();
      // Eye
      ctx.beginPath(); ctx.arc(340, 190, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(346, 186, 6, 0, Math.PI * 2); ctx.fill();
      // Fins
      ctx.beginPath(); ctx.moveTo(250, 145); ctx.lineTo(290, 100); ctx.lineTo(320, 145); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(200, 260); ctx.lineTo(220, 300); ctx.lineTo(260, 270); ctx.stroke();
      // Bubbles
      for (const [bx, by, br] of [[380, 120, 14], [410, 80, 10], [430, 100, 8]] as [number,number,number][]) {
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.stroke();
      }
    },
  },
  {
    name: "Fluture",
    draw: (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, 600, 420);
      ctx.strokeStyle = "#333"; ctx.lineWidth = 3;
      // Body
      ctx.beginPath(); ctx.ellipse(300, 210, 10, 70, 0, 0, Math.PI * 2); ctx.stroke();
      // Wings (4 big loops)
      ctx.beginPath(); ctx.ellipse(220, 150, 75, 55, -0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(380, 150, 75, 55, 0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(235, 270, 55, 40, 0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(365, 270, 55, 40, -0.3, 0, Math.PI * 2); ctx.stroke();
      // Wing patterns
      for (const [cx, cy, r] of [[210, 150, 18], [390, 150, 18], [240, 265, 14], [360, 265, 14]] as [number,number,number][]) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      // Antennae
      ctx.beginPath(); ctx.moveTo(296, 145); ctx.quadraticCurveTo(270, 100, 260, 80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(304, 145); ctx.quadraticCurveTo(330, 100, 340, 80); ctx.stroke();
      ctx.beginPath(); ctx.arc(260, 78, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(340, 78, 6, 0, Math.PI * 2); ctx.stroke();
    },
  },
  {
    name: "Rachetă în spațiu",
    draw: (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, 600, 420);
      ctx.strokeStyle = "#333"; ctx.lineWidth = 3;
      // Rocket body
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.quadraticCurveTo(360, 110, 360, 230);
      ctx.lineTo(240, 230);
      ctx.quadraticCurveTo(240, 110, 300, 60);
      ctx.closePath(); ctx.stroke();
      // Window
      ctx.beginPath(); ctx.arc(300, 150, 28, 0, Math.PI * 2); ctx.stroke();
      // Fins
      ctx.beginPath(); ctx.moveTo(240, 200); ctx.lineTo(190, 260); ctx.lineTo(240, 240); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(360, 200); ctx.lineTo(410, 260); ctx.lineTo(360, 240); ctx.closePath(); ctx.stroke();
      // Bottom flames
      ctx.beginPath(); ctx.moveTo(255, 230); ctx.quadraticCurveTo(265, 280, 280, 230); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(300, 230); ctx.quadraticCurveTo(300, 290, 300, 230); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(345, 230); ctx.quadraticCurveTo(335, 280, 320, 230); ctx.stroke();
      // Stars
      for (const [sx, sy] of [[100, 90], [500, 70], [80, 300], [540, 320], [150, 350], [480, 150]] as [number,number][]) {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.moveTo(sx + Math.cos(a) * 12, sy + Math.sin(a) * 12);
          ctx.lineTo(sx - Math.cos(a) * 12, sy - Math.sin(a) * 12);
        }
        ctx.stroke();
      }
      // Planet
      ctx.beginPath(); ctx.arc(500, 330, 40, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(500, 330, 65, 16, -0.3, 0, Math.PI * 2); ctx.stroke();
    },
  },
];

type Tool = "pen" | "eraser" | "fill" | "stamp";

export default function GameDesen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(10);
  const [tool, setTool] = useState<Tool>("pen");
  const [stampSet, setStampSet] = useState("Natură");
  const [stamp, setStamp] = useState("🌸");
  const [drawing, setDrawing] = useState(false);
  const [coloringIdx, setColoringIdx] = useState(-1);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  function initCanvas() {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, c.width, c.height);
  }

  useEffect(() => { initCanvas(); }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width, sy = c.height / rect.height;
    if ("touches" in e) return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  function saveHistory() {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    historyRef.current = [...historyRef.current.slice(-19), ctx.getImageData(0, 0, c.width, c.height)];
  }

  function undo() {
    if (!historyRef.current.length) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const img = historyRef.current.pop()!;
    ctx.putImageData(img, 0, 0);
  }

  function floodFill(x: number, y: number, fillColor: string) {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    saveHistory();
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    const px = Math.round(x), py = Math.round(y);
    const idx = (py * c.width + px) * 4;
    const tr = d[idx], tg = d[idx+1], tb = d[idx+2], ta = d[idx+3];
    const hex = fillColor.replace("#","");
    const fr = parseInt(hex.slice(0,2),16), fg = parseInt(hex.slice(2,4),16), fb = parseInt(hex.slice(4,6),16);
    if (tr===fr && tg===fg && tb===fb) return;
    const queue: number[] = [idx];
    const visited = new Uint8Array(d.length / 4);
    while (queue.length) {
      const i = queue.pop()!; const pi = i / 4;
      if (visited[pi]) continue; visited[pi] = 1;
      if (Math.abs(d[i]-tr)>40||Math.abs(d[i+1]-tg)>40||Math.abs(d[i+2]-tb)>40) continue;
      d[i]=fr; d[i+1]=fg; d[i+2]=fb; d[i+3]=255;
      const cx2 = pi % c.width, cy2 = Math.floor(pi / c.width);
      if (cx2>0) queue.push(i-4); if (cx2<c.width-1) queue.push(i+4);
      if (cy2>0) queue.push(i-c.width*4); if (cy2<c.height-1) queue.push(i+c.width*4);
    }
    ctx.putImageData(img, 0, 0);
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const pos = getPos(e);
    if (tool === "stamp") {
      saveHistory();
      ctx.font = `${size * 3 + 20}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(stamp, pos.x, pos.y);
      playSwap();
      return;
    }
    if (tool === "fill") { floodFill(pos.x, pos.y, color); playSwap(); return; }
    saveHistory();
    setDrawing(true);
    lastPos.current = pos;
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return;
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const pos = getPos(e);
    if (tool === "eraser") {
      ctx.fillStyle = "#fef9f0";
      ctx.beginPath(); ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2); ctx.fill();
    } else if (tool === "pen" && lastPos.current) {
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    }
    lastPos.current = pos;
  }

  function loadColoring(idx: number) {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    saveHistory();
    setColoringIdx(idx);
    ctx.fillStyle = "#fef9f0"; ctx.fillRect(0, 0, c.width, c.height);
    COLORING_PAGES[idx].draw(ctx);
    playClick();
  }

  function clearCanvas() {
    saveHistory(); initCanvas(); setColoringIdx(-1);
    playClick();
  }

  function saveCanvas() {
    const c = canvasRef.current!;
    const link = document.createElement("a");
    link.download = "desenul-meu.png"; link.href = c.toDataURL(); link.click();
    playCelebrate();
  }

  return (
    <div className="flex flex-col items-center gap-3 p-3 select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap justify-center bg-card rounded-2xl p-2.5 border border-border shadow w-full max-w-2xl">
        {/* Tools */}
        <div className="flex gap-1 border-r border-border pr-2">
          {([["pen","✏️","Creion"],["eraser","🧹","Radieră"],["fill","🪣","Umple"],["stamp","🌸","Ștampilă"]] as [Tool,string,string][]).map(([t,ic,lbl]) => (
            <button key={t} onClick={() => { playClick(); setTool(t); }} title={lbl}
              className={`w-9 h-9 rounded-xl text-base transition-all ${tool === t ? "bg-primary text-white shadow" : "bg-muted hover:bg-muted/70"}`}>
              {ic}
            </button>
          ))}
        </div>
        {/* Colors */}
        <div className="flex gap-1 flex-wrap max-w-[220px] border-r border-border pr-2">
          {PALETTE.map(c => (
            <button key={c} onClick={() => { setColor(c); if (tool === "stamp" || tool === "fill") {} else setTool("pen"); }}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${color === c && tool !== "eraser" ? "border-foreground scale-125 shadow-md" : "border-white/80 shadow-sm"}`}
              style={{ background: c }} />
          ))}
        </div>
        {/* Size */}
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <span className="text-xs text-muted-foreground">📏</span>
          <input type="range" min="3" max="35" value={size} onChange={e => setSize(Number(e.target.value))} className="w-20 accent-primary" />
          <span className="text-xs text-muted-foreground w-4">{size}</span>
        </div>
        {/* Actions */}
        <div className="flex gap-1">
          <button onClick={() => { playClick(); undo(); }} title="Anul" className="px-2 py-1.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/70 transition-all">↩</button>
          <button onClick={clearCanvas} className="px-2 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all">🗑</button>
          <button onClick={saveCanvas} className="px-2 py-1.5 rounded-xl text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-all">💾</button>
        </div>
      </div>

      {/* Stamp picker */}
      {tool === "stamp" && (
        <div className="flex flex-col gap-2 items-center bg-card rounded-2xl p-2 border border-border w-full max-w-2xl">
          <div className="flex gap-2">
            {Object.keys(STAMP_SETS).map(s => (
              <button key={s} onClick={() => setStampSet(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${stampSet === s ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap justify-center">
            {STAMP_SETS[stampSet as keyof typeof STAMP_SETS].map(s => (
              <button key={s} onClick={() => { playClick(); setStamp(s); }}
                className={`w-9 h-9 rounded-xl text-xl transition-all ${stamp === s ? "bg-primary/20 border-2 border-primary scale-110" : "hover:bg-muted"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coloring pages */}
      <div className="flex gap-2 flex-wrap justify-center">
        <span className="text-xs text-muted-foreground self-center">🖼 Colorează:</span>
        {COLORING_PAGES.map((p, i) => (
          <button key={i} onClick={() => loadColoring(i)}
            className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${coloringIdx === i ? "bg-secondary text-secondary-foreground border-secondary" : "bg-white border-border hover:border-secondary/50"}`}>
            {p.name}
          </button>
        ))}
        <button onClick={() => { clearCanvas(); setColoringIdx(-1); }}
          className="px-3 py-1 rounded-full text-xs font-bold border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50">
          ✨ Liber
        </button>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={600} height={420}
        className="rounded-3xl border-2 border-border shadow-xl w-full touch-none"
        style={{ maxHeight: "420px", cursor: tool === "fill" ? "crosshair" : tool === "eraser" ? "cell" : "default" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => { setDrawing(false); lastPos.current = null; }}
        onMouseLeave={() => { setDrawing(false); lastPos.current = null; }}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={() => { setDrawing(false); lastPos.current = null; }} />
    </div>
  );
}
