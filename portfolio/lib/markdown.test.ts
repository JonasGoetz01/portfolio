import { describe, expect, it } from "vitest";

import { readingMinutes, renderMarkdown } from "./markdown";

const render = (md: string) => renderMarkdown(md, "fallback alt", "k");
const html = async (md: string) =>
  (await render(md)).map((block) => (block.kind === "html" ? block.html : "")).join("\n");

describe("renderMarkdown — block structure", () => {
  it("returns nothing for an empty body", async () => {
    expect(await render("   \n\n  ")).toEqual([]);
  });

  it("splits a lone image out so next/image can render it", async () => {
    const blocks = await render("Before.\n\n![The rack](gh:blog/x/rack.avif)\n\nAfter.");
    expect(blocks.map((b) => b.kind)).toEqual(["html", "image", "html"]);
    expect(blocks[1]).toMatchObject({ kind: "image", alt: "The rack" });
    expect(blocks[1]).toHaveProperty("src", expect.stringContaining("/assets/blog/x/rack.avif"));
  });

  it("reads a title as the figure caption", async () => {
    const [block] = await render('![alt](/a.png "A caption")');
    expect(block).toMatchObject({ kind: "image", caption: "A caption" });
  });

  it("falls back to the entry title when an image has no alt text", async () => {
    const [block] = await render("![](/a.png)");
    expect(block).toMatchObject({ alt: "fallback alt" });
  });

  it("keeps an image inside a sentence inline rather than splitting it out", async () => {
    const blocks = await render("Text ![a](/a.png) more text.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe("html");
  });

  it("gives every block a distinct key", async () => {
    const blocks = await render("One.\n\n![a](/a.png)\n\nTwo.");
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
  });
});

describe("renderMarkdown — inline and block Markdown", () => {
  it("renders emphasis, strong and inline code", async () => {
    const out = await html("A *b* and **c** and `d`.");
    expect(out).toContain("<em>b</em>");
    expect(out).toContain("<strong>c</strong>");
    expect(out).toContain("<code>d</code>");
  });

  it("keeps a list together across blank lines", async () => {
    const out = await html("- one\n\n- two\n\n- three");
    expect(out.match(/<li>/g) ?? []).toHaveLength(3);
    expect(out.match(/<ul>/g) ?? []).toHaveLength(1);
  });

  it("renders ordered lists and nesting", async () => {
    const out = await html("1. one\n2. two\n   - nested");
    expect(out).toContain("<ol>");
    expect(out).toContain("<ul>");
  });

  it("renders tables, blockquotes and rules", async () => {
    expect(await html("| a | b |\n| - | - |\n| 1 | 2 |")).toContain("<table>");
    expect(await html("> quoted")).toContain("<blockquote>");
    expect(await html("---")).toContain("<hr>");
  });

  it("maps ## to h2 — the conventional top level in a body file", async () => {
    const out = await html("## Second\n\n### Third\n\n#### Fourth");
    expect(out).toContain('<h2 id="second">');
    expect(out).toContain('<h3 id="third">');
    expect(out).toContain('<h4 id="fourth">');
  });

  it("clamps a stray # up to h2 rather than emitting a second h1", async () => {
    const out = await html("# Top");
    expect(out).toContain('<h2 id="top">');
    expect(out).not.toContain("<h1");
  });

  it("slugifies accents and punctuation into linkable ids", async () => {
    expect(await html("## Über den Rollout!")).toContain('id="über-den-rollout"');
  });

  it("opens external links in a new tab and leaves internal ones alone", async () => {
    const external = await html("[x](https://example.com)");
    expect(external).toContain('target="_blank"');
    expect(external).toContain('rel="noreferrer noopener"');
    expect(await html("[x](/projects)")).not.toContain("target=");
  });

  it("resolves gh: on an inline image", async () => {
    expect(await html("text ![a](gh:blog/x.avif) text")).toContain("/assets/blog/x.avif");
  });
});

describe("renderMarkdown — code blocks", () => {
  it("highlights a fenced block at build time and labels the language", async () => {
    const out = await html("```ts\nconst a: number = 1;\n```");
    expect(out).toContain('data-lang="ts"');
    expect(out).toContain('class="shiki');
    // Shiki emits inline colours, which is what proves highlighting ran.
    expect(out).toMatch(/style="color:#[0-9a-fA-F]{6}/);
  });

  it("keeps blank lines inside a fence instead of splitting the block", async () => {
    const blocks = await render("```ts\nconst a = 1;\n\nconst b = 2;\n```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe("html");
  });

  it("falls back to plain text for an unknown language rather than failing", async () => {
    const out = await html("```notalanguage\nhello\n```");
    expect(out).toContain("hello");
    expect(out).toContain("code-block");
  });

  it("escapes markup inside a code block", async () => {
    expect(await html("```html\n<script>x</script>\n```")).not.toContain("<script>x</script>");
  });
});

describe("readingMinutes", () => {
  it("never reports less than a minute", () => {
    expect(readingMinutes("A few words.")).toBe(1);
  });

  it("counts roughly 200 words to the minute", () => {
    expect(readingMinutes("word ".repeat(400))).toBe(2);
    expect(readingMinutes("word ".repeat(1000))).toBe(5);
  });

  it("ignores fenced code, link targets and image paths", () => {
    const withNoise = `${"word ".repeat(200)}\n\n\`\`\`ts\n${"const x = 1;\n".repeat(200)}\`\`\`\n\n![${"alt "}](/a/very/long/path/to/an/image.avif)`;
    expect(readingMinutes(withNoise)).toBe(1);
  });

  it("counts the visible text of a link, not its href", () => {
    expect(readingMinutes("[label](https://example.com/a/very/long/url/indeed)")).toBe(1);
  });
});
