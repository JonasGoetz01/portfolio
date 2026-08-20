/**
 * Projects are authored as one Markdown file per project in `content/projects/`.
 * Dropping a file into that folder is all it takes to get a new entry on
 * `/projects` and its own detail page at `/projects/<filename>` — nothing here
 * or in the pages needs editing.
 *
 * See `content/projects/README.md` for the file format, and
 * `lib/content-files.ts` for the shared parsing (including `gh:` image paths).
 */

import {
  readContentDir,
  requireStr,
  str,
  toImage,
  toImages,
  toList,
  type ContentImage,
} from "@/lib/content-files";
import { readingMinutes } from "@/lib/markdown";

export type Project = {
  /** Filename without the extension; also the detail-page URL. */
  slug: string;
  /** Lower sorts first; files without `order` fall to the end, then by slug. */
  order: number;
  /** Small eyebrow above the title, e.g. "WORK — 42 HEILBRONN". */
  kind: string;
  title: string;
  /** One or two lines, shown on the card and under the title on the detail page. */
  subtitle: string;
  stack: string[];
  hero?: ContentImage;
  images: ContentImage[];
  /** The raw Markdown body. Rendered by the detail page via `renderMarkdown`. */
  body: string;
  /** Whole minutes at 200 wpm, from the body's prose. */
  readingMinutes: number;
};

/** Every project in `content/projects/`, in display order. */
export function getProjects(): Project[] {
  return readContentDir("projects")
    .map(({ slug, source, data, body }): Project => {
      const title = requireStr(data, "title", source);
      return {
        slug,
        order: typeof data.order === "number" ? data.order : Number.POSITIVE_INFINITY,
        kind: str(data, "kind"),
        title,
        subtitle: str(data, "subtitle"),
        stack: toList(data.stack),
        hero: toImage(data.hero, title),
        images: toImages(data.images, title),
        body,
        readingMinutes: readingMinutes(body),
      };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}
