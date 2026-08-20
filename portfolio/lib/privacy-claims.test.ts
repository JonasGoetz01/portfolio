import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The Datenschutzerklärung states that this site sets no cookies, uses no
 * browser storage, and makes no third-party requests. Those are claims about the
 * code, so they are checked here rather than trusted — a legal statement that
 * has quietly become false is worse than none.
 */
const SOURCE_DIRS = ["app", "lib"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

const sources = SOURCE_DIRS.flatMap(sourceFiles).map((path) => ({
  path,
  text: readFileSync(path, "utf8"),
}));

describe("claims made by the privacy notice", () => {
  it("sets no cookies and uses no browser storage", () => {
    const offenders = sources.filter(({ text }) =>
      /document\.cookie|localStorage|sessionStorage|indexedDB/.test(text),
    );
    expect(offenders.map((o) => o.path)).toEqual([]);
  });

  it("embeds no third-party script or frame", () => {
    const offenders = sources.filter(({ text }) =>
      /<script\s+[^>]*src=["']https?:|<iframe/i.test(text),
    );
    expect(offenders.map((o) => o.path)).toEqual([]);
  });

  it("never points the browser straight at a remote host for an asset", () => {
    // A remote src would leak the visitor's IP. Remote pictures must go through
    // next/image, and the CSP's img-src 'self' blocks anything else.
    const offenders = sources.filter(({ text }) => /src=["']https?:\/\//i.test(text));
    expect(offenders.map((o) => o.path)).toEqual([]);
  });

  it("does not preconnect or prefetch a third-party origin", () => {
    const offenders = sources.filter(({ text }) =>
      /rel=["'](?:preconnect|dns-prefetch)["'][^>]*https?:\/\//.test(text),
    );
    expect(offenders.map((o) => o.path)).toEqual([]);
  });
});
