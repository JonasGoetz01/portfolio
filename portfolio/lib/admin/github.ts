/**
 * The slice of the GitHub REST API the admin uses: read a directory, read a
 * file, write a file, delete a file. Commits are made with the signed-in user's
 * OAuth token, so the history shows who wrote the post rather than a bot.
 *
 * Writes carry the blob's `sha`. GitHub rejects a mismatch, which is what turns
 * "two tabs open" into an error the editor can explain instead of a silent
 * overwrite.
 */

import { BRANCH, REPO } from "@/lib/admin/config";

const API = "https://api.github.com";

/** Anything the API said no to, with the status kept for the callers. */
export class GitHubError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

async function request(
  token: string,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<unknown> {
  const response = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "goetz.sh-admin",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    // Always the live tree: an edit has to start from what is on the branch now.
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    let message = `GitHub returned ${response.status}`;
    try {
      const parsed = JSON.parse(detail) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      /* Not JSON — the status is all we have to go on. */
    }
    throw new GitHubError(response.status, message);
  }

  return response.status === 204 ? null : response.json();
}

/** The signed-in user's login, which is what the allowlist is checked against. */
export async function viewerLogin(token: string): Promise<string> {
  const user = (await request(token, "/user")) as { login?: unknown };
  if (typeof user.login !== "string" || !user.login)
    throw new GitHubError(502, "GitHub did not return a login for this token.");
  return user.login;
}

export type DirEntry = { name: string; path: string; sha: string; type: string; size: number };

/** One directory listing. A missing directory is empty rather than an error. */
export async function listDir(token: string, path: string): Promise<DirEntry[]> {
  try {
    const body = await request(
      token,
      `/repos/${REPO}/contents/${encodePath(path)}?ref=${encodeURIComponent(BRANCH)}`,
    );
    if (!Array.isArray(body)) return [];
    return body as DirEntry[];
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return [];
    throw error;
  }
}

export type FileContents = { text: string; sha: string };

/** A file's text and blob sha, or `null` when it is not there. */
export async function readFile(token: string, path: string): Promise<FileContents | null> {
  try {
    const body = (await request(
      token,
      `/repos/${REPO}/contents/${encodePath(path)}?ref=${encodeURIComponent(BRANCH)}`,
    )) as { content?: string; encoding?: string; sha?: string; type?: string };

    if (body.type !== "file" || typeof body.sha !== "string") return null;
    // Large blobs come back without content; nothing here is anywhere near the
    // 1 MB cut-off, so an empty string is the honest answer either way.
    const text =
      body.encoding === "base64" && typeof body.content === "string"
        ? Buffer.from(body.content, "base64").toString("utf8")
        : "";
    return { text, sha: body.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export type Commit = { sha: string; url: string };

/**
 * Create or replace a file. `sha` is the blob being replaced — omitted for a new
 * file, required for an edit, and wrong if someone else got there first.
 */
export async function writeFile(
  token: string,
  file: { path: string; content: Uint8Array | string; message: string; sha?: string },
): Promise<Commit> {
  const content = Buffer.from(
    typeof file.content === "string" ? Buffer.from(file.content, "utf8") : file.content,
  ).toString("base64");

  const body = (await request(token, `/repos/${REPO}/contents/${encodePath(file.path)}`, {
    method: "PUT",
    body: {
      message: file.message,
      content,
      branch: BRANCH,
      ...(file.sha ? { sha: file.sha } : {}),
    },
  })) as { commit?: { sha?: string; html_url?: string } };

  return { sha: body.commit?.sha ?? "", url: body.commit?.html_url ?? "" };
}

export async function deleteFile(
  token: string,
  file: { path: string; sha: string; message: string },
): Promise<Commit> {
  const body = (await request(token, `/repos/${REPO}/contents/${encodePath(file.path)}`, {
    method: "DELETE",
    body: { message: file.message, sha: file.sha, branch: BRANCH },
  })) as { commit?: { sha?: string; html_url?: string } };

  return { sha: body.commit?.sha ?? "", url: body.commit?.html_url ?? "" };
}

/** Path segments are escaped; the slashes between them are not. */
function encodePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
