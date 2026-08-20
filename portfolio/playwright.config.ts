import { defineConfig } from "@playwright/test";

/**
 * An uncommon port: 3000 is the dev server and 3210 is Convex, and reusing
 * somebody else's server silently audits the wrong site.
 */
const PORT = 3987;

export default defineConfig({
  testDir: "./tests",
  // Accessibility findings are deterministic; a retry would only hide flakiness.
  retries: 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: { baseURL: `http://127.0.0.1:${PORT}` },

  // Audits run against the real production build, not the dev server.
  webServer: {
    command: "bun run build && bun run start",
    url: `http://127.0.0.1:${PORT}`,
    // Never reuse a server we did not start. A foreign process on this port
    // would be audited instead of the site, and every assertion would fail for
    // the wrong reason.
    reuseExistingServer: false,
    timeout: 180_000,
    env: { PORT: String(PORT) },
  },
});
