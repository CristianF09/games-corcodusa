/**
 * Gramatică minimă pentru textele jocurilor: substantive cu forma de singular
 * și plural, genul lor și numeralele corecte („un balon", „două mere",
 * „doi câini", „trei baloane"). Ca un text să fie corect gramatical, orice
 * obiect numărat trebuie să vină de aici.
 */

/** Genul pentru numeralele din plural: m = „doi", f = „două". */
type PluralGender = "m" | "f";
/** Genul substantivului la singular: determină „un" / „o" la numărul 1. */
type Gender = "m" | "f" | "n";

export interface Noun {
  emoji: string;
  sg: string;
  pl: string;
  gender: Gender;
  plGender: PluralGender;
}

export const NOUNS = {
  balon:    { emoji: "🎈", sg: "balon",    pl: "baloane", gender: "n", plGender: "f" },
  mar:      { emoji: "🍎", sg: "măr",      pl: "mere",    gender: "m", plGender: "f" },
  floare:   { emoji: "🌻", sg: "floare",   pl: "flori",   gender: "f", plGender: "f" },
  stea:     { emoji: "⭐", sg: "stea",     pl: "stele",   gender: "f", plGender: "f" },
  pui:      { emoji: "🐥", sg: "pui",      pl: "pui",     gender: "m", plGender: "m" },
  fluture:  { emoji: "🦋", sg: "fluture",  pl: "fluturi", gender: "m", plGender: "m" },
  gogoasa:  { emoji: "🍩", sg: "gogoașă",  pl: "gogoși",  gender: "f", plGender: "f" },
  acadea:   { emoji: "🍭", sg: "acadea",   pl: "acadele", gender: "f", plGender: "f" },
  cadou:    { emoji: "🎁", sg: "cadou",    pl: "cadouri", gender: "n", plGender: "f" },
  minge:    { emoji: "⚽", sg: "minge",    pl: "mingi",   gender: "f", plGender: "f" },
  racheta:  { emoji: "🚀", sg: "rachetă",  pl: "rachete", gender: "f", plGender: "f" },
  peste:    { emoji: "🐟", sg: "pește",    pl: "pești",   gender: "m", plGender: "m" },
  caine:    { emoji: "🐶", sg: "câine",    pl: "câini",   gender: "m", plGender: "m" },
  pisica:   { emoji: "🐱", sg: "pisică",   pl: "pisici",  gender: "f", plGender: "f" },
  iepure:   { emoji: "🐰", sg: "iepure",   pl: "iepuri",  gender: "m", plGender: "m" },
  elefant:  { emoji: "🐘", sg: "elefant",  pl: "elefanți", gender: "m", plGender: "m" },
  pinguin:  { emoji: "🐧", sg: "pinguin",  pl: "pinguini", gender: "m", plGender: "m" },
  delfin:   { emoji: "🐬", sg: "delfin",   pl: "delfini", gender: "m", plGender: "m" },
  vulpe:    { emoji: "🦊", sg: "vulpe",    pl: "vulpi",   gender: "f", plGender: "f" },
  bufnita:  { emoji: "🦉", sg: "bufniță",  pl: "bufnițe", gender: "f", plGender: "f" },
  rata:     { emoji: "🦆", sg: "rață",     pl: "rațe",    gender: "f", plGender: "f" },
  vaca:     { emoji: "🐄", sg: "vacă",     pl: "vaci",    gender: "f", plGender: "f" },
  furnica:  { emoji: "🐜", sg: "furnică",  pl: "furnici", gender: "f", plGender: "f" },
  carte:    { emoji: "📚", sg: "carte",    pl: "cărți",   gender: "f", plGender: "f" },
  creion:   { emoji: "✏️", sg: "creion",   pl: "creioane", gender: "n", plGender: "f" },
  banana:   { emoji: "🍌", sg: "banană",   pl: "banane",  gender: "f", plGender: "f" },
  portocala:{ emoji: "🍊", sg: "portocală", pl: "portocale", gender: "f", plGender: "f" },
  para:     { emoji: "🍐", sg: "pară",     pl: "pere",    gender: "f", plGender: "f" },
  ciuperca: { emoji: "🍄", sg: "ciupercă", pl: "ciuperci", gender: "f", plGender: "f" },
} as const satisfies Record<string, Noun>;

export type NounKey = keyof typeof NOUNS;

const UNITS = [
  "zero", "unu", "doi", "trei", "patru", "cinci", "șase", "șapte", "opt", "nouă", "zece",
  "unsprezece", "doisprezece", "treisprezece", "paisprezece", "cincisprezece",
  "șaisprezece", "șaptesprezece", "optsprezece", "nouăsprezece", "douăzeci",
];

/** Numeralul scris cu litere, la genul cerut. Acceptă 0–20. */
export function numWord(n: number, gender: PluralGender = "m"): string {
  if (n < 0 || n > 20) throw new Error(`numWord: ${n} în afara intervalului 0–20`);
  if (n === 2 && gender === "f") return "două";
  return UNITS[n];
}

/** „un balon", „o floare", „două mere", „trei baloane". */
export function countPhrase(n: number, key: NounKey): string {
  const noun: Noun = NOUNS[key];
  if (n === 1) {
    return `${noun.gender === "f" ? "o" : "un"} ${noun.sg}`;
  }
  // De la 20 în sus, română cere „de": „douăzeci de mere", „30 de mere".
  if (n >= 20) {
    const num = n === 20 ? numWord(20) : String(n);
    return `${num} de ${noun.pl}`;
  }
  return `${numWord(n, noun.plGender)} ${noun.pl}`;
}

/** „este" pentru un obiect, „sunt" pentru mai multe. */
export function isAre(n: number): "este" | "sunt" {
  return n === 1 ? "este" : "sunt";
}

/** „Câte" / „Câți" / „Câtă": pentru întrebări despre un substantiv. */
export function howMany(key: NounKey): string {
  const g = NOUNS[key].plGender;
  return g === "f" ? "Câte" : "Câți";
}

/** Un obiect din setul de substantive, ales aleator, ca să nu se repete mereu. */
export function pickNoun(exclude?: NounKey): NounKey {
  const keys = (Object.keys(NOUNS) as NounKey[]).filter(k => k !== exclude);
  return keys[Math.floor(Math.random() * keys.length)];
}
