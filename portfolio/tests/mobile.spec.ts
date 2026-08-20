import { expect, test } from "@playwright/test";

import { ROUTES } from "./routes";

/**
 * The failure that makes a site feel broken on a phone is a page that scrolls
 * sideways — one element too wide for the viewport. It is invisible on a desktop
 * screen, so it is asserted here at the narrowest width worth supporting.
 */
const NARROW = { width: 320, height: 800 };

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(NARROW);
});

for (const route of ROUTES) {
  test(`no horizontal overflow on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      // Name whatever sticks out, so a failure points at the culprit. Fixed
      // elements are skipped: the decorative glows deliberately bleed past the
      // viewport and cannot make the document scroll.
      const guilty = [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => getComputedStyle(el).position !== "fixed")
        .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
        .slice(0, 5)
        .map((el) => `<${el.tagName.toLowerCase()}> "${(el.textContent ?? "").slice(0, 40)}"`);
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, guilty };
    });

    expect(
      overflow.scrollWidth,
      `wider than the viewport: ${overflow.guilty.join(", ")}`,
    ).toBeLessThanOrEqual(overflow.clientWidth);
  });
}

test("the header nav stays on one row on a narrow phone", async ({ page }) => {
  await page.goto("/");
  const items = page.locator("header nav a");
  await expect(items).toHaveCount(4);

  // Same vertical position for every item means they did not wrap.
  const tops = await items.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
});

test("the hero portrait fills the column on a phone and is inset on desktop", async ({ page }) => {
  await page.goto("/");
  const portrait = page.locator("section").first().locator("img");

  const narrow = await portrait.boundingBox();
  const main = await page.locator("main").boundingBox();
  // Within the page gutter: the frame spans the column rather than dangling.
  expect(narrow!.width).toBeGreaterThan(main!.width - 45);

  await page.setViewportSize({ width: 1280, height: 900 });
  const wide = await portrait.boundingBox();
  expect(wide!.width).toBeLessThan(400);
});
