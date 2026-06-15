import { useState, useRef, useCallback } from "react";

const NOTES = [
  { label: "Do", freq: 261.63, color: "bg-red-100 hover:bg-red-200 border-red-300", activeColor: "bg-red-400", emoji: "🔴" },
  { label: "Re", freq: 293.66, color: "bg-orange-100 hover:bg-orange-200 border-orange-300", activeColor: "bg-orange-400", emoji: "🟠" },
  { label: "Mi", freq: 329.63, color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300", activeColor: "bg-yellow-400", emoji: "🟡" },
  { label: "Fa", freq: 349.23, color: "bg-green-100 hover:bg-green-200 border-green-300", activeColor: "bg-green-400", emoji: "🟢" },
  { label: "Sol", freq: 392.00, color: "bg-teal-100 hover:bg-teal-200 border-teal-300", activeColor: "bg-teal-400", emoji: "🩵" },
  { label: "La", freq: 440.00, color: "bg-blue-100 hover:bg-blue-200 border-blue-300", activeColor: "bg-blue-400", emoji: "🔵" },
  { label: "Si", freq: 493.88, color: "bg-violet-100 hover:bg-violet-200 border-violet-300", activeColor: "bg-violet-400", emoji: "🟣" },
  { label: "Do′", freq: 523.25, color: "bg-pink-100 hover:bg-pink-200 border-pink-300", activeColor: "bg-pink-400", emoji: "🩷" },
];

const DRUMS = [
  { label: "Tobă", type: "kick", color: "bg-stone-200 hover:bg-stone-300 border-stone-400", emoji: "🥁" },
  { label: "Hi-Hat", type: "hihat", color: "bg-zinc-200 hover:bg-zinc-300 border-zinc-400", emoji: "🎵" },
  { label: "Clap", type: "snare", color: "bg-slate-200 hover:bg-slate-300 border-slate-400", emoji: "👏" },
  { label: "Cowbell", type: "cowbell", color: "bg-yellow-200 hover:bg-yellow-300 border-yellow-400", emoji: "🔔" },
];

const MELODIES: { name: string; notes: number[] }[] = [
  { name: "Balonul Meu", notes: [0,0,4,4,5,5,4] },
  { name: "Steluță", notes: [0,0,4,4,5,4,3,3,2,2,1,1,0] },
  { name: "Scara", notes: [0,1,2,3,4,5,6,7] },
];

export default function GameMuzica() {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [instrument, setInstrument] = useState<"piano"|"xylophone">("piano");
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }

  function playNote(freq: number, idx: number, when = 0) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = instrument === "piano" ? "triangle" : "square";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
    gain.gain.setValueAtTime(0.4, ctx.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + (instrument === "piano" ? 1.2 : 0.4));
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + 1.5);

    if (when === 0) {
      setActiveKeys(prev => new Set([...prev, idx]));
      setTimeout(() => setActiveKeys(prev => { const n = new Set(prev); n.delete(idx); return n; }), 300);
      setHistory(h => [...h.slice(-15), NOTES[idx].emoji]);
    }
  }

  function playDrum(type: string) {
    const ctx = getCtx();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      const t = i / ctx.sampleRate;
      if (type === "kick") data[i] = Math.sin(2 * Math.PI * 60 * Math.exp(-t * 30)) * Math.exp(-t * 15);
      else if (type === "hihat") data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40);
      else if (type === "snare") data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.6;
      else data[i] = Math.sin(2 * Math.PI * 560 * t) * Math.exp(-t * 25);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buffer;
    gain.gain.value = 0.5;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    setHistory(h => [...h.slice(-15), "🥁"]);
  }

  async function playMelody(notes: number[]) {
    if (playing) return;
    setPlaying(true);
    const spacing = 0.35;
    notes.forEach((ni, i) => playNote(NOTES[ni].freq, ni, i * spacing));
    setTimeout(() => setPlaying(false), notes.length * spacing * 1000 + 500);
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {/* Instrument toggle */}
      <div className="flex gap-3 items-center justify-between w-full max-w-lg">
        <div className="flex gap-2">
          <button onClick={() => setInstrument("piano")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${instrument === "piano" ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
            🎹 Pian
          </button>
          <button onClick={() => setInstrument("xylophone")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${instrument === "xylophone" ? "bg-primary text-white shadow" : "bg-muted text-muted-foreground"}`}>
            🎸 Xilofon
          </button>
        </div>
        <div className="text-lg tracking-wide min-w-[120px] text-right">{history.join(" ")}</div>
      </div>

      {/* Piano keys */}
      <div className="flex gap-2 justify-center bg-card rounded-3xl p-5 border-2 border-border shadow-inner w-full max-w-lg">
        {NOTES.map((note, i) => (
          <button key={i}
            onMouseDown={() => playNote(note.freq, i)}
            onTouchStart={(e) => { e.preventDefault(); playNote(note.freq, i); }}
            className={`flex-1 aspect-[2/5] rounded-2xl border-2 flex flex-col items-center justify-end pb-2 gap-1 font-bold text-xs transition-all duration-100 cursor-pointer
              ${activeKeys.has(i) ? `${note.activeColor} text-white scale-95 shadow-inner` : `${note.color} shadow-md hover:scale-105 hover:shadow-lg`}
            `}>
            <span className="text-base">{note.emoji}</span>
            <span>{note.label}</span>
          </button>
        ))}
      </div>

      {/* Drums */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
        {DRUMS.map(d => (
          <button key={d.type}
            onMouseDown={() => playDrum(d.type)}
            onTouchStart={(e) => { e.preventDefault(); playDrum(d.type); }}
            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 font-bold text-sm transition-all duration-100 cursor-pointer ${d.color} hover:scale-105 active:scale-95 shadow-md`}>
            <span className="text-2xl">{d.emoji}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      {/* Melodies */}
      <div className="flex flex-col gap-2 w-full max-w-lg">
        <p className="text-sm font-bold text-muted-foreground text-center">🎼 Cântă o melodie!</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {MELODIES.map(m => (
            <button key={m.name} onClick={() => playMelody(m.notes)}
              disabled={playing}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 border-secondary/40 bg-secondary/10 text-secondary-foreground transition-all hover:bg-secondary/20 hover:scale-105 disabled:opacity-50`}>
              ▶ {m.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
