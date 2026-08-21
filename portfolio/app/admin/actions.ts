"use server";

/**
 * Everything the editor can do, each guarded by the session.
 *
 * A successful save redirects to the entry's own page rather than returning the
 * new state. Re-reading is how the next save gets a current blob sha, and it
 * means the page you are looking at after saving is the file that is on the
 * branch — not a copy of what was submitted.
 */

import { randomBytes } from "node:crypto";

import { redirect } from "next/navigation";

import { endSession, rememberState, requireSession } from "@/lib/admin/auth";
import { adminConfig } from "@/lib/admin/config";
import { draftFromJson } from "@/lib/admin/entries";
import { GitHubError } from "@/lib/admin/github";
import { MAX_UPLOAD_BYTES, REFUSED_TYPES, UploadError } from "@/lib/admin/images";
import { removeEntry, saveEntry, uploadPicture } from "@/lib/admin/repo";
import { authorizeUrl } from "@/lib/admin/oauth";
import { isCollection, SPECS, validate, type CollectionSpec } from "@/lib/admin/spec";

function specFor(value: FormDataEntryValue | null): CollectionSpec {
  const name = typeof value === "string" ? value : "";
  if (!isCollection(name)) throw new Error(`admin: unknown collection "${name}"`);
  return SPECS[name];
}

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

/** What went wrong, or nothing. A save that worked redirects instead of returning. */
export type SaveState = { problems: string[] } | null;

export async function saveAction(_previous: SaveState, form: FormData): Promise<SaveState> {
  const { session } = await requireSession();
  const spec = specFor(form.get("collection"));

  const draft = draftFromJson(spec, text(form, "draft"));
  const hidden = form.get("hidden") === "on";

  const problems = validate(spec, draft);
  if (problems.length) return { problems };

  const previousPath = text(form, "path");
  const previousSha = text(form, "sha");

  let saved;
  try {
    saved = await saveEntry(
      session.token,
      spec,
      draft,
      hidden,
      previousPath && previousSha ? { path: previousPath, sha: previousSha } : undefined,
    );
  } catch (error) {
    return { problems: [explain(error)] };
  }

  redirect(`/admin/${spec.collection}/${draft.slug}?saved=${encodeURIComponent(saved.commit.sha)}`);
}

export async function deleteAction(form: FormData): Promise<void> {
  const { session } = await requireSession();
  const spec = specFor(form.get("collection"));

  const path = text(form, "path");
  const sha = text(form, "sha");
  if (!path || !sha) redirect("/admin");

  await removeEntry(session.token, spec, { path, sha, title: text(form, "title") });
  redirect(`/admin?removed=${encodeURIComponent(text(form, "slug"))}`);
}

export type UploadState =
  { ok: true; reference: string; bytes: number } | { ok: false; problem: string };

/**
 * Convert one picture and commit it. Called straight from the editor rather than
 * through a form action, because the answer — the `gh:` path — goes into a field
 * rather than onto a new page.
 */
export async function uploadAction(form: FormData): Promise<UploadState> {
  const { session } = await requireSession();
  const spec = specFor(form.get("collection"));

  const slug = text(form, "slug").trim();
  if (!slug)
    return { ok: false, problem: "Give the entry a filename first — pictures go under it." };

  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, problem: "No file arrived." };
  if (file.size > MAX_UPLOAD_BYTES)
    return {
      ok: false,
      problem: `That picture is ${Math.round(file.size / 1024 / 1024)} MB. The limit is ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`,
    };
  if (REFUSED_TYPES.includes(file.type))
    return { ok: false, problem: `${file.type} cannot be converted. Commit it by hand.` };

  try {
    const result = await uploadPicture(session.token, spec, slug, {
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
    return { ok: true, reference: result.reference, bytes: result.bytes };
  } catch (error) {
    return { ok: false, problem: explain(error) };
  }
}

/**
 * Start the sign-in. A Server Action rather than a link to a route handler: this
 * has to set the `state` cookie before the browser leaves for GitHub, and posting
 * to this origin is what the site's own `form-action 'self'` policy allows.
 */
export async function signInAction(): Promise<void> {
  const result = adminConfig();
  if (!result.ok) redirect("/admin/login");

  const state = randomBytes(24).toString("base64url");
  await rememberState(state);

  redirect(await authorizeUrl(state, result.config));
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/** Failures worth a sentence rather than a stack trace. */
function explain(error: unknown): string {
  if (error instanceof UploadError) return error.message;

  if (error instanceof GitHubError) {
    if (error.status === 409 || error.status === 422)
      return "The file changed on GitHub since this page was opened. Reload and apply the edit again.";
    if (error.status === 401) return "The GitHub sign-in expired. Sign in again.";
    if (error.status === 403)
      return "GitHub refused the write. Check the OAuth app's scope covers this repository.";
    return `GitHub said: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}
