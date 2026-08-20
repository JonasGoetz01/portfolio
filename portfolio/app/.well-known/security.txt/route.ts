import { EMAIL, SITE_URL } from "@/lib/content";

export const dynamic = "force-static";

/**
 * RFC 9116. The expiry is one year from the build, so every deploy renews it —
 * a stale `Expires` is what makes a security.txt worthless.
 */
export function GET() {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);

  const body = [
    `Contact: mailto:${EMAIL}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, "Z")}`,
    "Preferred-Languages: en, de",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
