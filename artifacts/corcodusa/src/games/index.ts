import { lazy } from "react";

// Code-split every game so the main bundle stays small and each game chunk
// downloads only on first visit. Suspense fallback is handled in game-detail.tsx.
export const GAME_COMPONENTS: Record<number, ReturnType<typeof lazy>> = {
  1:  lazy(() => import("./GameNumarare")),
  2:  lazy(() => import("./GameAdunare")),
  3:  lazy(() => import("./GameAlfabet")),
  4:  lazy(() => import("./GameDinozauri")),
  5:  lazy(() => import("./GameForme")),
  6:  lazy(() => import("./GameAnimale")),
  7:  lazy(() => import("./GameMuzica")),
  8:  lazy(() => import("./GameMemorie")),
  9:  lazy(() => import("./GameDesen")),
  10: lazy(() => import("./GamePuzzle")),
  11: lazy(() => import("./GameLabirint")),
  12: lazy(() => import("./GameCuvinte")),
  13: lazy(() => import("./GameUnestePunctele")),
};
