import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { getPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects";
import { ROUTES } from "../tests/routes";

/**
 * The audited routes are named in two places: `tests/routes.ts` for the axe and
 * layout suites, and `lighthouserc.cjs` for the budgets. A `.cjs` file cannot
 * require the TypeScript one, so the list is duplicated — and it drifted, which
 * is what these tests are for.
 *
 * The failure mode was quiet in one suite and loud in the other: axe audited the
 * 404 page and passed, while Lighthouse refused to load the page at all and
 * failed the build with a runtime error rather than a named route.
 */
const require = createRequire(import.meta.url);
const lighthouse = require("../lighthouserc.cjs") as {
  ci: { collect: { url: string[] } };
};

const lighthouseRoutes = lighthouse.ci.collect.url.map((url) => new URL(url).pathname);

/** Routes that stand for a content file, rather than a page of the site. */
const entryRoutes = (routes: readonly string[]) =>
  routes.filter((route) => /^\/(blog|projects)\/.+/.test(route));

describe("the audited routes", () => {
  const existing = new Set([
    ...getPosts().map((post) => `/blog/${post.slug}`),
    ...getProjects().map((project) => `/projects/${project.slug}`),
  ]);

  it.each(entryRoutes(ROUTES))("%s is a page that exists", (route) => {
    expect([...existing]).toContain(route);
  });

  it.each(entryRoutes(lighthouseRoutes))("%s is a page Lighthouse can load", (route) => {
    expect([...existing]).toContain(route);
  });

  it("has the Lighthouse budget covering a subset of the audited routes", () => {
    expect(ROUTES).toEqual(expect.arrayContaining(lighthouseRoutes));
  });
});
