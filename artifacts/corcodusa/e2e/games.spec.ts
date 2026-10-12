import { test, expect } from "@playwright/test";
import { openGame, watchErrors, centre } from "./helpers";

// Each test plays one game the way a child would: opens it, makes a move, and
// checks that the game reacts correctly. The logic that can be checked without a
// browser (level validity, solvability, distractors…) lives in src/**/__tests__.

const GAMES: { id: number; title: string }[] = [
  { id: 1, title: "Numărătoare Veselă" },
  { id: 2, title: "Adunări Distractive" },
  { id: 3, title: "Alfabetul Vesel" },
  { id: 4, title: "Lumea Dinozaurilor" },
  { id: 5, title: "Forme și Culori" },
  { id: 6, title: "Lumea Animalelor" },
  { id: 7, title: "Ritmuri Vesele" },
  { id: 8, title: "Joc de Memorie" },
  { id: 9, title: "Atelier de Desen" },
  { id: 10, title: "Puzzle de Logică" },
  { id: 11, title: "Labirint" },
  { id: 12, title: "Caută Cuvinte" },
  { id: 13, title: "Unește Punctele" },
  { id: 14, title: "Zip Zap" },
  { id: 15, title: "Petice" },
];

/** Every game page loads, shows its own content and throws no errors. */
for (const g of GAMES) {
  test(`${g.id}. ${g.title}: loads with no runtime errors`, async ({ page }) => {
    const errors = watchErrors(page);
    await openGame(page, g.id, g.title);
    await page.waitForTimeout(600); // let lazy game code and first effects run
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

// ── 1. Numărătoare ──────────────────────────────────────────────────────────

test("1. Numărătoare: the right number is accepted", async ({ page }) => {
  const errors = watchErrors(page);
  await openGame(page, 1, "Numărătoare Veselă");
  const objects = page.locator("div.rounded-3xl > button");
  await expect(objects.first()).toBeVisible();
  const count = await objects.count();
  await page.getByRole("button", { name: String(count), exact: true }).click();
  await expect(page.getByText(/Corect|Fantastic/).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("1. Numărătoare: a wrong number is refused and the true count is shown", async ({ page }) => {
  await openGame(page, 1, "Numărătoare Veselă");
  const objects = page.locator("div.rounded-3xl > button");
  await expect(objects.first()).toBeVisible();
  const count = await objects.count();
  const options = page.locator(".grid-cols-2 > button");
  const wrong = (await options.allInnerTexts()).map(Number).find(n => n !== count);
  expect(wrong).toBeDefined();
  await page.getByRole("button", { name: String(wrong), exact: true }).click();
  await expect(page.getByText(`❌ Erau ${count}`, { exact: false })).toBeVisible();
});

// ── 2. Adunări ──────────────────────────────────────────────────────────────

test("2. Adunări: the revealed sum is arithmetically true", async ({ page }) => {
  await openGame(page, 2, "Adunări Distractive");
  const options = page.locator(".grid-cols-2 > button");
  await expect(options.first()).toBeVisible();
  await options.first().click();
  const feedback = page.getByText(/🎉 Corect!|❌ \d+/).first();
  await expect(feedback).toBeVisible();
  const text = await feedback.innerText();
  if (text.startsWith("❌")) {
    const m = text.match(/(\d+) ([+−×÷]) (\d+) = (\d+)/);
    expect(m, text).not.toBeNull();
    const [, a, op, b, res] = m!;
    const x = Number(a), y = Number(b);
    const expected = op === "+" ? x + y : op === "−" ? x - y : op === "×" ? x * y : x / y;
    expect(Number(res)).toBe(expected);
  }
});

test("2. Adunări: switching to subtraction shows the − operator", async ({ page }) => {
  await openGame(page, 2, "Adunări Distractive");
  await page.getByRole("button", { name: "Scădere 1–10" }).click();
  await expect(page.locator("div.rounded-3xl")).toContainText("−");
});

// ── 3. Alfabet ──────────────────────────────────────────────────────────────

test("3. Alfabet: tapping a letter reveals its word", async ({ page }) => {
  await openGame(page, 3, "Alfabetul Vesel");
  await page.getByRole("button", { name: /^A$/ }).first().click();
  await expect(page.getByText("Arici").first()).toBeVisible();
});

test("3. Alfabet: trace mode shows the drawing canvas", async ({ page }) => {
  await openGame(page, 3, "Alfabetul Vesel");
  await page.getByRole("button", { name: /Trasează/ }).click();
  await expect(page.locator("canvas").first()).toBeVisible();
});

test("3. Alfabet: the word game moves on only after the right letter", async ({ page }) => {
  await openGame(page, 3, "Alfabetul Vesel");
  await page.getByRole("button", { name: /Completează/ }).click();
  const blankWord = () => page.getByText(/^_[A-ZĂÂÎȘȚ]+$/).first().innerText();
  await expect(page.getByText(/^_[A-ZĂÂÎȘȚ]+$/).first()).toBeVisible();
  const before = await blankWord();

  // Try the answer letters one by one. A wrong letter keeps the same word on
  // screen; the right one moves to the next word after a short pause.
  const letters = page.locator("button").filter({ hasText: /^[A-ZĂÂÎȘȚ]$/ });
  const tries = Math.min(await letters.count(), 4);
  let advanced = false;
  for (let i = 0; i < tries && !advanced; i++) {
    await letters.nth(i).click();
    await page.waitForTimeout(1600);
    advanced = (await blankWord()) !== before;
  }
  expect(advanced, "none of the first answers moved on to the next word").toBe(true);
});

// ── 4. Dinozauri ────────────────────────────────────────────────────────────

test("4. Dinozauri: the physical keyboard reaches the game as well as the screen keys", async ({ page }) => {
  await openGame(page, 4, "Lumea Dinozaurilor");
  const keys = page.locator("button").filter({ hasText: /^[A-ZĂÂÎȘȚ]$/ });
  await expect(keys.first()).toBeVisible();
  const labels = await keys.allInnerTexts();
  const screen = page.locator("main");
  const before = await screen.innerText();
  // Typing on the real keyboard must change the game (a letter typed right fills
  // a blank, a wrong one costs a heart); a dead keyboard would leave it unchanged.
  for (const letter of labels.slice(0, 9)) {
    await page.keyboard.type(letter);
  }
  await expect.poll(async () => screen.innerText()).not.toBe(before);
});

// ── 5. Forme ────────────────────────────────────────────────────────────────

test("5. Forme și Culori: an answer gets the right or the wrong verdict", async ({ page }) => {
  await openGame(page, 5, "Forme și Culori");
  const options = page.locator("button.rounded-2xl");
  await expect(options.first()).toBeVisible();
  await options.first().click();
  await expect(page.getByText(/🎉 Corect! Bravo!|❌ Mai încearcă!/)).toBeVisible();
});

// ── 6. Animale ──────────────────────────────────────────────────────────────

test("6. Lumea Animalelor: a wrong guess reveals an animal that was one of the options", async ({ page }) => {
  await openGame(page, 6, "Lumea Animalelor");
  const options = page.locator("button.rounded-2xl");
  await expect(options.first()).toBeVisible();
  const names = (await options.allInnerTexts()).map(t => t.trim());
  await options.nth(0).click();
  const verdict = page.getByText(/🎉 Corect! Bravo!|❌ Era /);
  await expect(verdict).toBeVisible();
  const text = await verdict.innerText();
  if (text.startsWith("❌")) {
    const revealed = text.replace("❌ Era ", "").trim();
    expect(names.some(n => n.includes(revealed))).toBe(true);
  }
});

// ── 7. Ritmuri ──────────────────────────────────────────────────────────────

test("7. Ritmuri Vesele: a piano key is added to the note history", async ({ page }) => {
  await openGame(page, 7, "Ritmuri Vesele");
  const history = page.locator("span.inline-block").filter({ hasText: /^D$/ });
  const before = await history.count();
  await page.getByRole("button", { name: /Do$/ }).first().click();
  await expect(history).toHaveCount(before + 1);
});

test("7. Ritmuri Vesele: a rhythm starts and can be stopped", async ({ page }) => {
  await openGame(page, 7, "Ritmuri Vesele");
  await page.getByRole("button", { name: /Simplu/ }).click();
  await expect(page.getByRole("button", { name: /Stop/ })).toBeVisible();
  await page.getByRole("button", { name: /Stop/ }).click();
  await expect(page.getByRole("button", { name: /Stop/ })).toHaveCount(0);
});

test("7. Ritmuri Vesele: the echo challenge plays a sequence and asks to repeat it", async ({ page }) => {
  await openGame(page, 7, "Ritmuri Vesele");
  await page.getByRole("button", { name: /Repetă melodia/ }).click();
  await expect(page.getByText(/Ascultă cu atenție|Acum cântă tu/)).toBeVisible();
});

// ── 8. Memorie ──────────────────────────────────────────────────────────────

test("8. Joc de Memorie: flipping two cards counts a move", async ({ page }) => {
  await openGame(page, 8, "Joc de Memorie");
  const hidden = page.getByRole("button", { name: "❓" });
  await hidden.nth(0).click();
  await hidden.nth(1).click();
  await expect(page.getByText(/🔄 1$/)).toBeVisible();
});

// ── 9. Desen ────────────────────────────────────────────────────────────────

test("9. Atelier de Desen: dragging on the canvas paints it", async ({ page }) => {
  await openGame(page, 9, "Atelier de Desen");
  const canvas = page.locator("canvas").first();
  await centre(canvas);
  await expect(canvas).toBeVisible();
  const before = await canvas.evaluate(c => (c as HTMLCanvasElement).toDataURL());
  const box = await canvas.boundingBox();
  if (!box) throw new Error("canvas has no box");
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 12 });
  await page.mouse.up();
  const after = await canvas.evaluate(c => (c as HTMLCanvasElement).toDataURL());
  expect(after).not.toBe(before);
});

// ── 10. Puzzle ──────────────────────────────────────────────────────────────

test("10. Puzzle de Logică: swapping two pieces counts a move", async ({ page }) => {
  await openGame(page, 10, "Puzzle de Logică");
  const tiles = page.locator("button.cursor-pointer");
  await tiles.nth(0).click();
  await tiles.nth(1).click();
  await expect(page.getByText(/🔄 1$/)).toBeVisible();
});

// ── 11. Labirint ────────────────────────────────────────────────────────────

test("11. Labirint: arrow keys move the character", async ({ page }) => {
  await openGame(page, 11, "Labirint");
  await page.getByRole("button", { name: /Pornește/ }).click();
  await expect(page.getByText(/🏃 0/)).toBeVisible();
  // The start cell has an exit either to the right or down; try both.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
  }
  await expect(page.getByText(/🏃 0/)).toHaveCount(0);
});

// ── 12. Caută Cuvinte ───────────────────────────────────────────────────────

test("12. Caută Cuvinte: dragging across letters gives a verdict", async ({ page }) => {
  await openGame(page, 12, "Caută Cuvinte");
  await page.getByRole("button", { name: /Pornește/ }).click();
  const grid = page.locator("div[style*='grid-template-columns']").first();
  await centre(grid);
  const box = await grid.boundingBox();
  if (!box) throw new Error("grid has no box");
  // 8×8 board, 1/8 per cell. Start on row 3 — the top rows sit under the sticky navbar.
  const cell = box.width / 8;
  const y = box.y + 3.5 * cell;
  await page.mouse.move(box.x + 0.5 * cell, y);
  await page.mouse.down();
  await page.mouse.move(box.x + 2.5 * cell, y, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByText(/✓ Corect!|✗ Încearcă altceva/)).toBeVisible();
});

// ── 13. Unește Punctele ─────────────────────────────────────────────────────

test("13. Unește Punctele: the first dot starts the drawing and counts", async ({ page }) => {
  await openGame(page, 13, "Unește Punctele");
  await page.getByRole("button", { name: /Inimă/ }).click();
  await expect(page.getByText("0/13")).toBeVisible();
  await page.locator("svg g").first().dispatchEvent("click");
  await expect(page.getByText("1/13")).toBeVisible();
});

test("13. Unește Punctele: a wrong dot does not advance", async ({ page }) => {
  await openGame(page, 13, "Unește Punctele");
  await page.getByRole("button", { name: /Inimă/ }).click();
  await page.locator("svg g").nth(5).dispatchEvent("click");
  await expect(page.getByText("0/13")).toBeVisible();
});

// ── 14. Zip Zap ─────────────────────────────────────────────────────────────

test("14. Zip Zap: tapping the start cell begins the path", async ({ page }) => {
  await openGame(page, 14, "Zip Zap");
  await expect(page.getByText(/0\/16 celule/)).toBeVisible();
  // The hint marks the start cell; tap where it is.
  await page.getByRole("button", { name: /Indiciu/ }).click();
  const marker = page.locator("svg rect[stroke='#fbbf24']").first();
  await expect(marker).toBeVisible();
  const board = page.locator("svg").filter({ has: page.locator("rect") }).first();
  await centre(board);
  const box = await board.boundingBox();
  if (!box) throw new Error("board has no box");
  // The board is CSS-zoomed on wide screens, so SVG units must be scaled to pixels.
  const viewW = Number(await board.getAttribute("width"));
  const scale = box.width / viewW;
  const x = Number(await marker.getAttribute("x"));
  const y = Number(await marker.getAttribute("y"));
  const size = Number(await marker.getAttribute("width")) + 4;
  await page.mouse.click(box.x + (x + size / 2 - 2) * scale, box.y + (y + size / 2 - 2) * scale);
  await expect(page.getByText(/1\/16 celule/)).toBeVisible();
});

// ── 15. Petice ──────────────────────────────────────────────────────────────

test("15. Petice: a rectangle that mixes several clues is refused", async ({ page }) => {
  await openGame(page, 15, "Petice");
  // The board is the 480-unit SVG; small emoji icons are SVGs too.
  const svg = page.locator("svg[width='480']").first();
  await centre(svg);
  const box = await svg.boundingBox();
  if (!box) throw new Error("svg has no box");
  // Level 1 is 4×4 and its largest patch is 4 cells, so a 3×3 block (9 cells) can never be valid.
  const cell = box.width / 4;
  await page.mouse.move(box.x + 1.5 * cell, box.y + 1.5 * cell);
  await page.mouse.down();
  await page.mouse.move(box.x + 3.5 * cell, box.y + 3.5 * cell, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(".border-red-400").first()).toBeVisible();
});
