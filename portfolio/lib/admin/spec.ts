/**
 * What the admin knows about the two content folders: which frontmatter fields
 * they understand, how they are written into the file, and how they are shown in
 * the editor.
 *
 * The single source of truth for both, so a field cannot appear in the form
 * without being written, or be written without a way to edit it. Keep this in
 * step with `content/blog/README.md` and `content/projects/README.md`, which
 * document the same fields for hand-written files.
 *
 * Deliberately dependency-free: the editor is a client component and imports it,
 * so nothing here may pull the Markdown or GitHub plumbing into the browser.
 */

export const COLLECTIONS = ["blog", "projects"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function isCollection(value: string): value is Collection {
  return (COLLECTIONS as readonly string[]).includes(value);
}

export type ImageValue = { src: string; alt: string };
export type FieldValue = string | string[] | ImageValue | ImageValue[];

export type FieldKind =
  /** One line. */
  | "text"
  /** One line, but long enough to want the room. */
  | "long"
  /** `YYYY-MM-DD`. */
  | "date"
  /** Written unquoted so YAML reads it as a number. */
  | "number"
  /** Flow list, `[a, b]`. */
  | "list"
  /** A single picture: `src` plus `alt`. */
  | "image"
  /** A gallery of them. */
  | "images";

export type Field = {
  name: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  required?: boolean;
  placeholder?: string;
};

export type CollectionSpec = {
  collection: Collection;
  /** Singular, for headings and buttons. */
  label: string;
  /** Plural, for the list. */
  plural: string;
  /** Where an entry ends up on the site. */
  route: string;
  /**
   * Frontmatter fields in the order they are written to the file. Each inner
   * array becomes one blank-line-separated block, which is how the hand-written
   * files are laid out — small fields, then pictures, then the text.
   */
  groups: Field[][];
  /**
   * The same fields in the order the editor shows them, which is the order you
   * fill them in rather than the order they are stored. Names only; every field
   * in `groups` has to appear exactly once.
   */
  form: string[][];
};

const HERO: Field = {
  name: "hero",
  label: "Hero picture",
  kind: "image",
  hint: "The big picture at the top.",
};

const IMAGES: Field = {
  name: "images",
  label: "Gallery",
  kind: "images",
  hint: "Shown under the text.",
};

const BLOG: CollectionSpec = {
  collection: "blog",
  label: "Post",
  plural: "Posts",
  route: "/blog",
  groups: [
    [
      {
        name: "date",
        label: "Date",
        kind: "date",
        hint: "Sorts newest first, and is the date shown. Undated posts sort above the dated ones.",
      },
      {
        name: "dateLabel",
        label: "Date label",
        kind: "text",
        hint: "Overrides what the date column shows, e.g. Soon.",
      },
      {
        name: "lang",
        label: "Language",
        kind: "text",
        placeholder: "de",
        hint: "Only when the post is not in English. A BCP 47 tag — it picks the screen-reader voice and the hyphenation.",
      },
      {
        name: "state",
        label: "Tag",
        kind: "text",
        placeholder: "DRAFT",
        hint: "Small brand-coloured label. Empty hides it.",
      },
      {
        name: "order",
        label: "Order",
        kind: "number",
        hint: "Overrides date sorting. Lower sorts first.",
      },
    ],
    [HERO, IMAGES],
    [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "excerpt",
        label: "Excerpt",
        kind: "long",
        hint: "One or two lines, shown on the list page and under the title.",
      },
    ],
  ],
  form: [
    ["title", "excerpt"],
    ["date", "dateLabel", "state", "lang", "order"],
    ["hero"],
    ["images"],
  ],
};

const PROJECTS: CollectionSpec = {
  collection: "projects",
  label: "Project",
  plural: "Projects",
  route: "/projects",
  groups: [
    [
      {
        name: "order",
        label: "Order",
        kind: "number",
        hint: "Lower sorts first. Empty sorts last.",
      },
      {
        name: "stack",
        label: "Stack",
        kind: "list",
        hint: "The small tags on the card. Comma-separated.",
        placeholder: "Go, Kubernetes",
      },
    ],
    [HERO, IMAGES],
    [
      {
        name: "kind",
        label: "Eyebrow",
        kind: "text",
        placeholder: "WORK — 42 HEILBRONN",
        hint: "The small line above the title.",
      },
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "subtitle",
        label: "Subtitle",
        kind: "long",
        hint: "One or two lines, shown on the card and under the title.",
      },
    ],
  ],
  form: [["title", "subtitle", "kind"], ["stack", "order"], ["hero"], ["images"]],
};

export const SPECS: Record<Collection, CollectionSpec> = { blog: BLOG, projects: PROJECTS };

/** Every field of a collection, flat, in file order. */
export function fields(spec: CollectionSpec): Field[] {
  return spec.groups.flat();
}

export function field(spec: CollectionSpec, name: string): Field {
  const found = fields(spec).find((entry) => entry.name === name);
  if (!found) throw new Error(`admin: ${spec.collection} has no field "${name}"`);
  return found;
}

/**
 * A draft is what the editor holds and what gets written: the filename, the
 * known fields, the Markdown body, and anything else the file already had.
 */
export type Draft = {
  /** Filename without the extension, which is also the URL. */
  slug: string;
  values: Record<string, FieldValue>;
  body: string;
  /**
   * Frontmatter keys the editor does not manage. Carried through untouched, so
   * saving from the admin never drops a field added by hand.
   */
  extra: Record<string, unknown>;
};

export function emptyValue(kind: FieldKind): FieldValue {
  switch (kind) {
    case "list":
      return [];
    case "image":
      return { src: "", alt: "" };
    case "images":
      return [];
    default:
      return "";
  }
}

export function emptyDraft(spec: CollectionSpec): Draft {
  const values: Record<string, FieldValue> = {};
  for (const entry of fields(spec)) values[entry.name] = emptyValue(entry.kind);
  return { slug: "", values, body: "", extra: {} };
}

/**
 * `2026-02-31` parses — Date rolls it over into March — so the parts are compared
 * back rather than trusting `Date.parse` to reject an impossible day.
 */
function isRealDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** The same rule `readContentDir` enforces at build time, checked before saving. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Everything wrong with a draft, in the order a reader would fix it. An empty
 * array means the file will parse and the build will not throw on it.
 */
export function validate(spec: CollectionSpec, draft: Draft): string[] {
  const problems: string[] = [];

  if (!draft.slug) problems.push("The filename is required — it is also the URL.");
  else if (!SLUG_PATTERN.test(draft.slug))
    problems.push(
      `The filename "${draft.slug}" has to be lowercase words separated by single hyphens.`,
    );

  for (const entry of fields(spec)) {
    const value = draft.values[entry.name];

    if (entry.required && !(typeof value === "string" && value.trim()))
      problems.push(`${entry.label} is required.`);

    if (entry.kind === "date" && typeof value === "string" && value.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim()))
        problems.push(`${entry.label} has to look like 2026-03-14.`);
      else if (!isRealDate(value.trim())) problems.push(`${entry.label} is not a real date.`);
    }

    if (entry.kind === "number" && typeof value === "string" && value.trim()) {
      if (!Number.isFinite(Number(value.trim())))
        problems.push(`${entry.label} has to be a number.`);
    }

    if (entry.kind === "image") {
      const image = value as ImageValue;
      if (!image.src.trim() && image.alt.trim())
        problems.push(`${entry.label} has alt text but no picture.`);
    }

    if (entry.kind === "images") {
      const list = value as ImageValue[];
      list.forEach((image, index) => {
        if (!image.src.trim()) problems.push(`${entry.label} entry ${index + 1} has no picture.`);
      });
    }
  }

  if (!draft.body.trim()) problems.push("The text is empty.");

  return problems;
}
