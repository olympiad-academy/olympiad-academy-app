import { expect, test } from "@playwright/test";

/**
 * OLY-40 acceptance proof (work brief AC3, plan S7). Runs against
 * MockAuthApi — the dev server defaults VITE_API_MOCK to mock (D5), so this
 * spec needs no Postgres/API and belongs in the fast e2e path
 * (`test:e2e`, not `test:e2e:api`).
 *
 * AC3: valid signup (name, phone-or-email, password >= 8) via mock -> token
 * stored -> lands on /topics; browser Back never returns to auth screens.
 */

test.describe("AC3 — signup happy path (D5/D7/D9)", () => {
  test("a valid signup stores a token and lands on /topics; Back returns to the landing, not /signup", async ({
    page,
  }) => {
    // Start from the landing (not a direct page.goto("/signup")) so history
    // is [/, /signup] before submit — matching how a real user arrives and
    // giving Back somewhere meaningful to prove it does NOT land on.
    await page.goto("/");
    await page
      .getByRole("link", { name: /Bepul boshlash/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/signup$/);

    await page.getByLabel("Ism").fill("Aziza");
    await page.getByLabel("Telefon yoki Email").fill(`aziza-${String(Date.now())}@example.com`);
    await page.getByLabel("Parol").fill("longenough8");
    await page.getByRole("button", { name: /Mashqni boshlash/ }).click();

    await expect(page).toHaveURL(/\/topics$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mavzular");

    const token = await page.evaluate(() => window.localStorage.getItem("oa.authToken"));
    expect(token).not.toBeNull();

    // The signup entry was replaced, not pushed — Back skips straight to the
    // landing, never re-showing the auth screen.
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test("an authenticated user who navigates to /signup or /login is redirected forward to /topics", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel("Ism").fill("Bek");
    await page.getByLabel("Telefon yoki Email").fill(`bek-${String(Date.now())}@example.com`);
    await page.getByLabel("Parol").fill("longenough8");
    await page.getByRole("button", { name: /Mashqni boshlash/ }).click();
    await expect(page).toHaveURL(/\/topics$/);

    await page.goto("/signup");
    await expect(page).toHaveURL(/\/topics$/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/topics$/);
  });
});

test.describe("AC3 — login and logout (D5/D7/D8)", () => {
  test("logging into the seeded demo account lands on /topics", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Telefon yoki Email").fill("alisher@example.com");
    await page.getByLabel("Parol").fill("olympiad8");
    await page.getByRole("button", { name: "Kirish" }).click();

    await expect(page).toHaveURL(/\/topics$/);
  });

  test("logout clears the session and re-guards /topics", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Telefon yoki Email").fill("alisher@example.com");
    await page.getByLabel("Parol").fill("olympiad8");
    await page.getByRole("button", { name: "Kirish" }).click();
    await expect(page).toHaveURL(/\/topics$/);

    await page.goto("/profile");
    await page.getByRole("button", { name: "Chiqish" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/topics");
    await expect(page).toHaveURL(/\/login$/);
  });
});
