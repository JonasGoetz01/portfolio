/**
 * What the admin actually does to the repository: list the entries in a folder,
 * load one, write one back, remove one, and commit a picture for one.
 *
 * Every write is a commit on the deployed branch, which is what makes the site
 * rebuild. Nothing here is transactional, and one place is deliberately two
 * commits — see `saveEntry`.
 */

import { BRANCH, GITHUB_PREFIX, REPO, REPO_ASSET_DIR, REPO_CONTENT_DIR } from "@/lib/admin/config";
import { parseEntry, serializeEntry } from "@/lib/admin/entries";
import * as github from "@/lib/admin/github";
import { assetName, assetPath, toAvif, UploadError } from "@/lib/admin/images";
import { SPECS, type CollectionSpec, type Draft } from "@/lib/admin/spec";

/**
 * A filename starting with `_` is the documented way to keep an entry in the
 * repository but off the site, so the admin treats it as a flag on the entry
 * rather than as part of its name.
 */
const HIDDEN_PREFIX = "_";

export function fileName(slug: string, hidden: boolean): string {
  return `${hidden ? HIDDEN_PREFIX : ""}${slug}.md`;
}

export function contentPath(spec: CollectionSpec, slug: string, hidden: boolean): string {
  return `${REPO_CONTENT_DIR}/${spec.collection}/${fileName(slug, hidden)}`;
}

/** `learning-hub.md` and `_draft.md`; `README.md` and dotfiles are not entries. */
function entryFromName(name: string): { slug: string; hidden: boolean } | null {
  if (!/\.mdx?$/.test(name)) return null;
  if (name.startsWith(".") || /^readme\./i.test(name)) return null;
  const hidden = name.startsWith(HIDDEN_PREFIX);
  const slug = name.replace(/\.mdx?$/, "").slice(hidden ? 1 : 0);
  return slug ? { slug, hidden } : null;
}

export type EntrySummary = {
  slug: string;
  hidden: boolean;
  path: string;
  sha: string;
  title: string;
  /** The `date` field for posts, the `order` field for projects. May be empty. */
  meta: string;
};

/**
 * Every entry in a folder, newest or lowest-ordered first.
 *
 * One request for the listing and one per file, because the contents API has no
 * way to ask for several files at once and a list showing only filenames is not
 * worth much. There are a couple of dozen entries at most.
 */
export async function listEntries(token: string, spec: CollectionSpec): Promise<EntrySummary[]> {
  const dir = `${REPO_CONTENT_DIR}/${spec.collection}`;
  const files = (await github.listDir(token, dir))
    .filter((file) => file.type === "file")
    .map((file) => ({ file, entry: entryFromName(file.name) }))
    .filter((item): item is { file: github.DirEntry; entry: { slug: string; hidden: boolean } } =>
      Boolean(item.entry),
    );

  const summaries = await Promise.all(
    files.map(async ({ file, entry }): Promise<EntrySummary> => {
      const contents = await github.readFile(token, file.path);
      const draft = contents ? parseEntry(spec, entry.slug, contents.text) : null;
      const title = (draft?.values.title as string) || entry.slug;
      const meta = String(draft?.values.date ?? draft?.values.order ?? "");
      return {
        slug: entry.slug,
        hidden: entry.hidden,
        path: file.path,
        sha: file.sha,
        title,
        meta,
      };
    }),
  );

  // Posts read best newest first, projects in the order they are shown.
  return summaries.sort((a, b) =>
    spec.collection === "blog"
      ? b.meta.localeCompare(a.meta) || a.slug.localeCompare(b.slug)
      : (Number(a.meta) || Number.POSITIVE_INFINITY) -
          (Number(b.meta) || Number.POSITIVE_INFINITY) || a.slug.localeCompare(b.slug),
  );
}

export type LoadedEntry = { draft: Draft; hidden: boolean; sha: string; path: string };

/**
 * One entry, whether or not its filename is prefixed. Returns `null` when there
 * is no such file, which the page turns into a 404.
 */
export async function loadEntry(
  token: string,
  spec: CollectionSpec,
  slug: string,
): Promise<LoadedEntry | null> {
  for (const hidden of [false, true]) {
    const path = contentPath(spec, slug, hidden);
    const contents = await github.readFile(token, path);
    if (contents)
      return { draft: parseEntry(spec, slug, contents.text), hidden, sha: contents.sha, path };
  }
  return null;
}

export type SaveResult = { path: string; commit: github.Commit };

/**
 * Write a draft back.
 *
 * Renaming — a new slug, or hiding and unhiding an entry — changes the filename,
 * and the contents API has no move: it takes a write and a delete, so it takes
 * two commits. The write goes first, so an interrupted rename leaves a copy
 * rather than nothing at all.
 */
export async function saveEntry(
  token: string,
  spec: CollectionSpec,
  draft: Draft,
  hidden: boolean,
  previous?: { path: string; sha: string },
): Promise<SaveResult> {
  const path = contentPath(spec, draft.slug, hidden);
  const markdown = serializeEntry(spec, draft);
  const title = (draft.values.title as string) || draft.slug;
  const noun = spec.label.toLowerCase();

  const moving = previous && previous.path !== path;

  if (moving || !previous) {
    const existing = await github.readFile(token, path);
    if (existing)
      throw new Error(
        `content/${spec.collection}/${fileName(draft.slug, hidden)} already exists. Pick another filename.`,
      );
  }

  const commit = await github.writeFile(token, {
    path,
    content: markdown,
    message: previous
      ? moving
        ? `🚚 Move the "${title}" ${noun} to ${fileName(draft.slug, hidden)}`
        : `✏️ Update the "${title}" ${noun}`
      : `📝 Add the "${title}" ${noun}`,
    sha: moving ? undefined : previous?.sha,
  });

  if (moving && previous)
    await github.deleteFile(token, {
      path: previous.path,
      sha: previous.sha,
      message: `🔥 Remove ${previous.path.split("/").pop()}, moved`,
    });

  return { path, commit };
}

export async function removeEntry(
  token: string,
  spec: CollectionSpec,
  entry: { path: string; sha: string; title: string },
): Promise<github.Commit> {
  return github.deleteFile(token, {
    path: entry.path,
    sha: entry.sha,
    message: `🔥 Remove the "${entry.title}" ${spec.label.toLowerCase()}`,
  });
}

export type UploadResult = {
  /** What goes into the frontmatter, e.g. `gh:blog/homelab/rack.avif`. */
  reference: string;
  /** Bytes written, so the editor can say how much the conversion saved. */
  bytes: number;
  commit: github.Commit;
};

/**
 * Convert a picture to AVIF and commit it under `assets/`, returning the `gh:`
 * reference for the frontmatter. The name comes from the uploaded file; a name
 * already taken in that folder gets a counter rather than overwriting it.
 */
export async function uploadPicture(
  token: string,
  spec: CollectionSpec,
  entrySlug: string,
  file: { name: string; bytes: Uint8Array },
): Promise<UploadResult> {
  const avif = await toAvif(file.bytes);
  const base = assetName(file.name);

  let name = base;
  for (let attempt = 2; attempt <= 20; attempt += 1) {
    const taken = await github.readFile(
      token,
      `${REPO_ASSET_DIR}/${assetPath(spec.collection, entrySlug, name)}`,
    );
    if (!taken) break;
    name = `${base}-${attempt}`;
    if (attempt === 20)
      throw new UploadError(`Too many pictures named "${base}". Rename the file.`);
  }

  const below = assetPath(spec.collection, entrySlug, name);
  const commit = await github.writeFile(token, {
    path: `${REPO_ASSET_DIR}/${below}`,
    content: avif,
    message: `🖼️ Add ${name}.avif for the "${entrySlug}" ${spec.label.toLowerCase()}`,
  });

  return { reference: `${GITHUB_PREFIX}${below}`, bytes: avif.byteLength, commit };
}

/** The entry's page on the live site, once the branch has been rebuilt. */
export function livePath(spec: CollectionSpec, slug: string): string {
  return `${spec.route}/${slug}`;
}

/** Where to look at the file itself, for the times a diff is the clearer answer. */
export function githubUrl(path: string): string {
  return `https://github.com/${REPO}/blob/${BRANCH}/${path}`;
}

export { SPECS };
