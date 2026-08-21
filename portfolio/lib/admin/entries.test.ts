import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { draftFromJson, parseEntry, serializeEntry } from "./entries";
import { SPECS } from "./spec";

const BLOG = SPECS.blog;
const PROJECTS = SPECS.projects;

const POST = `---
date: 2026-08-18
lang: de
state: RÜCKBLICK

hero:
  src: gh:blog/camp/hero.avif
  alt: The whole camp in front of the banner

title: "Sommerlager 2026: Expedition Schwarzwald"
excerpt: Fifteen days, 85 children and one motto.
---

Fifteen days.

## The programme

A motto only holds if it runs through everything.
`;

describe("parseEntry", () => {
  it("reads the fields the collection knows about", () => {
    const draft = parseEntry(BLOG, "camp", POST);

    expect(draft.slug).toBe("camp");
    expect(draft.values.date).toBe("2026-08-18");
    expect(draft.values.lang).toBe("de");
    expect(draft.values.state).toBe("RÜCKBLICK");
    expect(draft.values.title).toBe("Sommerlager 2026: Expedition Schwarzwald");
    expect(draft.values.hero).toEqual({
      src: "gh:blog/camp/hero.avif",
      alt: "The whole camp in front of the banner",
    });
    expect(draft.body.startsWith("Fifteen days.")).toBe(true);
    expect(draft.extra).toEqual({});
  });

  it("keeps the gh: path rather than the URL it resolves to", () => {
    const draft = parseEntry(BLOG, "camp", POST);
    expect((draft.values.hero as { src: string }).src).toBe("gh:blog/camp/hero.avif");
  });

  it("reads the shorthand and the expanded form of a picture the same way", () => {
    const shorthand = parseEntry(BLOG, "x", "---\ntitle: X\nhero: gh:blog/x.avif\n---\n\nText.\n");
    expect(shorthand.values.hero).toEqual({ src: "gh:blog/x.avif", alt: "" });

    const gallery = parseEntry(
      PROJECTS,
      "x",
      "---\ntitle: X\nimages:\n  - gh:a.avif\n  - { src: gh:b.avif, alt: A rack }\n---\n\nText.\n",
    );
    expect(gallery.values.images).toEqual([
      { src: "gh:a.avif", alt: "" },
      { src: "gh:b.avif", alt: "A rack" },
    ]);
  });

  it("holds on to frontmatter it does not manage", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: X\nnotes: keep me\n---\n\nText.\n");
    expect(draft.extra).toEqual({ notes: "keep me" });
    expect(serializeEntry(BLOG, draft)).toContain("notes: keep me");
  });

  it("reads a list written as a single string", () => {
    const draft = parseEntry(PROJECTS, "x", "---\ntitle: X\nstack: Go\n---\n\nText.\n");
    expect(draft.values.stack).toEqual(["Go"]);
  });
});

describe("serializeEntry", () => {
  it("writes the house style: field order, blank-line blocks, body below", () => {
    expect(serializeEntry(BLOG, parseEntry(BLOG, "camp", POST))).toBe(POST);
  });

  it("leaves empty fields out entirely, and collapses the block they were in", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: Just a title\n---\n\nText.\n");
    expect(serializeEntry(BLOG, draft)).toBe("---\ntitle: Just a title\n---\n\nText.\n");
  });

  it("writes a picture without alt text as the shorthand", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: X\nhero: gh:blog/x.avif\n---\n\nText.\n");
    expect(serializeEntry(BLOG, draft)).toContain("\nhero: gh:blog/x.avif\n");
  });

  it("writes a gallery as a block list", () => {
    const draft = parseEntry(
      PROJECTS,
      "x",
      "---\ntitle: X\nimages:\n  - { src: gh:a.avif, alt: One }\n  - gh:b.avif\n---\n\nText.\n",
    );
    expect(serializeEntry(PROJECTS, draft)).toContain(
      "images:\n  - src: gh:a.avif\n    alt: One\n  - gh:b.avif\n",
    );
  });

  it("keeps a flow list for the stack", () => {
    const draft = parseEntry(
      PROJECTS,
      "x",
      "---\ntitle: X\nstack: [Go, Kubernetes]\n---\n\nText.\n",
    );
    expect(serializeEntry(PROJECTS, draft)).toContain("stack: [Go, Kubernetes]");
  });

  it("quotes values YAML would otherwise read as something else", () => {
    const cases: [string, string][] = [
      ["Sommerlager 2026: Expedition", '"Sommerlager 2026: Expedition"'],
      ["2026", '"2026"'],
      ["yes", '"yes"'],
      ["- not a list", '"- not a list"'],
      ["2026-08-18", '"2026-08-18"'],
      ["ends with:", '"ends with:"'],
      ["a # b", '"a # b"'],
    ];

    for (const [title, expected] of cases) {
      const draft = parseEntry(BLOG, "x", "---\ntitle: placeholder\n---\n\nText.\n");
      draft.values.title = title;
      expect(serializeEntry(BLOG, draft)).toContain(`title: ${expected}`);
    }
  });

  it("does not quote a value that needs no quoting", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: placeholder\n---\n\nText.\n");
    draft.values.title = "Rebuilding the homelab";
    expect(serializeEntry(BLOG, draft)).toContain("title: Rebuilding the homelab\n");
  });

  it("escapes a quote inside a quoted value", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: placeholder\n---\n\nText.\n");
    draft.values.title = 'He said: "no"';
    expect(serializeEntry(BLOG, draft)).toContain('title: "He said: \\"no\\""');
  });

  it("folds a newline typed into a single-line field", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: X\n---\n\nText.\n");
    draft.values.excerpt = "One line\nand another";
    expect(serializeEntry(BLOG, draft)).toContain("excerpt: One line and another\n");
  });

  it("ends the file with exactly one newline", () => {
    const draft = parseEntry(BLOG, "x", "---\ntitle: X\n---\n\nText.\n");
    draft.body = "Text.\n\n\n";
    expect(serializeEntry(BLOG, draft).endsWith("Text.\n")).toBe(true);
  });
});

describe("every file in content/", () => {
  const files = (["blog", "projects"] as const).flatMap((collection) => {
    const dir = path.join(process.cwd(), "content", collection);
    return fs
      .readdirSync(dir)
      .filter((name) => /\.mdx?$/.test(name) && !/^readme\./i.test(name) && !name.startsWith("."))
      .map((name) => ({ collection, name, file: path.join(dir, name) }));
  });

  it("finds files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  /**
   * Not byte equality: a hand-written file may space its frontmatter differently
   * and that is fine. What has to hold is that saving from the admin changes
   * nothing about what the file *means* — no field lost, no value altered.
   */
  it.each(files)(
    "survives a round trip through the editor ($collection/$name)",
    ({ collection, name, file }) => {
      const spec = SPECS[collection];
      const slug = name.replace(/\.mdx?$/, "").replace(/^_/, "");
      const original = parseEntry(spec, slug, fs.readFileSync(file, "utf8"));
      const rewritten = parseEntry(spec, slug, serializeEntry(spec, original));
      expect(rewritten).toEqual(original);
    },
  );
});

describe("draftFromJson", () => {
  it("reads back what the editor posts", () => {
    const draft = parseEntry(BLOG, "camp", POST);
    expect(draftFromJson(BLOG, JSON.stringify(draft))).toEqual(draft);
  });

  it("lowercases the slug", () => {
    expect(draftFromJson(BLOG, JSON.stringify({ slug: " Camp-2026 " })).slug).toBe("camp-2026");
  });

  it("turns a value of the wrong shape into an empty one", () => {
    const draft = draftFromJson(
      BLOG,
      JSON.stringify({ slug: "x", values: { title: 42, hero: "gh:x.avif", images: "no" } }),
    );
    expect(draft.values.title).toBe("");
    expect(draft.values.hero).toEqual({ src: "", alt: "" });
    expect(draft.values.images).toEqual([]);
  });

  it("does not throw on a body that is not JSON", () => {
    expect(draftFromJson(BLOG, "{{{").slug).toBe("");
  });
});
