/**
 * Shared plumbing for the Markdown content folders — `content/projects/` and
 * `content/blog/`. Both are authored the same way: one file per entry, YAML
 * frontmatter for the short fields, and the body for the long text.
 *
 * Server-only: everything here reads the filesystem, so it must be called from
 * a server component. Pages load the parsed result and hand it to the client
 * views, which pick a language the way the rest of the site does.
 */

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

/**
 * Pictures can be hosted on GitHub instead of being committed to `public/`,
 * which keeps large files out of the deployed image. Put them anywhere under
 * `assets/` at the repo root and write `gh:<path-below-assets>`:
 *
 *   hero: gh:projects/learning-hub/hero.avif
 *   -> https://raw.githubusercontent.com/<repo>/<branch>/assets/projects/...
 *
 * The file has to be pushed to the branch below before the URL resolves.
 * Absolute https:// URLs pass through untouched, and so do plain `/local`
 * paths under `public/`. See `images.remotePatterns` in next.config.ts for the
 * hosts next/image is allowed to fetch from.
 */
const GITHUB_REPO = "JonasGoetz01/portfolio";
const GITHUB_BRANCH = "master";
const GITHUB_ASSET_DIR = "assets";
const GITHUB_PREFIX = "gh:";

const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_ASSET_DIR}`;

/** Expand `gh:` shorthand; leave local paths and absolute URLs alone. */
export function resolveSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed.startsWith(GITHUB_PREFIX)) return trimmed;
  return `${RAW_BASE}/${trimmed.slice(GITHUB_PREFIX.length).replace(/^\/+/, "")}`;
}

export type ContentImage = { src: string; alt: string };

/** Coerce a frontmatter value that may be a string, a list, or missing. */
export function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

/**
 * An image entry is either a bare path/URL or `{ src, alt }`. Without an alt we
 * fall back to the entry's title, which beats an empty alt attribute.
 */
export function toImage(value: unknown, fallbackAlt: string): ContentImage | undefined {
  if (typeof value === "string" && value.trim())
    return { src: resolveSrc(value), alt: fallbackAlt };
  if (value && typeof value === "object") {
    const { src, alt } = value as { src?: unknown; alt?: unknown };
    if (typeof src === "string" && src.trim()) {
      return {
        src: resolveSrc(src),
        alt: typeof alt === "string" && alt.trim() ? alt.trim() : fallbackAlt,
      };
    }
  }
  return undefined;
}

export function toImages(value: unknown, fallbackAlt: string): ContentImage[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return raw
    .map((entry) => toImage(entry, fallbackAlt))
    .filter((entry): entry is ContentImage => Boolean(entry));
}

/** Read an optional string field from frontmatter, or "" when it is missing. */
export function str(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

/**
 * Read a field that an entry cannot render without. Missing values throw during
 * `next build` naming the file and the field, rather than shipping a card with a
 * blank heading — a typo in frontmatter should fail the build, not the page.
 */
export function requireStr(data: Record<string, unknown>, key: string, source: string): string {
  const value = str(data, key);
  if (!value) {
    throw new Error(`content/${source}: missing required frontmatter field "${key}"`);
  }
  return value;
}

export type ContentFile = {
  slug: string;
  /** `folder/file.md`, used to name the file in error messages. */
  source: string;
  data: Record<string, unknown>;
  /** The Markdown body, below the frontmatter. */
  body: string;
};

/**
 * Every Markdown file in a content folder. Docs (`README.md`) and files
 * prefixed with `_` or `.` are skipped, so they are not mistaken for entries.
 */
export function readContentDir(folder: string): ContentFile[] {
  const dir = path.join(process.cwd(), "content", folder);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file) && !/^[_.]/.test(file) && !/^readme\./i.test(file))
    .map((file) => {
      const source = `${folder}/${file}`;
      let data: Record<string, unknown>;
      let body: string;
      try {
        const parsed = matter(fs.readFileSync(path.join(dir, file), "utf8"));
        data = parsed.data as Record<string, unknown>;
        body = parsed.content;
      } catch (cause) {
        throw new Error(`content/${source}: could not parse frontmatter`, { cause });
      }

      const fromName = file.replace(/\.mdx?$/, "");
      const slug = str(data, "slug") || fromName;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(
          `content/${source}: slug "${slug}" must be lowercase words separated by single hyphens`,
        );
      }

      return { slug, source, data, body };
    })
    .map(assertUniqueSlug());
}

/**
 * Two files resolving to the same slug would silently shadow each other in the
 * routes, so the second one fails the build instead.
 */
function assertUniqueSlug() {
  const seen = new Map<string, string>();
  return (entry: ContentFile) => {
    const clash = seen.get(entry.slug);
    if (clash) {
      throw new Error(
        `content/${entry.source}: slug "${entry.slug}" is already used by content/${clash}`,
      );
    }
    seen.set(entry.slug, entry.source);
    return entry;
  };
}
