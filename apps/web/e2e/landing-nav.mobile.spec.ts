import { expect, test } from "@playwright/test";

/**
 * Mobile layout of the landing nav.
 *
 * The design of record has no mobile treatment for this nav — no responsive
 * classes, no wrap — so this is our decision, not a copied one, and it needs a
 * test or nothing guards it: unit tests stub CSS Modules away entirely, and the
 * acceptance project runs at desktop width where the breakpoint never applies.
 *
 * Guarded here: the header stays compact, nothing overflows sideways, and
 * dropping the nav's login link does not strand the user — the hero still
 * offers it.
 */
test.describe("landing nav on a phone", () => {
  test("header is a single row and nothing overflows horizontally", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("navigation").first();
    const height = (await header.boundingBox())?.height ?? 0;
    // Everything on one row is ~76px. Two rows was 120px, three was 167px.
    expect(height, `sticky header is ${String(height)}px tall`).toBeLessThan(100);

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows, "page scrolls sideways").toBe(false);
  });

  // The wordmark is clipped, not removed: the logo is aria-hidden, so dropping
  // the text outright would leave the home link with no accessible name.
  test("the home link keeps its accessible name once the wordmark is clipped", async ({ page }) => {
    await page.goto("/");

    const home = page
      .getByRole("navigation")
      .first()
      .getByRole("link", { name: "Olympiad Academy" });
    await expect(home).toHaveAttribute("href", "/");

    const wordmarkWidth = await page
      .getByRole("navigation")
      .first()
      .locator("a[href='/'] span")
      .evaluate((node) => node.getBoundingClientRect().width);
    expect(wordmarkWidth, "wordmark still takes layout space").toBeLessThan(2);
  });

  test("the nav login link is hidden but login stays reachable from the hero", async ({ page }) => {
    await page.goto("/");

    const navLogin = page.getByRole("navigation").first().getByRole("link", { name: "Kirish" });
    await expect(navLogin).toBeHidden();

    const heroLogin = page.getByRole("link", { name: "Kirish" }).first();
    await expect(heroLogin).toBeVisible();
    await heroLogin.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
