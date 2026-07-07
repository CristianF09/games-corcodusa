// Per-game visual identity for the bold, flat-color "app tile" look —
// each of the 15 games gets its own vivid solid color + visual content
// (big example text like "2+3=5" or an emoji) + short tagline.
//
// Keyed by numeric game id (1-15), matching GAME_COMPONENTS in
// src/games/index.ts and the seed order in scripts/seed_games.py.
//
// `isTextVisual = true` → render `visual` as large bold text (math
// equations, letters, shapes).  false → render it as a big emoji.

export interface GameTileStyle {
  gradient: string;       // tailwind "from-x to-y" gradient classes
  label: string;          // short ALL-CAPS label shown at top of tile
  visual: string;         // fallback emoji / text if image fails
  isTextVisual: boolean;  // true = render visual as big bold text; false = emoji
  tagline: string;        // short subtitle (age / category hint)
  imagePath: string;      // static path under /games/ (served from public/)
}

export const GAME_TILE_STYLES: Record<number, GameTileStyle> = {
  // 1 → GameNumarare: counting & number recognition
  1: {
    gradient: "from-[#1565C0] to-[#1976D2]",
    label: "NUMERE",
    visual: "1 2 3",
    isTextVisual: true,
    tagline: "Numără până la 20",
    imagePath: "/games/game-matematica-1.png",
  },
  // 2 → GameAdunare: addition, subtraction, multiplication
  2: {
    gradient: "from-[#00796B] to-[#00897B]",
    label: "ADUNĂRI",
    visual: "2+3=5",
    isTextVisual: true,
    tagline: "Adunări și scăderi",
    imagePath: "/games/game-matematica-2.png",
  },
  // 3 → GameAlfabet: letters & sounds
  3: {
    gradient: "from-[#2E7D32] to-[#388E3C]",
    label: "ALFABET",
    visual: "A B C",
    isTextVisual: true,
    tagline: "Literele alfabetului",
    imagePath: "/games/game-litere-1.png",
  },
  // 4 → GameDinozauri: dinosaur exploration
  4: {
    gradient: "from-[#558B2F] to-[#689F38]",
    label: "DINOZAURI",
    visual: "🦕",
    isTextVisual: false,
    tagline: "Lumea dinozaurilor",
    imagePath: "/games/game-litere-2.png",
  },
  // 5 → GameForme: shapes + color mixing
  5: {
    gradient: "from-[#4527A0] to-[#5E35B1]",
    label: "FORME",
    visual: "◯ □ △",
    isTextVisual: true,
    tagline: "Forme și culori",
    imagePath: "/games/game-culori-1.png",
  },
  // 6 → GameAnimale: animal sounds & habitats
  6: {
    gradient: "from-[#E65100] to-[#F57F17]",
    label: "ANIMALE",
    visual: "🐾",
    isTextVisual: false,
    tagline: "Sunete și habitate",
    imagePath: "/games/game-natura-1.png",
  },
  // 7 → GameMuzica: rhythm & instrument sequences
  7: {
    gradient: "from-[#880E4F] to-[#C2185B]",
    label: "MUZICĂ",
    visual: "🎵",
    isTextVisual: false,
    tagline: "Ritmuri muzicale",
    imagePath: "/games/game-muzica-1.png",
  },
  // 8 → GameMemorie: classic matching pairs
  8: {
    gradient: "from-[#0D47A1] to-[#1565C0]",
    label: "MEMORIE",
    visual: "🧠",
    isTextVisual: false,
    tagline: "Găsește perechile",
    imagePath: "/games/game-memorie-1.png",
  },
  // 9 → GameDesen: free drawing & coloring canvas
  9: {
    gradient: "from-[#BF360C] to-[#E64A19]",
    label: "DESEN",
    visual: "🎨",
    isTextVisual: false,
    tagline: "Desenează liber",
    imagePath: "/games/game-creativitate-1.png",
  },
  // 10 → GamePuzzle: logic & matching puzzles
  10: {
    gradient: "from-[#004D40] to-[#00695C]",
    label: "PUZZLE",
    visual: "🧩",
    isTextVisual: false,
    tagline: "Rezolvă & asociază",
    imagePath: "/games/game-logica-1.png",
  },
  // 11 → GameLabirint: maze navigation, 3 difficulties, 5 themes
  11: {
    gradient: "from-[#6A1B9A] to-[#8E24AA]",
    label: "LABIRINT",
    visual: "🌀",
    isTextVisual: false,
    tagline: "Găsește drumul",
    imagePath: "",
  },
  // 12 → GameCuvinte: word search grid, 5 categories
  12: {
    gradient: "from-[#AD1457] to-[#D81B60]",
    label: "CUVINTE",
    visual: "🔍",
    isTextVisual: false,
    tagline: "Cuvinte ascunse",
    imagePath: "",
  },
  // 13 → GameUnestePunctele: dot-to-dot numbers, letters, images
  13: {
    gradient: "from-[#EF6C00] to-[#FB8C00]",
    label: "PUNCTE",
    visual: "1•2•3",
    isTextVisual: true,
    tagline: "Unește punctele",
    imagePath: "",
  },
  // 14 → GameZipZap: fill-the-grid path puzzle, 60 levels
  14: {
    gradient: "from-[#283593] to-[#3949AB]",
    label: "ZIP ZAP",
    visual: "⚡",
    isTextVisual: false,
    tagline: "Umple toată grila",
    imagePath: "",
  },
  // 15 → GamePatches: cover the grid with rectangles matching size+shape clues
  15: {
    gradient: "from-[#00695C] to-[#00897B]",
    label: "PETICE",
    visual: "▦",
    isTextVisual: true,
    tagline: "Acoperă grila cu petice",
    imagePath: "",
  },
};

export const DEFAULT_TILE_STYLE: GameTileStyle = {
  gradient: "from-primary to-secondary",
  label: "JOC",
  visual: "🎮",
  isTextVisual: false,
  tagline: "Joacă și învață",
  imagePath: "",
};

export function gameTileStyle(gameId: number | undefined): GameTileStyle {
  return (gameId && GAME_TILE_STYLES[gameId]) || DEFAULT_TILE_STYLE;
}
