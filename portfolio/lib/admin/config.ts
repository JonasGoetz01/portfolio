/**
 * Everything the admin needs from the environment, plus where things live in the
 * repository.
 *
 * Read lazily on purpose. `next build` runs in CI without any of these set, and
 * the public site has to build and render identically without them — so nothing
 * here throws at import time. An unconfigured deployment says what is missing on
 * `/admin`, rather than failing the build or 500-ing a page.
 */

import { GITHUB_ASSET_DIR, GITHUB_BRANCH, GITHUB_REPO } from "@/lib/content-files";

export { GITHUB_ASSET_DIR, GITHUB_BRANCH, GITHUB_PREFIX, GITHUB_REPO } from "@/lib/content-files";

/**
 * Paths are repo-relative, while the app runs with `portfolio/` as its working
 * directory — so the content folder the loaders read as `content/` is
 * `portfolio/content/` to the GitHub API. Assets sit at the repo root.
 */
export const REPO_CONTENT_DIR = "portfolio/content";
export const REPO_ASSET_DIR = GITHUB_ASSET_DIR;

/** Where the commits land. The same branch the site is built and served from. */
export const REPO = GITHUB_REPO;
export const BRANCH = GITHUB_BRANCH;

export type AdminConfig = {
  clientId: string;
  clientSecret: string;
  /** Any string; the cookie key is derived from it. */
  sessionSecret: string;
  /** Lowercased GitHub logins allowed to sign in. Everyone else is refused. */
  logins: string[];
  /**
   * OAuth scope. `public_repo` is all a public repository needs, and is what a
   * token that can only ever write Markdown and pictures should have. A private
   * repository needs the broader `repo`.
   */
  scope: string;
  /**
   * Registered callback URL. Optional — left unset, the callback is derived from
   * the request, which is what makes one OAuth app per environment work without
   * further configuration.
   */
  redirectUri?: string;
};

/** Env var names, kept here so the "not configured" page can name them. */
export const ENV_KEYS = {
  clientId: "ADMIN_GITHUB_CLIENT_ID",
  clientSecret: "ADMIN_GITHUB_CLIENT_SECRET",
  sessionSecret: "ADMIN_SESSION_SECRET",
  logins: "ADMIN_GITHUB_LOGINS",
} as const;

export type ConfigResult =
  { ok: true; config: AdminConfig } | { ok: false; missing: readonly string[] };

/** The admin's configuration, or the names of the variables still to be set. */
export function adminConfig(): ConfigResult {
  const clientId = process.env[ENV_KEYS.clientId]?.trim() ?? "";
  const clientSecret = process.env[ENV_KEYS.clientSecret]?.trim() ?? "";
  const sessionSecret = process.env[ENV_KEYS.sessionSecret] ?? "";
  const logins = (process.env[ENV_KEYS.logins] ?? "")
    .split(",")
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean);

  const missing = [
    clientId ? "" : ENV_KEYS.clientId,
    clientSecret ? "" : ENV_KEYS.clientSecret,
    // Short secrets are treated as absent: this one keeps a GitHub token
    // encrypted in a cookie, so a guessable value is worse than none.
    sessionSecret.length >= 32 ? "" : ENV_KEYS.sessionSecret,
    logins.length ? "" : ENV_KEYS.logins,
  ].filter(Boolean);

  if (missing.length) return { ok: false, missing };

  return {
    ok: true,
    config: {
      clientId,
      clientSecret,
      sessionSecret,
      logins,
      scope: process.env.ADMIN_GITHUB_SCOPE?.trim() || "public_repo",
      redirectUri: process.env.ADMIN_OAUTH_REDIRECT_URI?.trim() || undefined,
    },
  };
}

/**
 * The configuration, for the paths that are only reachable once a signed-in
 * session exists — which cannot happen unless it is complete.
 */
export function requireConfig(): AdminConfig {
  const result = adminConfig();
  if (!result.ok) throw new Error(`admin: missing ${result.missing.join(", ")}`);
  return result.config;
}

/** Whether this login may sign in. Logins are compared case-insensitively. */
export function isAllowed(login: string, config: AdminConfig): boolean {
  return config.logins.includes(login.trim().toLowerCase());
}
