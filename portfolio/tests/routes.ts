/**
 * Every page worth auditing. Kept in one place so the accessibility suite and
 * the Lighthouse budget cover the same set.
 */
export const ROUTES = [
  "/",
  "/resume",
  "/projects",
  "/projects/learning-hub",
  "/blog",
  "/blog/sommerlager-2026-expedition-schwarzwald",
  "/impressum",
  "/datenschutz",
  "/does-not-exist", // the 404 page is a page too
] as const;
