/**
 * The admin session, sealed into a single cookie value.
 *
 * The session carries the signed-in user's GitHub access token, because the
 * commits are made as that user — so it is encrypted, not merely signed:
 * AES-256-GCM with a key derived from `ADMIN_SESSION_SECRET`. The tag makes a
 * tampered or truncated cookie fail to open rather than decode into something.
 *
 * There is no session store. Rotating `ADMIN_SESSION_SECRET` invalidates every
 * session, which is the whole recovery procedure.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

export type Session = {
  /** GitHub login, as GitHub spells it. */
  login: string;
  /** OAuth access token. Never leaves the server. */
  token: string;
  /** Expiry, epoch milliseconds. */
  exp: number;
};

export const SESSION_COOKIE = "admin_session";
export const STATE_COOKIE = "admin_oauth_state";

/** Long enough to write a post without being asked to sign in again. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
/** Fixed: the secret is high-entropy already, and a stored salt buys nothing. */
const SALT = "portfolio-admin-session";

const keyCache = new Map<string, Buffer>();

function keyFor(secret: string): Buffer {
  const cached = keyCache.get(secret);
  if (cached) return cached;
  // N=16384 rather than the usual 32768: this runs on every admin request, and
  // the input is a long random secret rather than a human-chosen password.
  const key = scryptSync(secret, SALT, 32, { N: 16384, r: 8, p: 1 });
  keyCache.set(secret, key);
  return key;
}

/** `iv | ciphertext | tag`, base64url — safe to hand to Set-Cookie as is. */
export function seal(session: Session, secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, keyFor(secret), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return Buffer.concat([iv, body]).toString("base64url");
}

/**
 * The session a cookie holds, or `null` for anything that is not one: a value
 * from an older secret, a tampered one, or an expired one. Callers treat every
 * `null` the same way — send the visitor to sign in.
 */
export function open(value: string | undefined, secret: string, now = Date.now()): Session | null {
  if (!value) return null;

  let plain: string;
  try {
    const raw = Buffer.from(value, "base64url");
    if (raw.length <= IV_BYTES + TAG_BYTES) return null;

    const iv = raw.subarray(0, IV_BYTES);
    const ciphertext = raw.subarray(IV_BYTES, raw.length - TAG_BYTES);
    const tag = raw.subarray(raw.length - TAG_BYTES);

    const decipher = createDecipheriv(ALGORITHM, keyFor(secret), iv);
    decipher.setAuthTag(tag);
    plain = decipher.update(ciphertext, undefined, "utf8") + decipher.final("utf8");
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(plain);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const { login, token, exp } = parsed as Partial<Session>;
  if (typeof login !== "string" || !login) return null;
  if (typeof token !== "string" || !token) return null;
  if (typeof exp !== "number" || exp <= now) return null;

  return { login, token, exp };
}
