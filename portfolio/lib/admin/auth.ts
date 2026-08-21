/**
 * The cookie side of the session, and the guard every admin page, route and
 * action goes through.
 *
 * There is no middleware. The check lives at the point where the token is used,
 * which is the only place it cannot be forgotten — a page that does not call
 * `requireSession` has nothing to leak, because reading GitHub needs the token
 * the session holds.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminConfig, type AdminConfig } from "@/lib/admin/config";
import {
  open,
  seal,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  STATE_COOKIE,
  type Session,
} from "@/lib/admin/session";

/**
 * `lax`, not `strict`: coming back from github.com is a cross-site navigation,
 * and a strict cookie would not be sent with it — the callback would set a
 * session and the next request would arrive without one.
 *
 * The path keeps it off every other page on the site. Nothing outside `/admin`
 * has any use for it, and a cookie that is not sent cannot leak.
 */
function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: maxAgeSeconds,
  };
}

/** The session this request carries, or `null`. Never throws. */
export async function currentSession(): Promise<Session | null> {
  const config = adminConfig();
  if (!config.ok) return null;
  const jar = await cookies();
  return open(jar.get(SESSION_COOKIE)?.value, config.config.sessionSecret);
}

/**
 * The session, or a redirect to the sign-in page. Everything that touches the
 * repository starts here.
 */
export async function requireSession(): Promise<{ session: Session; config: AdminConfig }> {
  const config = adminConfig();
  if (!config.ok) redirect("/admin/login");

  const jar = await cookies();
  const session = open(jar.get(SESSION_COOKIE)?.value, config.config.sessionSecret);
  if (!session) redirect("/admin/login");

  return { session, config: config.config };
}

export async function startSession(login: string, token: string, secret: string): Promise<void> {
  const session: Session = { login, token, exp: Date.now() + SESSION_TTL_MS };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, seal(session, secret), cookieOptions(Math.floor(SESSION_TTL_MS / 1000)));
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", cookieOptions(0));
}

/* -------------------------------------------------------------------------- */
/*  OAuth state                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The `state` parameter, held in a short-lived cookie so the callback can prove
 * the redirect it is handling belongs to a sign-in this browser actually started.
 */
export async function rememberState(state: string): Promise<void> {
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, cookieOptions(10 * 60));
}

/** Reads the state and clears it — one redirect may only be handled once. */
export async function takeState(): Promise<string | undefined> {
  const jar = await cookies();
  const value = jar.get(STATE_COOKIE)?.value;
  jar.set(STATE_COOKIE, "", cookieOptions(0));
  return value;
}
