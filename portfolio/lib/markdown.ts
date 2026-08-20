/**
 * Markdown rendering for project and post bodies.
 *
 * The body is real Markdown — headings, lists, tables, blockquotes, emphasis,
 * links and fenced code blocks with syntax highlighting. Two deliberate
 * departures from "just render it to HTML":
 *
 * 1. A picture on its own line becomes a figure driven by `next/image` rather
 *    than a bare `img`, so it is optimised, lazy-loaded, and shows a labelled
 *    placeholder while the file is still missing.
 * 2. Code is highlighted at build time by Shiki, so no highlighter ships to the
 *    browser and there is no flash of unstyled code.
 *
 * Everything here runs on the server during `next build`.
 */

import { Marked, type Token, type Tokens } from "marked";
import { codeToHtml } from "shiki";

import { resolveSrc } from "@/lib/content-files";

/** Light theme only — the site has no dark mode. */
const SHIKI_THEME = "github-light";

export type MarkdownBlock =
  | { id: string; kind: "html"; html: string }
  | { id: string; kind: "image"; src: string; alt: string; caption?: string };

/** `## Some heading` becomes `some-heading`, so sections are deep-linkable. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** The language name from a fence info string, defaulting to plain text. */
function langOf(lang: string | undefined): string {
  return (lang || "text").trim().split(/\s+/)[0] || "text";
}

/**
 * Widths Next's optimiser accepts by default. 828 is the largest that fits the
 * prose column, so inline pictures ask for exactly that.
 */
const INLINE_IMAGE_WIDTH = 828;

/**
 * Send a remote picture through `/_next/image` rather than linking it directly.
 * A direct link would make the visitor's browser fetch from GitHub, handing a
 * third party their IP address on every page view; the optimiser fetches it
 * server-side and serves it from this origin. Local paths are already
 * same-origin and are left alone.
 */
function sameOriginSrc(src: string): string {
  if (!/^https?:\/\//i.test(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${INLINE_IMAGE_WIDTH}&q=75`;
}

/** A paragraph that holds nothing but one image, ignoring surrounding space. */
function loneImage(token: Token): Tokens.Image | undefined {
  if (token.type !== "paragraph") return undefined;
  const meaningful = (token as Tokens.Paragraph).tokens.filter(
    (child) => child.type !== "space" && !(child.type === "text" && !child.raw.trim()),
  );
  const [only] = meaningful;
  return meaningful.length === 1 && only.type === "image" ? (only as Tokens.Image) : undefined;
}

/**
 * Shiki is async, so every fenced block is highlighted up front and the results
 * are handed to the synchronous renderer through this map.
 */
async function highlightAll(tokens: Token[]): Promise<Map<string, string>> {
  const blocks: Tokens.Code[] = [];
  const collect = (list: Token[]) => {
    for (const token of list) {
      if (token.type === "code") blocks.push(token as Tokens.Code);
      const nested = (token as { tokens?: Token[] }).tokens;
      if (nested) collect(nested);
      if (token.type === "list") collect((token as Tokens.List).items);
    }
  };
  collect(tokens);

  const out = new Map<string, string>();
  await Promise.all(
    blocks.map(async (block) => {
      const lang = langOf(block.lang);
      const key = `${lang} ${block.text}`;
      if (out.has(key)) return;
      try {
        out.set(key, await codeToHtml(block.text, { lang, theme: SHIKI_THEME }));
      } catch {
        // An unknown language is a typo in a content file, not a build failure.
        out.set(key, await codeToHtml(block.text, { lang: "text", theme: SHIKI_THEME }));
      }
    }),
  );
  return out;
}

function buildRenderer(highlighted: Map<string, string>) {
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        // `##` is the conventional top level in a body file, so it maps to h2.
        // A stray `#` is clamped up rather than becoming a second h1.
        const level = Math.min(Math.max(depth, 2), 6);
        const id = slugify(html.replace(/<[^>]*>/g, ""));
        return `<h${level} id="${id}">${html}</h${level}>\n`;
      },

      code({ text, lang }) {
        const html = highlighted.get(`${langOf(lang)} ${text}`);
        if (!html) return `<pre><code>${text}</code></pre>`;
        // Shiki emits its own <pre>; wrap it so the language can be labelled.
        return `<div class="code-block" data-lang="${langOf(lang)}">${html}</div>\n`;
      },

      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href);
        const attrs = [
          `href="${href}"`,
          title ? `title="${title}"` : "",
          external ? 'target="_blank" rel="noreferrer noopener"' : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<a ${attrs}>${text}</a>`;
      },

      image({ href, title, text }) {
        // Inline images (inside a sentence). Standalone ones never reach here —
        // they are split out and rendered by next/image.
        const attrs = [
          `src="${sameOriginSrc(resolveSrc(href))}"`,
          `alt="${text}"`,
          title ? `title="${title}"` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<img ${attrs} loading="lazy" decoding="async" />`;
      },
    },
  });

  return marked;
}

/**
 * Turn a Markdown body into renderable blocks. Runs of Markdown are parsed
 * together — so a list or a fenced block spanning blank lines stays intact —
 * and a picture on its own line is split out to be rendered by `next/image`.
 */
export async function renderMarkdown(
  body: string,
  fallbackAlt: string,
  keyPrefix: string,
): Promise<MarkdownBlock[]> {
  const source = body.trim();
  if (!source) return [];

  const tokens = new Marked({ gfm: true }).lexer(source);
  const marked = buildRenderer(await highlightAll(tokens));

  const blocks: MarkdownBlock[] = [];
  let run: Token[] = [];

  const flush = () => {
    if (!run.length) return;
    const html = marked.parser(run as Parameters<typeof marked.parser>[0]).trim();
    if (html) blocks.push({ id: `${keyPrefix}-${blocks.length}`, kind: "html", html });
    run = [];
  };

  for (const token of tokens) {
    const image = loneImage(token);
    if (image) {
      flush();
      blocks.push({
        id: `${keyPrefix}-${blocks.length}`,
        kind: "image",
        src: resolveSrc(image.href),
        alt: image.text.trim() || fallbackAlt,
        caption: image.title?.trim() || undefined,
      });
      continue;
    }
    run.push(token);
  }
  flush();

  return blocks;
}

/** Words per minute for a technical reader. */
const WPM = 200;

/**
 * Reading time from the Markdown source, with the syntax stripped so fences,
 * link targets and image paths do not inflate the count.
 */
export function readingMinutes(body: string): number {
  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]+/g, " ");

  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WPM));
}
