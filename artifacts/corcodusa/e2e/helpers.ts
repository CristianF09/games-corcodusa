import { expect, type Locator, type Page } from "@playwright/test";

/** A signed-in user with an active subscription, as the API would return it. */
const USER = {
  id: 1,
  email: "copil.test@example.com",
  firstName: "Test",
  lastName: null,
  subscriptionTier: "premium",
  trialDaysLeft: 0,
  stripeCustomerId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

/** Answers the API calls the game pages make. Everything else gets a 404. */
export async function mockApi(page: Page) {
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

    if (url.pathname === "/api/users/me") return json(USER);
    if (url.pathname === "/api/users/me/subscription") {
      return json({ tier: "premium", isActive: true, trialDaysLeft: 0, expiresAt: null, stripePriceId: null });
    }
    // Unknown game id → the page falls back to its static game data.
    return json({ detail: "not mocked" }, 404);
  });
}

/** Opens a game and waits until its title is on screen. */
export async function openGame(page: Page, id: number, title: string) {
  await mockApi(page);
  await page.goto(`/games/${id}`);
  await expect(page.getByRole("heading", { name: new RegExp(title) }).first()).toBeVisible();
}

/** Errors that a child would never see: failed resource loads for mocked-away endpoints. */
const IGNORED = [/Failed to load resource/, /favicon/i];

/** Collects uncaught exceptions and console errors for the whole test. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", err => errors.push(`pageerror: ${err.message}`));
  page.on("console", msg => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (!IGNORED.some(re => re.test(text))) errors.push(`console: ${text}`);
  });
  return errors;
}

/** Centres an element in the viewport. Plain scrollIntoView puts it under the sticky navbar. */
export async function centre(locator: Locator) {
  await locator.evaluate(el => el.scrollIntoView({ block: "center", inline: "center" }));
}
