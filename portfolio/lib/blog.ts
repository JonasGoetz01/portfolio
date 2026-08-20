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
  str,
  toBlocks,
  toImage,
  toImages,
  type Block,
  type ContentImage,
} from "@/lib/content-files";

export type Post = {
  /** Filename without the extension; also the post URL. */
  slug: string;
  /** ISO date from frontmatter, used for sorting. Empty if the post has none. */
  date: string;
  /** Shown in the date column; falls back to the ISO date. */
  dateLabel: string;
  title: string;
  /** One or two lines, shown on the list page. */
  excerpt: string;
  /** Small brand-coloured tag, e.g. "DRAFT". Empty hides it. */
  state: string;
  hero?: ContentImage;
  images: ContentImage[];
  /** The post body: paragraphs and any pictures placed between them. */
  body: Block[];
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
    .map(({ slug, data, body }) => {
      const date = isoDate(data.date);
      const title = str(data, "title") || slug;
      const post: Post = {
        slug,
        date,
        dateLabel: str(data, "dateLabel") || date,
        title,
        excerpt: str(data, "excerpt"),
        state: str(data, "state"),
        hero: toImage(data.hero, title),
        images: toImages(data.images, title),
        body: toBlocks(body, title, slug),
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
