import { useState, useRef } from "react";
import { playWrong, playCelebrate } from "@/lib/sfx";

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

const OCTAVES = [
  { label: "Octava 4", base: 261.63, mult: 1 },
  { label: "Octava 5", base: 523.25, mult: 2 },
];

const NOTE_RATIOS = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2];
const NOTE_LABELS = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do′"];
const NOTE_COLORS = [
  { bg: "bg-red-200 hover:bg-red-300 border-red-400", active: "bg-red-500", text: "text-red-800" },
  { bg: "bg-orange-200 hover:bg-orange-300 border-orange-400", active: "bg-orange-500", text: "text-orange-800" },
  { bg: "bg-yellow-200 hover:bg-yellow-300 border-yellow-400", active: "bg-yellow-500", text: "text-yellow-800" },
  { bg: "bg-lime-200 hover:bg-lime-300 border-lime-400", active: "bg-lime-500", text: "text-lime-800" },
  { bg: "bg-green-200 hover:bg-green-300 border-green-400", active: "bg-green-500", text: "text-green-800" },
  { bg: "bg-cyan-200 hover:bg-cyan-300 border-cyan-400", active: "bg-cyan-500", text: "text-cyan-800" },
  { bg: "bg-blue-200 hover:bg-blue-300 border-blue-400", active: "bg-blue-500", text: "text-blue-800" },
  { bg: "bg-violet-200 hover:bg-violet-300 border-violet-400", active: "bg-violet-500", text: "text-violet-800" },
];

const MELODIES: { name: string; notes: number[]; tempo: number }[] = [
  { name: "🐑 Baba Oarba", notes: [0,0,4,4,5,5,4,3,3,2,2,1,1,0], tempo: 400 },
  { name: "🎄 Moș Crăciun", notes: [0,0,0,4,4,4,0,4,5,3,0,0,0], tempo: 380 },
  { name: "🌟 Licurici", notes: [0,0,4,4,5,5,4,3,3,2,2,1,1,0,4,4,3,3,2,2,1], tempo: 360 },
  { name: "🐢 Scara ușoară", notes: [0,1,2,3,4,5,6,7,7,6,5,4,3,2,1,0], tempo: 350 },
  { name: "🎵 Gamă rapidă", notes: [0,1,2,3,4,5,6,7], tempo: 180 },
];

/** Echo-game playback speed — seconds between notes. Slower = easier to
 *  memorize; Rapid is a genuine challenge for older kids. */
const ECHO_SPEEDS = [
  { id: "lent",   label: "🐢 Lent",   gap: 0.95 },
  { id: "normal", label: "🚶 Normal", gap: 0.65 },
  { id: "rapid",  label: "🐇 Rapid",  gap: 0.42 },
];

const RHYTHMS: { name: string; pattern: boolean[]; bpm: number }[] = [
  { name: "Simplu", pattern: [true,false,true,false,true,false,true,false], bpm: 80 },
  { name: "Vals", pattern: [true,false,false,true,false,false,true,false,false], bpm: 100 },
  { name: "Rapid", pattern: [true,true,false,true,true,false,true,false], bpm: 120 },
];

type GMode = "liber" | "joc";

export default function GameMuzica() {
  const [gmode, setGmode] = useState<GMode>("liber");
  const [active, setActive] = useState<Set<number>>(new Set());
  const [octave, setOctave] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [rhythmActive, setRhythmActive] = useState<number | null>(null);
  const [rhythmBeat, setRhythmBeat] = useState<boolean>(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const rhythmRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Echo challenge ("Repetă melodia") — listen to a growing note sequence, then play it back.
  const [echoSeq, setEchoSeq] = useState<number[]>([]);
  const [echoStep, setEchoStep] = useState(0);
  const [echoLevel, setEchoLevel] = useState(2);
  const [echoPlaying, setEchoPlaying] = useState(false);
  const [echoLives, setEchoLives] = useState(3);
  const [echoBest, setEchoBest] = useState(0);
  const [echoCelebrate, setEchoCelebrate] = useState(false);
  const [echoFail, setEchoFail] = useState(false);
  const [echoSpeedId, setEchoSpeedId] = useState("normal");
  const echoGap = ECHO_SPEEDS.find(s => s.id === echoSpeedId)!.gap;

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }

  function playNote(noteIdx: number, when = 0, duration = 0.6) {
    const ctx = getCtx();
    const freq = OCTAVES[octave].base * NOTE_RATIOS[noteIdx];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime + when;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now); osc.stop(now + duration + 0.1);
    // Highlight the key in sync with when it actually sounds (works for live taps and scheduled playback alike).
    setTimeout(() => {
      setActive(p => new Set([...p, noteIdx]));
      setTimeout(() => setActive(p => { const n = new Set(p); n.delete(noteIdx); return n; }), 250);
    }, when * 1000);
    if (when === 0) {
      setHistory(h => [...h.slice(-16), noteIdx]);
    }
  }

  function playDrum(type: "kick" | "snare" | "hihat" | "cowbell") {
    const ctx = getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++) {
      const t = i / ctx.sampleRate;
      if (type === "kick") d[i] = Math.sin(2 * Math.PI * 60 * Math.exp(-t * 30)) * Math.exp(-t * 15);
      else if (type === "snare") d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.7;
      else if (type === "hihat") d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 50) * 0.3;
      else d[i] = Math.sin(2 * Math.PI * 560 * t) * Math.exp(-t * 25) * 0.6;
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain(); gain.gain.value = 0.5;
    src.buffer = buf; src.connect(gain); gain.connect(ctx.destination); src.start();
  }

  async function playMelody(mel: typeof MELODIES[0]) {
    if (playing) return;
    setPlaying(true);
    mel.notes.forEach((n, i) => playNote(n, i * (mel.tempo / 1000), 0.5));
    setTimeout(() => setPlaying(false), mel.notes.length * mel.tempo + 300);
  }

  function toggleRhythm(idx: number) {
    if (rhythmRef.current) { clearInterval(rhythmRef.current); rhythmRef.current = null; setRhythmActive(null); setRhythmBeat(false); if (rhythmActive === idx) return; }
    const rhythm = RHYTHMS[idx];
    let beat = 0;
    setRhythmActive(idx);
    const interval = Math.round(60000 / rhythm.bpm);
    rhythmRef.current = setInterval(() => {
      if (rhythm.pattern[beat % rhythm.pattern.length]) {
        playDrum("kick");
        setRhythmBeat(true);
        setTimeout(() => setRhythmBeat(false), 100);
      }
      beat++;
    }, interval);
  }

  function playSequence(seq: number[], gap = echoGap) {
    setEchoPlaying(true);
    seq.forEach((n, i) => playNote(n, i * gap, Math.min(0.5, gap * 0.8)));
    setTimeout(() => setEchoPlaying(false), seq.length * gap * 1000 + 250);
  }

  function startEcho(level: number) {
    const seq = Array.from({ length: level }, () => Math.floor(Math.random() * 8));
    setEchoSeq(seq);
    setEchoStep(0);
    setTimeout(() => playSequence(seq), 400);
  }

  function resetEcho() {
    setEchoLevel(2);
    setEchoLives(3);
    startEcho(2);
  }

  function handleEchoInput(i: number) {
    if (echoPlaying || echoSeq.length === 0) return;
    if (i === echoSeq[echoStep]) {
      const nextStep = echoStep + 1;
      setEchoStep(nextStep);
      if (nextStep === echoSeq.length) {
        playCelebrate();
        setEchoCelebrate(true);
        setEchoBest(b => Math.max(b, echoLevel));
        setTimeout(() => {
          setEchoCelebrate(false);
          const nl = Math.min(echoLevel + 1, 9);
          setEchoLevel(nl);
          startEcho(nl);
        }, 1300);
      }
    } else {
      playWrong();
      setEchoFail(true);
      setEchoLives(lv => {
        const next = lv - 1;
        setTimeout(() => {
          setEchoFail(false);
          if (next <= 0) resetEcho();
          else { setEchoStep(0); playSequence(echoSeq); }
        }, 900);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 select-none">
      {echoCelebrate && <Confetti />}

      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([["liber","🎹","Cântă liber"],["joc","🎧","Repetă melodia"]] as [GMode,string,string][]).map(([m,ic,lbl]) => (
          <button key={m} onClick={() => { setGmode(m); if (m === "joc" && echoSeq.length === 0) resetEcho(); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 flex items-center gap-1.5
              ${gmode === m ? "bg-primary text-white border-primary shadow-md" : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
            <span>{ic}</span>{lbl}
          </button>
        ))}
      </div>

      {/* ── ECHO CHALLENGE ── */}
      {gmode === "joc" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xl">
          {/* Speed difficulty */}
          <div className="flex gap-2">
            {ECHO_SPEEDS.map(s => (
              <button key={s.id} onClick={() => setEchoSpeedId(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${echoSpeedId === s.id ? "bg-secondary text-secondary-foreground shadow" : "bg-muted text-muted-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-xl ${i < echoLives ? "opacity-100" : "opacity-20"}`}>❤️</span>
              ))}
            </div>
            <span className="text-sm font-bold text-primary">🎯 Nivel {echoLevel - 1}</span>
            {echoBest > 0 && <span className="text-xs font-bold text-muted-foreground">🏆 {echoBest - 1}</span>}
          </div>

          <div className="flex gap-1.5 justify-center">
            {echoSeq.map((_, i) => (
              <span key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300
                ${i < echoStep ? "bg-green-400 border-green-500 scale-110" : "bg-muted border-muted-foreground/30"}`} />
            ))}
          </div>

          {echoCelebrate ? (
            <div className="flex flex-col items-center gap-2 py-2 animate-in zoom-in">
              <div className="text-6xl animate-bounce">🌟</div>
              <div className="text-xl font-bold text-green-600">Perfect! Următorul e mai lung!</div>
            </div>
          ) : echoFail ? (
            <div className="text-xl font-bold text-red-500 animate-bounce">❌ Nu era nota aia — ascultă din nou!</div>
          ) : (
            <p className="text-sm text-muted-foreground font-medium">
              {echoPlaying ? "👂 Ascultă cu atenție..." : "🎵 Acum cântă tu melodia, în ordine!"}
            </p>
          )}

          <button onClick={() => !echoPlaying && playSequence(echoSeq)} disabled={echoPlaying}
            className="text-xs text-muted-foreground underline hover:text-primary disabled:opacity-40">
            🔁 Ascultă din nou
          </button>
        </div>
      )}

      {/* Octave & history */}
      <div className="flex items-center justify-between w-full max-w-xl">
        <div className="flex gap-2">
          {OCTAVES.map((o, i) => (
            <button key={i} onClick={() => setOctave(i)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border-2 ${octave === i ? "bg-primary text-white border-primary shadow" : "bg-white border-border text-muted-foreground"}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5 text-lg">
          {history.slice(-12).map((n, i) => (
            <span key={i} className="transition-all" style={{ opacity: 0.4 + 0.6 * (i / 12) }}>
              <span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${NOTE_COLORS[n].bg}`}>
                {NOTE_LABELS[n][0]}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Piano keys */}
      <div className="flex gap-1.5 bg-card rounded-3xl p-4 border-2 border-border shadow-inner w-full max-w-xl justify-center">
        {NOTE_LABELS.map((label, i) => (
          <button key={i}
            onMouseDown={() => { playNote(i); if (gmode === "joc") handleEchoInput(i); }}
            onTouchStart={(e) => { e.preventDefault(); playNote(i); if (gmode === "joc") handleEchoInput(i); }}
            disabled={gmode === "joc" && echoPlaying}
            className={`flex-1 rounded-2xl border-2 flex flex-col items-end pb-3 pr-1 gap-1 font-bold text-xs transition-all duration-100 cursor-pointer
              ${active.has(i) ? `${NOTE_COLORS[i].active} text-white scale-95 shadow-inner` : `${NOTE_COLORS[i].bg} ${NOTE_COLORS[i].text} shadow-md hover:scale-105 hover:shadow-lg`}
              ${gmode === "joc" && echoPlaying ? "opacity-60 cursor-not-allowed" : ""}
            `}
            style={{ height: "120px" }}>
            <span className="self-center mt-2 text-base">
              {["🔴","🟠","🟡","🟢","🩵","🔵","🟣","🩷"][i]}
            </span>
            <span className="self-center">{label}</span>
          </button>
        ))}
      </div>

      {gmode === "liber" && (
      <>
      {/* Drums */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
        {(["kick","snare","hihat","cowbell"] as const).map((type, i) => (
          <button key={type}
            onMouseDown={() => playDrum(type)}
            onTouchStart={(e) => { e.preventDefault(); playDrum(type); }}
            className="aspect-square rounded-2xl border-2 border-border bg-stone-100 hover:bg-stone-200 flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all active:scale-95 shadow-md cursor-pointer">
            <span className="text-2xl">{["🥁","👏","🎵","🔔"][i]}</span>
            <span className="capitalize text-stone-700">{["Tobă","Palmă","Hi-hat","Clopoțel"][i]}</span>
          </button>
        ))}
      </div>

      {/* Melodies */}
      <div className="w-full max-w-xl">
        <p className="text-xs font-bold text-muted-foreground text-center mb-2">🎼 Cântă o melodie automată</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {MELODIES.map(m => (
            <button key={m.name} onClick={() => playMelody(m)}
              disabled={playing}
              className="px-4 py-2 rounded-full text-sm font-bold border-2 border-secondary/40 bg-secondary/10 text-secondary-foreground transition-all hover:bg-secondary/20 hover:scale-105 disabled:opacity-50">
              {playing ? "⏸" : "▶"} {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rhythm */}
      <div className="w-full max-w-xl">
        <p className="text-xs font-bold text-muted-foreground text-center mb-2">🥁 Ritmuri automate</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {RHYTHMS.map((r, i) => (
            <button key={r.name} onClick={() => toggleRhythm(i)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all hover:scale-105
                ${rhythmActive === i ? "bg-primary text-white border-primary shadow animate-pulse" : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"}
                ${rhythmActive === i && rhythmBeat ? "scale-110" : ""}
              `}>
              {rhythmActive === i ? "⏹ Stop" : "▶"} {r.name} ({r.bpm} BPM)
            </button>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
