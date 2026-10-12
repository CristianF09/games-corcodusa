/**
 * Logica jocului „Pregătire Preșcolari" (pre-K). Pur, fără React — testabil.
 *
 * Fiecare rundă e generată exact: răspunsul se deduce din datele rundei
 * (max/min, n±1, poziția ordinală, elementul din șablon), nu dintr-o
 * euristică. Spațiile de exerciții folosesc `DeckMap`, deci nicio valoare
 * nu se repetă până nu au fost toate folosite.
 */
import { DeckMap, shuffle } from "./exercise-deck";

export type PreKMode = "mare" | "mic" | "urmator" | "inainte" | "ordinal" | "modele";
export type PatternKind = "AB" | "AAB" | "ABC";

export interface PreKLevel {
  id: number;
  label: string;
  max?: number;            // limita superioară a numerelor (modurile numerice)
  pattern?: PatternKind;   // tipul șablonului (modul „modele")
}

export interface PreKRound {
  question: string;
  visual: string[];        // emoji-uri afișate (șir ordinal sau șablon); [] pentru numere
  blankIndex?: number;     // în șablon: poziția care se completează
  highlightIndex?: number; // în șir ordinal: poziția cerută în întrebare (0-based)
  answer: string;
  options: string[];       // include întotdeauna `answer`, fără duplicate
}

const NUM_LEVELS: PreKLevel[] = [
  { id: 1, label: "1–5",  max: 5  },
  { id: 2, label: "1–10", max: 10 },
];

const PATTERN_LEVELS: PreKLevel[] = [
  { id: 1, label: "A B A B",     pattern: "AB"  },
  { id: 2, label: "A A B A A B", pattern: "AAB" },
  { id: 3, label: "A B C A B C", pattern: "ABC" },
];

export const PREK_MODES: { id: PreKMode; label: string; levels: PreKLevel[] }[] = [
  { id: "mare",    label: "Cel mai mare",   levels: NUM_LEVELS },
  { id: "mic",     label: "Cel mai mic",    levels: NUM_LEVELS },
  { id: "urmator", label: "Ce vine după?",  levels: NUM_LEVELS },
  { id: "inainte", label: "Ce vine înainte?", levels: NUM_LEVELS },
  { id: "ordinal", label: "Al câtelea?",    levels: NUM_LEVELS },
  { id: "modele",  label: "Modele",         levels: PATTERN_LEVELS },
];

/** Forme ordinale pentru pozițiile 1–10. */
export const ORDINALS = [
  "primul", "al doilea", "al treilea", "al patrulea", "al cincilea",
  "al șaselea", "al șaptelea", "al optulea", "al nouălea", "al zecelea",
];

/** 10 emoji-uri distincte pentru șirul ordinal. */
export const EMOJI_ROW = ["🐶", "🐱", "🐸", "🐰", "🦊", "🐻", "🐼", "🦁", "🐵", "🐷"];

/** 8 simboluri distincte pentru șabloane. */
export const PATTERN_ITEMS = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "🔺", "⭐"];

export const PATTERN_LENGTH = 6;

export function levelsOf(mode: PreKMode): PreKLevel[] {
  return PREK_MODES.find(m => m.id === mode)!.levels;
}

function levelOf(mode: PreKMode, levelId: number): PreKLevel {
  const levels = levelsOf(mode);
  return levels.find(l => l.id === levelId) ?? levels[0];
}

function range(lo: number, hi: number): number[] {
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

/** Răspunsul corect + (n-1) distractori distincți, în ordine amestecată. */
function pickOptions<T>(answer: T, pool: T[], n = 4): T[] {
  const distractors = shuffle(pool.filter(x => x !== answer)).slice(0, n - 1);
  return shuffle([answer, ...distractors]);
}

/**
 * Spațiile de poziții pentru modurile secvențiale. Cheia e „mod:max".
 *  - urmator: n ∈ [1, max−1], răspuns n+1 (≤ max)
 *  - inainte: n ∈ [2, max],   răspuns n−1 (≥ 1)
 *  - ordinal: p ∈ [1, max],   răspuns = elementul de pe poziția p
 */
const POS_DECKS = new DeckMap<number>(key => {
  const [mode, max] = key.split(":");
  const N = Number(max);
  if (mode === "urmator") return range(1, N - 1);
  if (mode === "inainte") return range(2, N);
  return range(1, N);
});

function compareRound(mode: "mare" | "mic", max: number): PreKRound {
  const trio = shuffle(range(1, max)).slice(0, 3);
  const answer = mode === "mare" ? Math.max(...trio) : Math.min(...trio);
  return {
    question: `Care este cel ${mode === "mare" ? "mai mare" : "mai mic"} dintre cele trei numere?`,
    visual: [],
    answer: String(answer),
    options: shuffle(trio).map(String),
  };
}

function sequentialRound(mode: "urmator" | "inainte", max: number): PreKRound {
  const n = POS_DECKS.next(`${mode}:${max}`);
  const answer = mode === "urmator" ? n + 1 : n - 1;
  return {
    question: mode === "urmator"
      ? `Ce număr vine după ${n}?`
      : `Ce număr vine înainte de ${n}?`,
    visual: [],
    answer: String(answer),
    options: pickOptions(String(answer), range(1, max).map(String)),
  };
}

function ordinalRound(max: number): PreKRound {
  const p = POS_DECKS.next(`ordinal:${max}`);
  const row = shuffle(EMOJI_ROW).slice(0, max);
  const answer = row[p - 1];
  return {
    question: `Care este ${ORDINALS[p - 1]} din șir?`,
    visual: row,
    highlightIndex: p - 1,
    answer,
    options: pickOptions(answer, row),
  };
}

/** Unitatea de repetat, ca indici în PATTERN_ITEMS. */
function buildUnit(kind: PatternKind): number[] {
  const [a, b, c] = shuffle(range(0, PATTERN_ITEMS.length - 1));
  if (kind === "AB") return [a, b];
  if (kind === "AAB") return [a, a, b];
  return [a, b, c];
}

function patternRound(kind: PatternKind): PreKRound {
  const unit = buildUnit(kind);
  const seq = Array.from({ length: PATTERN_LENGTH }, (_, i) => unit[i % unit.length]);
  const blankIndex = Math.floor(Math.random() * PATTERN_LENGTH);
  const answer = PATTERN_ITEMS[seq[blankIndex]];
  return {
    question: "Ce urmează în locul semnului „?”?",
    visual: seq.map(i => PATTERN_ITEMS[i]),
    blankIndex,
    answer,
    options: pickOptions(answer, PATTERN_ITEMS),
  };
}

export function generateRound(mode: PreKMode, levelId: number): PreKRound {
  const level = levelOf(mode, levelId);
  switch (mode) {
    case "mare":
    case "mic":
      return compareRound(mode, level.max!);
    case "urmator":
    case "inainte":
      return sequentialRound(mode, level.max!);
    case "ordinal":
      return ordinalRound(level.max!);
    case "modele":
      return patternRound(level.pattern!);
  }
}

/** Verifică, pentru un răspuns dat, dacă e corect. */
export function isCorrect(round: PreKRound, choice: string): boolean {
  return choice === round.answer;
}
