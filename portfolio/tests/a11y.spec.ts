import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { ROUTES } from "./routes";

/**
 * The entrance animations fade content in from `opacity: 0`, and axe would
 * otherwise sample a half-transparent frame and report every heading as a
 * contrast failure. The site honours `prefers-reduced-motion` by disabling
 * animations outright, so this audits the settled presentation — and proves the
 * reduced-motion path renders correctly at the same time.
 */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

/**
 * axe-core against the production build, on every route. WCAG 2 A/AA plus the
 * best-practice rules — the site is small enough that there is no reason to
 * carry known violations.
 */
for (const route of ROUTES) {
  test(`no accessibility violations on ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `${route} did not respond`).not.toBeNull();

    // Without this a route naming a deleted entry still passes: the 404 page
    // responds, and it is accessible, so axe finds nothing wrong with it.
    const expected = route === "/does-not-exist" ? 404 : 200;
    expect(response?.status(), `${route} answered with the wrong status`).toBe(expected);

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    // Name the rule and the element, so a failure is actionable from the log.
    const detail = violations
      .map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.help}\n` +
          violation.nodes.map((node) => `    ${node.target.join(" ")}`).join("\n"),
      )
      .join("\n");

    expect(violations, `\n${detail}`).toEqual([]);
  });
}

/**
 * The admin's sign-in page, which is the one page of it a visitor can reach. It
 * is kept out of `ROUTES` because that list is also the Lighthouse budget, and a
 * deliberately `noindex` page cannot pass an SEO budget — but a page with a form
 * on it is exactly the kind that needs the audit.
 */
test("no accessibility violations on /admin/login", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /continue with github/i })).toBeVisible();

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();

  expect(violations, `\n${violations.map((violation) => violation.help).join("\n")}`).toEqual([]);
});

test("the skip link is the first thing a keyboard user reaches", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("Skip to content");
});

test("the skip link moves focus to the main landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#content$/);
  await expect(page.locator("main#content")).toBeVisible();
});
