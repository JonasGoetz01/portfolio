/**
 * The two bits of the GitHub OAuth handshake that both ends of it need.
 *
 * The callback URL is derived from the request rather than configured, so the
 * same code works on localhost and on the deployed domain — an OAuth app has one
 * callback URL, so development and production each get their own app, and
 * neither needs a variable set. `ADMIN_OAUTH_REDIRECT_URI` overrides it for the
 * setups where the derived value is wrong.
 */

import { headers } from "next/headers";

import type { AdminConfig } from "@/lib/admin/config";

export async function callbackUrl(config: AdminConfig): Promise<string> {
  if (config.redirectUri) return config.redirectUri;

  const list = await headers();
  // Railway terminates TLS and proxies, so the request the app sees is plain
  // http against an internal host. The forwarded headers are the public ones.
  const host =
    list.get("x-forwarded-host")?.split(",")[0]?.trim() || list.get("host") || "localhost:3000";
  const proto =
    list.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${host}/admin/auth/callback`;
}

/** Where to send the browser to sign in. */
export async function authorizeUrl(state: string, config: AdminConfig): Promise<string> {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", await callbackUrl(config));
  // Not a sign-up flow: an account that does not exist cannot be on the
  // allowlist anyway.
  url.searchParams.set("allow_signup", "false");
  return url.toString();
}

/** The access token for a callback code. Throws for anything GitHub refuses. */
export async function exchangeCode(code: string, config: AdminConfig): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: await callbackUrl(config),
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`GitHub refused the code exchange (${response.status})`);

  const body = (await response.json()) as { access_token?: string; error_description?: string };
  if (!body.access_token) throw new Error(body.error_description ?? "GitHub returned no token.");

  return body.access_token;
}
