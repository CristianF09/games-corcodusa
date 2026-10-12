import { describe, expect, it } from "vitest";
import { NOUNS, countPhrase, isAre, numWord, howMany, type NounKey } from "@/lib/ro-nouns";
import { WORD_PROBLEMS } from "@/games/GameAdunare";

const KEYS = Object.keys(NOUNS) as NounKey[];

describe("ro-nouns — numeralele și substantivele", () => {
  it("fiecare substantiv are singular, plural și emoji", () => {
    for (const k of KEYS) {
      expect(NOUNS[k].sg.length, k).toBeGreaterThan(1);
      expect(NOUNS[k].pl.length, k).toBeGreaterThan(1);
      expect(NOUNS[k].emoji.length, k).toBeGreaterThan(0);
    }
  });

  it("acordul numeralului: un/o la singular, doi/două la plural", () => {
    expect(countPhrase(1, "mar")).toBe("un măr");
    expect(countPhrase(1, "stea")).toBe("o stea");
    expect(countPhrase(2, "mar")).toBe("două mere");
    expect(countPhrase(2, "pui")).toBe("doi pui");
    expect(countPhrase(2, "caine")).toBe("doi câini");
    expect(countPhrase(2, "balon")).toBe("două baloane");
    expect(countPhrase(3, "acadea")).toBe("trei acadele");
  });

  it("de la 20 în sus se folosește „de”, ca în română", () => {
    expect(countPhrase(20, "balon")).toBe("douăzeci de baloane");
    expect(countPhrase(25, "mar")).toBe("25 de mere");
    expect(countPhrase(50, "stea")).toBe("50 de stele");
  });

  it("numeralul nu scrie niciodată cifre sub 20 în fața substantivului", () => {
    for (const k of KEYS) {
      for (let n = 1; n <= 20; n++) {
        const phrase = countPhrase(n, k);
        expect(/^\d/.test(phrase) && n < 20, `${k}: ${phrase}`).toBe(false);
      }
    }
  });

  it("este/sunt și Câte/Câți după număr și gen", () => {
    expect(isAre(1)).toBe("este");
    expect(isAre(4)).toBe("sunt");
    expect(howMany("mar")).toBe("Câte");
    expect(howMany("caine")).toBe("Câți");
  });

  it("numWord respinge valorile în afara intervalului", () => {
    expect(() => numWord(21)).toThrow();
    expect(numWord(2, "f")).toBe("două");
  });
});

describe("Adunare — enunțurile de probleme", () => {
  it("scădere: „Unul/Una dintre ele dispare” la 1, plural la mai multe", () => {
    expect(WORD_PROBLEMS["−"](5, 1, "balon")).toContain("Unul dintre ele dispare");
    expect(WORD_PROBLEMS["−"](5, 1, "stea")).toContain("Una dintre ele dispare");
    expect(WORD_PROBLEMS["−"](7, 6, "balon")).toContain("Șase dintre ele dispar");
    expect(WORD_PROBLEMS["−"](7, 6, "balon")).toContain("Pe masă sunt șapte baloane.");
  });

  it("nu mai apar verbe de mâncare pentru obiecte care nu se mănâncă", () => {
    for (const k of KEYS) {
      expect(WORD_PROBLEMS["−"](5, 2, k)).not.toMatch(/mănânc/);
    }
  });

  it("adunare: numeralul se acordă cu substantivul", () => {
    expect(WORD_PROBLEMS["+"](2, 3, "mar")).toBe("Maria are două mere. Primește încă trei mere. Câte are acum?");
    expect(WORD_PROBLEMS["+"](1, 1, "stea")).toBe("Maria are o stea. Primește încă o stea. Câte are acum?");
  });

  it("înmulțire și împărțire: „este” pentru un obiect, „sunt” pentru mai multe", () => {
    expect(WORD_PROBLEMS["×"](2, 1, "mar")).toContain("În fiecare coș este un măr.");
    expect(WORD_PROBLEMS["×"](3, 2, "pui")).toContain("În fiecare coș sunt doi pui.");
    expect(WORD_PROBLEMS["÷"](6, 2, "balon")).toContain("Șase baloane sunt împărțite egal între doi copii.");
  });
});
