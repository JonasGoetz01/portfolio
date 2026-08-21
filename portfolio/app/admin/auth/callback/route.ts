/**
 * Step two: GitHub sends the browser back here with a code. Exchange it for a
 * token, ask GitHub who the token belongs to, and let them in only if that login
 * is on the allowlist.
 *
 * The token is never shown to the browser — it goes into the encrypted session
 * cookie and is used server-side to make the commits.
 */

import { timingSafeEqual } from "node:crypto";

import { redirect } from "next/navigation";

import { startSession, takeState } from "@/lib/admin/auth";
import { adminConfig, isAllowed } from "@/lib/admin/config";
import { GitHubError, viewerLogin } from "@/lib/admin/github";
import { exchangeCode } from "@/lib/admin/oauth";

/** Constant-time compare that does not leak the length through a throw. */
function sameState(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request): Promise<void> {
  const result = adminConfig();
  if (!result.ok) redirect("/admin/login");

  const params = new URL(request.url).searchParams;
  const expected = await takeState();

  if (params.get("error")) redirect("/admin/login?problem=denied");

  const code = params.get("code") ?? "";
  const state = params.get("state") ?? "";
  if (!code || !state || !expected || !sameState(state, expected))
    redirect("/admin/login?problem=state");

  let token: string;
  try {
    token = await exchangeCode(code, result.config);
  } catch {
    redirect("/admin/login?problem=exchange");
  }

  let login: string;
  try {
    login = await viewerLogin(token);
  } catch (error) {
    redirect(
      error instanceof GitHubError && error.status === 401
        ? "/admin/login?problem=exchange"
        : "/admin/login?problem=github",
    );
  }

  if (!isAllowed(login, result.config)) redirect("/admin/login?problem=forbidden");

  await startSession(login, token, result.config.sessionSecret);
  redirect("/admin");
}
