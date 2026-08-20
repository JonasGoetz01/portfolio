import { describe, expect, it } from "vitest";

import { resolveSrc, str, requireStr, toBlocks, toImage, toImages, toList } from "./content-files";

describe("resolveSrc", () => {
  it("expands the gh: shorthand to a raw.githubusercontent URL under assets/", () => {
    expect(resolveSrc("gh:projects/x/hero.avif")).toBe(
      "https://raw.githubusercontent.com/JonasGoetz01/portfolio/master/assets/projects/x/hero.avif",
    );
  });

  it("tolerates a leading slash after the prefix", () => {
    expect(resolveSrc("gh:/projects/x.avif")).toContain("/assets/projects/x.avif");
    expect(resolveSrc("gh:/projects/x.avif")).not.toContain("assets//");
  });

  it("leaves local paths and absolute URLs untouched", () => {
    expect(resolveSrc("/jonas.avif")).toBe("/jonas.avif");
    expect(resolveSrc("https://example.com/a.png")).toBe("https://example.com/a.png");
  });
});

describe("toBlocks", () => {
  it("splits on blank lines and joins wrapped lines into one paragraph", () => {
    const blocks = toBlocks("One line\nstill one.\n\nTwo.", "alt", "k");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ kind: "text", text: "One line still one." });
    expect(blocks[1]).toMatchObject({ kind: "text", text: "Two." });
  });

  it("turns an image-only paragraph into an image block and resolves gh:", () => {
    const [block] = toBlocks("![The rack](gh:blog/x/rack.avif)", "fallback", "k");
    expect(block).toMatchObject({ kind: "image", alt: "The rack" });
    expect(block).toHaveProperty("src", expect.stringContaining("/assets/blog/x/rack.avif"));
  });

  it("falls back to the entry title when the image has no alt text", () => {
    const [block] = toBlocks("![](/a.png)", "Entry title", "k");
    expect(block).toMatchObject({ kind: "image", alt: "Entry title" });
  });

  it("does not treat a paragraph that merely contains an image as an image block", () => {
    const [block] = toBlocks("Text ![a](/a.png) more text", "alt", "k");
    expect(block.kind).toBe("text");
  });

  it("gives every block a distinct key even when the text repeats", () => {
    const blocks = toBlocks("Same.\n\nSame.", "alt", "k");
    expect(new Set(blocks.map((b) => b.id)).size).toBe(2);
  });

  it("ignores whitespace-only input", () => {
    expect(toBlocks("\n\n   \n", "alt", "k")).toEqual([]);
  });
});

describe("toList", () => {
  it("accepts a list, a bare string, or nothing", () => {
    expect(toList(["a", " b "])).toEqual(["a", "b"]);
    expect(toList("solo")).toEqual(["solo"]);
    expect(toList(undefined)).toEqual([]);
    expect(toList("   ")).toEqual([]);
  });
});

describe("toImage / toImages", () => {
  it("reads both the bare-path and the { src, alt } form", () => {
    expect(toImage("/a.png", "fb")).toEqual({ src: "/a.png", alt: "fb" });
    expect(toImage({ src: "/a.png", alt: "own" }, "fb")).toEqual({ src: "/a.png", alt: "own" });
  });

  it("falls back to the given alt when the entry supplies none", () => {
    expect(toImage({ src: "/a.png" }, "fb")).toEqual({ src: "/a.png", alt: "fb" });
  });

  it("returns undefined for a missing or malformed value", () => {
    expect(toImage(undefined, "fb")).toBeUndefined();
    expect(toImage({ alt: "no src" }, "fb")).toBeUndefined();
  });

  it("drops malformed entries from a gallery instead of rendering blanks", () => {
    expect(toImages(["/a.png", { alt: "broken" }], "fb")).toEqual([{ src: "/a.png", alt: "fb" }]);
  });

  it("accepts a single image where a list is allowed", () => {
    expect(toImages("/a.png", "fb")).toHaveLength(1);
  });
});

describe("str / requireStr", () => {
  it("trims present values and blanks missing ones", () => {
    expect(str({ title: "  x  " }, "title")).toBe("x");
    expect(str({}, "title")).toBe("");
    expect(str({ title: 42 }, "title")).toBe("");
  });

  it("throws naming the file and field when a required value is absent", () => {
    expect(() => requireStr({}, "title", "blog/a.md")).toThrowError(
      /content\/blog\/a\.md: missing required frontmatter field "title"/,
    );
  });
});
