// Centralized per-category visual identity (emoji + gradient) so the games
// hub, game cards, and the in-game header all share the same vivid, playful
// color-coding instead of a flat/neutral look.

export const CATEGORY_EMOJIS: Record<string, string> = {
  matematica: "🔢",
  litere: "🔤",
  culori: "🎨",
  natura: "🌿",
  muzica: "🎵",
  memorie: "🧠",
  creativitate: "✏️",
  logica: "🧩",
  labirint: "🌀",
  cuvinte: "🔍",
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  matematica: "from-orange-400 to-red-400",
  litere: "from-blue-400 to-indigo-500",
  culori: "from-pink-400 to-purple-500",
  natura: "from-green-400 to-emerald-500",
  muzica: "from-violet-400 to-fuchsia-500",
  memorie: "from-cyan-400 to-blue-500",
  creativitate: "from-yellow-400 to-orange-500",
  logica: "from-teal-400 to-cyan-500",
  labirint: "from-purple-500 to-violet-500",
  cuvinte: "from-rose-400 to-pink-500",
};

export const DEFAULT_GRADIENT = "from-primary to-secondary";

export function categoryEmoji(category: string | undefined): string {
  return (category && CATEGORY_EMOJIS[category]) || "🎮";
}

export function categoryGradient(category: string | undefined): string {
  return (category && CATEGORY_GRADIENTS[category]) || DEFAULT_GRADIENT;
}
