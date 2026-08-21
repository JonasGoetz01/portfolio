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
    /**
     * The admin variables are here so `/admin/login` renders its sign-in form
     * for the audit rather than the "not configured" notice. They are deliberate
     * nonsense: nothing in the suite signs in, and an OAuth app that does not
     * exist cannot be reached even if something tried.
     */
    env: {
      PORT: String(PORT),
      ADMIN_GITHUB_CLIENT_ID: "audit",
      ADMIN_GITHUB_CLIENT_SECRET: "audit",
      ADMIN_SESSION_SECRET: "audit".repeat(8),
      ADMIN_GITHUB_LOGINS: "nobody",
    },
  },
});
