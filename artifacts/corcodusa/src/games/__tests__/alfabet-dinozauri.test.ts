import { describe, expect, it } from "vitest";
import { LETTERS_DATA, TRACE_ALPHABET, TRACE_WORDS, WORD_BLANKS } from "@/games/GameAlfabet";
import { CATEGORIES, buildKeyboard } from "@/games/GameDinozauri";

// Letters whose words don't start with the letter itself: the game explains them
// (“m-ă-r”, “p-â-ine”), so they are exempt from the first-letter rule.
const MID_WORD_LETTERS = new Set(["Ă", "Â"]);
const ROMANIAN = new Set("AĂÂBCDEFGHIÎJKLMNOPQRSȘTȚUVXYZ".split(""));

describe("Alfabet — data", () => {
  it("every letter has a word that starts with it (except the explained Ă and Â)", () => {
    for (const [letter, info] of Object.entries(LETTERS_DATA)) {
      if (MID_WORD_LETTERS.has(letter)) continue;
      expect(info.word[0].toUpperCase(), `${info.word} ↔ ${letter}`).toBe(letter);
    }
  });

  it("every traceable letter has at least one example word starting with it", () => {
    for (const letter of TRACE_ALPHABET) {
      const examples = TRACE_WORDS[letter] ?? [];
      expect(examples.length, `no examples for ${letter}`).toBeGreaterThan(0);
      for (const ex of examples) {
        expect(ex.word[0].toUpperCase(), `${ex.word} ↔ ${letter}`).toBe(letter);
      }
    }
  });

  it("the completing-the-word game blanks the right letter and asks among real letters", () => {
    for (const item of WORD_BLANKS) {
      expect(item.letter).toBe(item.word[0].toUpperCase());
      expect(item.blanked[0]).toBe("_");
      expect(TRACE_ALPHABET).toContain(item.letter);
    }
  });
});

describe("Dinozauri — data and keyboard", () => {
  it("every word uses only Romanian letters, in capitals", () => {
    for (const cat of Object.values(CATEGORIES)) {
      for (const { word } of cat.words) {
        expect(word, word).toBe(word.toUpperCase());
        for (const ch of word) expect(ROMANIAN.has(ch), `${ch} in ${word}`).toBe(true);
      }
    }
  });

  it("every word has a hint", () => {
    for (const cat of Object.values(CATEGORIES)) {
      for (const w of cat.words) expect(w.hint.length).toBeGreaterThan(0);
    }
  });

  it("the on-screen keyboard always contains every letter the word needs", () => {
    for (const cat of Object.values(CATEGORIES)) {
      for (const { word } of cat.words) {
        for (const total of [9, 13, 17]) {
          const keys = buildKeyboard(word, total);
          for (const ch of new Set(word)) expect(keys).toContain(ch);
          expect(new Set(keys).size).toBe(keys.length);
          expect(keys.length).toBe(Math.max(total, new Set(word).size));
        }
      }
    }
  });
});
