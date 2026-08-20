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

test("the hero portrait sits beside the name on a phone", async ({ page }) => {
  await page.goto("/");
  const portrait = page.locator("section").first().locator("img");
  const name = page.locator("h1");

  const [img, heading] = [await portrait.boundingBox(), await name.boundingBox()];
  // Same row: the picture starts left of the name and overlaps it vertically.
  expect(img!.x + img!.width).toBeLessThanOrEqual(heading!.x + 1);
  expect(img!.y).toBeLessThan(heading!.y + heading!.height);
  expect(img!.y + img!.height).toBeGreaterThan(heading!.y);

  // A compact square, not a band across the column.
  expect(Math.abs(img!.width - img!.height)).toBeLessThan(2);
  expect(img!.width).toBeLessThan(120);
});

test("the hero portrait moves to the right of the prose on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const img = (await page.locator("section").first().locator("img").boundingBox())!;
  const prose = (await page.locator("section").first().locator("p").first().boundingBox())!;

  expect(img.x).toBeGreaterThan(prose.x + prose.width);
  // The tall inset frame, close to the source photo's own 3:4 ratio.
  expect(img.height).toBeGreaterThan(img.width);
});

test("the portrait is fetched once, not once per layout", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "image") requests.push(r.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(requests.filter((u) => u.includes("jonas"))).toHaveLength(1);
});

/**
 * The picture must be cropped to each frame, never stretched into it. `fill`
 * plus `object-fit: cover` is what guarantees that: the image keeps its own
 * proportions and the overflow is clipped. Asserted rather than assumed,
 * because a stray `object-fill` or a width/height pair would distort the face
 * and still look plausible in a diff.
 */
test("the portrait is cropped to the frame, never stretched", async ({ page }) => {
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const img = page.locator("section").first().locator("img");
    await expect(img).toHaveCSS("object-fit", "cover");

    const shape = await img.evaluate((el: HTMLImageElement) => {
      const box = el.getBoundingClientRect();
      const t = getComputedStyle(el).transform;
      // A uniform scale keeps proportions; unequal x/y scaling would not.
      const m = t === "none" ? null : new DOMMatrixReadOnly(t);
      return {
        natural: el.naturalWidth / el.naturalHeight,
        frame: box.width / box.height,
        scaleX: m ? m.a : 1,
        scaleY: m ? m.d : 1,
      };
    });

    // The frame may differ from the source's ratio — that is the crop. What must
    // not differ is the horizontal and vertical scale applied to the pixels.
    expect(shape.natural).toBeCloseTo(3 / 4, 1);
    expect(shape.scaleX).toBeCloseTo(shape.scaleY, 5);
  }
});

/**
 * The "now" cards are separated by 1px gaps that reveal the container's own
 * background, which means an empty grid cell renders as a grey block. A partial
 * row is therefore a visual bug, not just wasted space — so the column count
 * must always divide the number of cards.
 *
 * The widths below span the range where `auto-fit` used to settle on two
 * columns and leave three cards in a 2x2 with a hole.
 */
for (const width of [320, 375, 520, 560, 640, 700, 760, 820, 1024, 1280]) {
  test(`the now grid has no empty cell at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const grid = page.locator("section").nth(1).locator("div.grid");
    const shape = await grid.evaluate((el) => ({
      columns: getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length,
      cards: el.children.length,
    }));

    expect(shape.cards).toBeGreaterThan(0);
    expect(
      shape.cards % shape.columns,
      `${shape.cards} cards in ${shape.columns} columns leaves a grey hole`,
    ).toBe(0);
  });
}
