import GameNumarare from "./GameNumarare";
import GameAdunare from "./GameAdunare";
import GameAlfabet from "./GameAlfabet";
import GameDinozauri from "./GameDinozauri";
import GameForme from "./GameForme";
import GameAnimale from "./GameAnimale";
import GameMuzica from "./GameMuzica";
import GameMemorie from "./GameMemorie";
import GameDesen from "./GameDesen";
import GamePuzzle from "./GamePuzzle";

export const GAME_COMPONENTS: Record<number, React.ComponentType> = {
  1: GameNumarare,
  2: GameAdunare,
  3: GameAlfabet,
  4: GameDinozauri,
  5: GameForme,
  6: GameAnimale,
  7: GameMuzica,
  8: GameMemorie,
  9: GameDesen,
  10: GamePuzzle,
};
