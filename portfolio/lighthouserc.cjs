/**
 * Lighthouse budgets.
 *
 * A JS config rather than JSON so the reasoning can sit next to the numbers —
 * and the split below is the whole point of this file.
 *
 * `error` is reserved for audits whose result does not depend on how fast or how
 * contended the machine is. Those hold identically on a laptop and on a shared
 * runner, so a failure is always a real regression.
 *
 * Timing audits are `warn`. A GitHub runner is a throttled, shared VM: this site
 * measures a Total Blocking Time of 0 ms locally and 620 ms there — that number
 * is the runner's CPU, not the site. Asserting it as an error only produces
 * flaky red builds, so the values stay visible in the log and real performance
 * is judged from a stable environment or from field data.
 */

const PORT = 3988;

const ROUTES = [
  "/",
  "/resume",
  "/projects",
  "/projects/learning-hub",
  "/blog",
  "/blog/lms-without-teachers",
];

module.exports = {
  ci: {
    collect: {
      startServerCommand: `PORT=${PORT} bun run start`,
      startServerReadyPattern: "Ready in",
      url: ROUTES.map((route) => `http://127.0.0.1:${PORT}${route}`),
      // Three runs, median reported: trims some of the runner's variance.
      numberOfRuns: 3,
      settings: { preset: "desktop" },
    },

    assert: {
      assertions: {
        // ---- deterministic: a failure here is a real regression ----
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],

        "total-byte-weight": ["error", { maxNumericValue: 512000 }],
        "unminified-javascript": ["error", { maxLength: 0 }],
        "unminified-css": ["error", { maxLength: 0 }],
        "uses-text-compression": ["error", { maxLength: 0 }],
        "modern-image-formats": ["error", { maxLength: 0 }],

        "meta-description": "error",
        "document-title": "error",
        "html-has-lang": "error",
        "crawlable-anchors": "error",
        "is-crawlable": "error",
        viewport: "error",

        // Layout shift comes from the markup, not the CPU, so it stays an error.
        // The bound is Google's "good" threshold rather than the 0 measured
        // here, to leave room for a slow runner's font timing.
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],

        // ---- timing: visible, never blocking ----
        "categories:performance": ["warn", { minScore: 0.9 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "total-blocking-time": ["warn", { maxNumericValue: 800 }],
        // Flipped between 0 and 1 across three runs of the same page locally,
        // so it is timing-sensitive despite looking static.
        "render-blocking-resources": ["warn", { maxLength: 0 }],

        // Next's framework chunks, not actionable without leaving the framework.
        "unused-javascript": "off",
        "csp-xss": "off",
        "uses-long-cache-ttl": "off",
      },
    },

    upload: { target: "temporary-public-storage" },
  },
};
