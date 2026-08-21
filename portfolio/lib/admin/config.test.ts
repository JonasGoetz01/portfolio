import { afterEach, describe, expect, it } from "vitest";

import { adminConfig, ENV_KEYS, isAllowed } from "./config";

const KEYS = [...Object.values(ENV_KEYS), "ADMIN_GITHUB_SCOPE", "ADMIN_OAUTH_REDIRECT_URI"];
const SECRET = "x".repeat(32);

function set(values: Record<string, string | undefined>) {
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) if (value) process.env[key] = value;
}

const COMPLETE = {
  [ENV_KEYS.clientId]: "Iv1.abc",
  [ENV_KEYS.clientSecret]: "secret",
  [ENV_KEYS.sessionSecret]: SECRET,
  [ENV_KEYS.logins]: "JonasGoetz01",
};

afterEach(() => set({}));

describe("adminConfig", () => {
  it("names what is missing rather than throwing", () => {
    set({});
    const result = adminConfig();
    expect(result.ok).toBe(false);
    if (!result.ok) expect([...result.missing].sort()).toEqual([...Object.values(ENV_KEYS)].sort());
  });

  it("treats a guessable session secret as no secret at all", () => {
    set({ ...COMPLETE, [ENV_KEYS.sessionSecret]: "short" });
    const result = adminConfig();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.missing).toEqual([ENV_KEYS.sessionSecret]);
  });

  it("reads a complete environment", () => {
    set(COMPLETE);
    const result = adminConfig();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.logins).toEqual(["jonasgoetz01"]);
      // Least privilege by default: a public repository needs no more.
      expect(result.config.scope).toBe("public_repo");
      expect(result.config.redirectUri).toBeUndefined();
    }
  });

  it("splits the allowlist and ignores the spacing", () => {
    set({ ...COMPLETE, [ENV_KEYS.logins]: " JonasGoetz01 , someone-else,, " });
    const result = adminConfig();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.logins).toEqual(["jonasgoetz01", "someone-else"]);
  });

  it("takes an overridden scope and callback", () => {
    set({ ...COMPLETE, ADMIN_GITHUB_SCOPE: "repo", ADMIN_OAUTH_REDIRECT_URI: "https://x/cb" });
    const result = adminConfig();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.scope).toBe("repo");
      expect(result.config.redirectUri).toBe("https://x/cb");
    }
  });
});

describe("isAllowed", () => {
  const config = {
    clientId: "",
    clientSecret: "",
    sessionSecret: SECRET,
    logins: ["jonasgoetz01"],
    scope: "public_repo",
  };

  it("does not care how GitHub spells the login", () => {
    expect(isAllowed("JonasGoetz01", config)).toBe(true);
    expect(isAllowed("jonasgoetz01", config)).toBe(true);
    expect(isAllowed(" JonasGoetz01 ", config)).toBe(true);
  });

  it("lets nobody else in", () => {
    expect(isAllowed("someone-else", config)).toBe(false);
    expect(isAllowed("", config)).toBe(false);
    expect(isAllowed("jonasgoetz01x", config)).toBe(false);
  });
});
