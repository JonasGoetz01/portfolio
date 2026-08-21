import { describe, expect, it } from "vitest";

import { open, seal, type Session } from "./session";

const SECRET = "a-secret-that-is-at-least-32-characters";
const SESSION: Session = { login: "JonasGoetz01", token: "gho_token", exp: Date.now() + 60_000 };

describe("the session cookie", () => {
  it("comes back out as it went in", () => {
    expect(open(seal(SESSION, SECRET), SECRET)).toEqual(SESSION);
  });

  it("is different every time, so the cookie is not a fingerprint", () => {
    expect(seal(SESSION, SECRET)).not.toBe(seal(SESSION, SECRET));
  });

  it("does not open with another secret", () => {
    expect(open(seal(SESSION, SECRET), `${SECRET}-rotated`)).toBeNull();
  });

  it("does not open once it has expired", () => {
    const expired = { ...SESSION, exp: Date.now() - 1 };
    expect(open(seal(expired, SECRET), SECRET)).toBeNull();
  });

  it("does not open when a byte was changed", () => {
    const sealed = Buffer.from(seal(SESSION, SECRET), "base64url");
    sealed[sealed.length - 20] ^= 0xff;
    expect(open(sealed.toString("base64url"), SECRET)).toBeNull();
  });

  it("does not open when it was truncated", () => {
    const sealed = seal(SESSION, SECRET);
    expect(open(sealed.slice(0, sealed.length - 4), SECRET)).toBeNull();
  });

  it("does not carry the token in the clear", () => {
    expect(seal(SESSION, SECRET)).not.toContain("gho_token");
  });

  it("treats a missing or nonsense cookie as no session", () => {
    expect(open(undefined, SECRET)).toBeNull();
    expect(open("", SECRET)).toBeNull();
    expect(open("not-a-cookie", SECRET)).toBeNull();
  });
});
