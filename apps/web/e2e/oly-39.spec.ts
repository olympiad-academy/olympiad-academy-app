import { expect, test } from "@playwright/test";

/**
 * OLY-39 acceptance proofs (work brief AC1 + AC2, plan S7).
 * AC1: language switcher re-renders chrome and persists across reload.
 * AC2: the routing skeleton (`/`, `/signup`, `/login`, `/topics`) renders
 * i18n'ed content. Form behaviour is OLY-40 scope and is not asserted here.
 */

test.describe("AC1 — language switcher on the landing (D1)", () => {
  test("switches uz → ru → en, re-renders chrome, persists across reload", async ({ page }) => {
    await page.goto("/");

    // Default locale is uz (D1).
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Olimpiada matematikasini");

    // Switch to Russian: chrome re-renders, including the hero copy.
    await page.getByRole("radio", { name: "RU — Русский" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Олимпиадная математика");
    await expect(page.getByText("Как это работает")).toBeVisible();

    // The choice survives a full reload (localStorage persistence).
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Олимпиадная математика");

    // And English works too.
    await page.getByRole("radio", { name: "EN — English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Master olympiad math");
  });
});

test.describe("AC2 — routing skeleton (D2/D8)", () => {
  test("all four routes render their i18n'ed content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Olimpiada matematikasini");

    await page.goto("/signup");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ro'yxatdan o'tish");

    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kirish");

    await page.goto("/topics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mavzular");
  });

  test("landing CTAs navigate into the skeleton", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Bepul boshlash/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ro'yxatdan o'tish");
  });
});
