/**
 * Blog posts are authored as one Markdown file per post in `content/blog/`.
 * Dropping a file into that folder is all it takes to get a new entry on `/blog`
 * and its own page at `/blog/<filename>`.
 *
 * See `content/blog/README.md` for the file format, and `lib/content-files.ts`
 * for the shared parsing (including `gh:` image paths and pictures placed
 * between paragraphs with `![alt](src)`).
 */

import {
  readContentDir,
  requireStr,
  str,
  toImage,
  toImages,
  type ContentImage,
} from "@/lib/content-files";
import { readingMinutes } from "@/lib/markdown";

export type Post = {
  /** Filename without the extension; also the post URL. */
  slug: string;
  /** ISO date from frontmatter, used for sorting. Empty if the post has none. */
  date: string;
  /**
   * BCP 47 tag when the post is not in the site's language. The site is
   * English, so a German post has to say so: it lets a screen reader pick the
   * right voice and the browser hyphenate the long compounds correctly.
   */
  lang?: string;
  /** Shown in the date column; falls back to the ISO date. */
  dateLabel: string;
  title: string;
  /** One or two lines, shown on the list page. */
  excerpt: string;
  /** Small brand-coloured tag, e.g. "DRAFT". Empty hides it. */
  state: string;
  hero?: ContentImage;
  images: ContentImage[];
  /** The raw Markdown body. Rendered by the post page via `renderMarkdown`. */
  body: string;
  /** Whole minutes at 200 wpm, from the body's prose. */
  readingMinutes: number;
};

/** Frontmatter dates may already be parsed into a Date by the YAML reader. */
function isoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim()))
    return value.trim().slice(0, 10);
  return "";
}

/**
 * Newest first by date. Posts without a date sort above the dated ones — they
 * are the upcoming ones — and `order` overrides both when it is set.
 */
export function getPosts(): Post[] {
  return readContentDir("blog")
    .map(({ slug, source, data, body }) => {
      const date = isoDate(data.date);
      const title = requireStr(data, "title", source);
      const post: Post = {
        slug,
        date,
        lang: str(data, "lang") || undefined,
        dateLabel: str(data, "dateLabel") || date,
        title,
        excerpt: str(data, "excerpt"),
        state: str(data, "state"),
        hero: toImage(data.hero, title),
        images: toImages(data.images, title),
        body,
        readingMinutes: readingMinutes(body),
      };
      // Undated posts get the lower default so they sort first.
      const order = typeof data.order === "number" ? data.order : date ? 1 : 0;
      return { post, order };
    })
    .sort(
      (a, b) =>
        a.order - b.order ||
        b.post.date.localeCompare(a.post.date) ||
        a.post.slug.localeCompare(b.post.slug),
    )
    .map((entry) => entry.post);
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}

/** Just enough of a neighbouring post to render a link to it. */
export type PostLink = { slug: string; title: string };

/**
 * The posts either side of this one, in listing order — `previous` is the one
 * above it on `/blog`, `next` the one below. Both are undefined at the ends.
 */
export function getPostNeighbours(slug: string): {
  previous?: PostLink;
  next?: PostLink;
} {
  const posts = getPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return {};

  const link = (post: Post | undefined): PostLink | undefined =>
    post && { slug: post.slug, title: post.title };

  return { previous: link(posts[index - 1]), next: link(posts[index + 1]) };
}
