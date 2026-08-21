/**
 * Markdown in, draft out, and back again.
 *
 * The files are hand-written as often as they are edited here, so the writer
 * reproduces the house style rather than reformatting: the same field order, the
 * same blank-line blocks, quotes only where YAML needs them, and the `hero:
 * <path>` shorthand when a picture has no alt text of its own. Frontmatter keys
 * the editor does not know about are read into `extra` and written back
 * unchanged, so saving never silently drops one.
 */

import matter from "gray-matter";

import {
  emptyValue,
  fields,
  type CollectionSpec,
  type Draft,
  type Field,
  type FieldValue,
  type ImageValue,
} from "@/lib/admin/spec";

/* -------------------------------------------------------------------------- */
/*  Reading                                                                   */
/* -------------------------------------------------------------------------- */

/** Frontmatter dates arrive as a Date, because that is what YAML makes of them. */
function isoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim()))
    return value.trim().slice(0, 10);
  return "";
}

/**
 * Unlike `toImage` in `content-files.ts` this keeps the raw `gh:` path: the
 * editor edits what is in the file, not the URL it resolves to.
 */
function readImage(value: unknown): ImageValue {
  if (typeof value === "string") return { src: value.trim(), alt: "" };
  if (value && typeof value === "object") {
    const { src, alt } = value as { src?: unknown; alt?: unknown };
    return {
      src: typeof src === "string" ? src.trim() : "",
      alt: typeof alt === "string" ? alt.trim() : "",
    };
  }
  return { src: "", alt: "" };
}

function readValue(field: Field, value: unknown): FieldValue {
  switch (field.kind) {
    case "date":
      return isoDate(value);
    case "number":
      return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
    case "list":
      if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
      return typeof value === "string" && value.trim() ? [value.trim()] : [];
    case "image":
      return value === undefined || value === null ? emptyValue("image") : readImage(value);
    case "images": {
      const raw = Array.isArray(value) ? value : value ? [value] : [];
      return raw.map(readImage).filter((image) => image.src);
    }
    default:
      return typeof value === "string" ? value.trim() : "";
  }
}

/** The draft a file's contents make. `slug` comes from the filename. */
export function parseEntry(spec: CollectionSpec, slug: string, markdown: string): Draft {
  const parsed = matter(markdown);
  const data = { ...(parsed.data as Record<string, unknown>) };

  const values: Record<string, FieldValue> = {};
  for (const field of fields(spec)) {
    values[field.name] = readValue(field, data[field.name]);
    delete data[field.name];
  }

  return {
    slug,
    values,
    body: parsed.content.replace(/^\n+/, "").replace(/\s+$/, ""),
    extra: data,
  };
}

/* -------------------------------------------------------------------------- */
/*  Writing                                                                   */
/* -------------------------------------------------------------------------- */

/** Starts a construct YAML would read as something other than text. */
const SPECIAL_START = /^[-?:,[\]{}#&*!|>'"%@`]/;
/** Would be read as a number. */
const NUMERIC = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/;
/** Would be read as a date or timestamp. */
const DATEISH = /^\d{4}-\d{1,2}-\d{1,2}(?:[T ]|$)/;
/** Would be read as a boolean or null. YAML 1.1 spellings included. */
const RESERVED = /^(?:y|yes|n|no|true|false|on|off|null|~)$/i;

function escaped(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * A frontmatter value as one line. Newlines are folded to spaces — every field
 * here is a single line in the file, however it was typed into the textarea.
 */
function scalar(raw: string): string {
  const value = raw.replace(/\s+/g, " ").trim();
  const ambiguous =
    value === "" ||
    SPECIAL_START.test(value) ||
    value.endsWith(":") ||
    value.includes(": ") ||
    value.includes(" #") ||
    NUMERIC.test(value) ||
    DATEISH.test(value) ||
    RESERVED.test(value);
  return ambiguous ? escaped(value) : value;
}

/** Inside `[a, b]` the separators matter too. */
function flowItem(raw: string): string {
  const value = raw.replace(/\s+/g, " ").trim();
  return /[,[\]{}:]/.test(value) ? escaped(value) : scalar(value);
}

/** `2026-03-14` unquoted, so it stays a date. Anything else is text. */
function dateScalar(raw: string): string {
  const value = raw.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : scalar(value);
}

function numberScalar(raw: string): string {
  const value = raw.trim();
  return NUMERIC.test(value) ? value : scalar(value);
}

/** `hero: <path>` when there is no alt text, the two-line block when there is. */
function imageLines(name: string, image: ImageValue, indent = ""): string[] {
  const src = image.src.trim();
  if (!src) return [];
  if (!image.alt.trim()) return [`${indent}${name}: ${scalar(src)}`];
  return [
    `${indent}${name}:`,
    `${indent}  src: ${scalar(src)}`,
    `${indent}  alt: ${scalar(image.alt)}`,
  ];
}

function fieldLines(field: Field, value: FieldValue | undefined): string[] {
  if (value === undefined) return [];

  switch (field.kind) {
    case "date": {
      const raw = String(value).trim();
      return raw ? [`${field.name}: ${dateScalar(raw)}`] : [];
    }
    case "number": {
      const raw = String(value).trim();
      return raw ? [`${field.name}: ${numberScalar(raw)}`] : [];
    }
    case "list": {
      const items = (value as string[]).map((item) => item.trim()).filter(Boolean);
      return items.length ? [`${field.name}: [${items.map(flowItem).join(", ")}]`] : [];
    }
    case "image":
      return imageLines(field.name, value as ImageValue);
    case "images": {
      const list = (value as ImageValue[]).filter((image) => image.src.trim());
      if (!list.length) return [];
      const lines = [`${field.name}:`];
      for (const image of list) {
        if (!image.alt.trim()) {
          lines.push(`  - ${scalar(image.src)}`);
        } else {
          lines.push(`  - src: ${scalar(image.src)}`, `    alt: ${scalar(image.alt)}`);
        }
      }
      return lines;
    }
    default: {
      const raw = String(value).trim();
      return raw ? [`${field.name}: ${scalar(raw)}`] : [];
    }
  }
}

/**
 * A key the editor does not manage, written back as it was read. Handles what
 * YAML frontmatter realistically holds — scalars, lists and nested maps — and
 * skips anything else rather than guessing at a representation for it.
 */
function extraLines(key: string, value: unknown, indent = ""): string[] {
  if (value === null || value === undefined) return [];

  if (value instanceof Date)
    return [
      `${indent}${key}: ${!Number.isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : ""}`,
    ];

  if (typeof value === "number" || typeof value === "boolean")
    return [`${indent}${key}: ${String(value)}`];

  if (typeof value === "string") return [`${indent}${key}: ${scalar(value)}`];

  if (Array.isArray(value)) {
    if (!value.length) return [`${indent}${key}: []`];
    const lines = [`${indent}${key}:`];
    for (const item of value) {
      if (item && typeof item === "object" && !(item instanceof Date)) {
        // The first key of a map goes on the dash, the rest line up under it.
        const nested = Object.entries(item as Record<string, unknown>).flatMap(([k, v]) =>
          extraLines(k, v, `${indent}    `),
        );
        if (!nested.length) continue;
        lines.push(`${indent}  - ${nested[0].trimStart()}`, ...nested.slice(1));
      } else {
        lines.push(`${indent}  - ${scalar(String(item))}`);
      }
    }
    return lines.length > 1 ? lines : [];
  }

  if (typeof value === "object") {
    const nested = Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      extraLines(k, v, `${indent}  `),
    );
    return nested.length ? [`${indent}${key}:`, ...nested] : [];
  }

  return [];
}

/**
 * The file to commit. Empty fields are left out entirely — that is how an
 * optional field is absent — and empty blocks collapse, so a post with no
 * pictures has no gap where they would be.
 */
export function serializeEntry(spec: CollectionSpec, draft: Draft): string {
  const blocks: string[] = [];

  for (const group of spec.groups) {
    const lines = group.flatMap((field) => fieldLines(field, draft.values[field.name]));
    if (lines.length) blocks.push(lines.join("\n"));
  }

  const extra = Object.entries(draft.extra).flatMap(([key, value]) => extraLines(key, value));
  if (extra.length) blocks.push(extra.join("\n"));

  const body = draft.body.replace(/\r\n/g, "\n").replace(/\s+$/, "").replace(/^\n+/, "");

  return `---\n${blocks.join("\n\n")}\n---\n\n${body}\n`;
}

/* -------------------------------------------------------------------------- */
/*  Round-tripping through the editor                                         */
/* -------------------------------------------------------------------------- */

function jsonImage(value: unknown): ImageValue {
  if (!value || typeof value !== "object") return { src: "", alt: "" };
  const { src, alt } = value as { src?: unknown; alt?: unknown };
  return {
    src: typeof src === "string" ? src.trim() : "",
    alt: typeof alt === "string" ? alt.trim() : "",
  };
}

/**
 * The draft a submitted form carries, coerced field by field.
 *
 * The editor is the only thing that posts here and it posts what it was given,
 * but this is still a request body: every field is read through the spec, so a
 * value of the wrong shape becomes an empty one rather than reaching the writer.
 * `extra` is the exception — it went out as opaque frontmatter and comes back the
 * same way, and the writer only knows how to emit scalars, lists and maps.
 */
export function draftFromJson(spec: CollectionSpec, json: string): Draft {
  let raw: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object") raw = parsed as Record<string, unknown>;
  } catch {
    /* An unparseable body validates as an empty draft, which fails loudly. */
  }

  const incoming =
    raw.values && typeof raw.values === "object" ? (raw.values as Record<string, unknown>) : {};

  const values: Record<string, FieldValue> = {};
  for (const field of fields(spec)) {
    const value = incoming[field.name];
    switch (field.kind) {
      case "list":
        values[field.name] = Array.isArray(value)
          ? value.map((item) => String(item).trim()).filter(Boolean)
          : [];
        break;
      case "image":
        values[field.name] = jsonImage(value);
        break;
      case "images":
        values[field.name] = Array.isArray(value)
          ? value.map(jsonImage).filter((image) => image.src)
          : [];
        break;
      default:
        values[field.name] = typeof value === "string" ? value : "";
    }
  }

  return {
    slug: typeof raw.slug === "string" ? raw.slug.trim().toLowerCase() : "",
    values,
    body: typeof raw.body === "string" ? raw.body : "",
    extra: raw.extra && typeof raw.extra === "object" ? (raw.extra as Record<string, unknown>) : {},
  };
}
