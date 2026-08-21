import type { NextConfig } from "next";

/**
 * The site serves only its own markup and styles, fonts self-hosted by
 * next/font, and images proxied through next/image — so the policy can be tight.
 *
 * `unsafe-inline` on styles is required by Next's inlined critical CSS; scripts
 * need it for Next's bootstrap and the JSON-LD tag, and moving to a nonce would
 * mean giving up static rendering.
 *
 * Development needs two things production does not, so the policy is built per
 * environment rather than shared:
 *
 * - `unsafe-eval`: React uses `eval()` in development to rebuild stack traces
 *   and drive other debugging features. Without it every page logs "eval() is
 *   not supported in this environment". React never uses it in production.
 * - `ws:` on connect-src: the Turbopack HMR socket. `'self'` covers a
 *   same-origin socket in current browsers, but being explicit costs nothing and
 *   survives a proxied dev setup.
 */
function contentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    // Every picture reaches the browser from this origin: next/image proxies the
    // remote ones server-side, and the Markdown renderer routes inline ones the
    // same way. Keeping this at 'self' enforces that — a direct remote <img>
    // would hand a third party the visitor's IP, and is blocked outright.
    "img-src 'self' data: blob:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    // Pointless on http://localhost, and it makes the dev server unreachable
    // in browsers that honour it strictly.
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const CSP = contentSecurityPolicy(process.env.NODE_ENV === "development");

const nextConfig: NextConfig = {
  // Nothing gains from advertising the framework version.
  poweredByHeader: false,

  experimental: {
    /**
     * Server Actions accept a 1 MB body by default, and the admin's picture
     * upload is a Server Action — a photo on its way to being converted to AVIF
     * is many times that.
     *
     * A megabyte above `MAX_UPLOAD_BYTES` in `lib/admin/images.ts` on purpose.
     * This limit counts the raw request body, multipart boundaries and part
     * headers included, so a file exactly on the upload limit would be rejected
     * here as a 413 before the upload check could say what was wrong.
     */
    serverActions: { bodySizeLimit: "26mb" },
  },

  images: {
    /**
     * Project and post pictures may either be committed to `public/` or hosted
     * on GitHub and referenced by URL. next/image refuses remote hosts it has
     * not been told about, so the GitHub ones are allowed here.
     *
     * - `raw.githubusercontent.com` — any file committed to a public repo.
     * - `*.githubusercontent.com` — where release assets and the
     *   `github.com/user-attachments` links redirect to.
     * - `github.com` — narrowed to the two paths that serve files: attachments
     *   dragged into an issue or PR, and release downloads.
     */
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "**.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "github.com", pathname: "/user-attachments/**" },
      { protocol: "https", hostname: "github.com", pathname: "/*/*/releases/download/**" },
    ],
    // Remote pictures rarely change; cache the optimised result for a day.
    minimumCacheTTL: 86_400,
  },

  async headers() {
    return [
      {
        /**
         * The admin is not part of the site: it is behind a GitHub sign-in and
         * has nothing worth indexing. `robots.ts` disallows it too — this is the
         * half that also covers a crawler arriving at a page directly.
         */
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
