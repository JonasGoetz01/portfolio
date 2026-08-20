import type { NextConfig } from "next";

/**
 * The site serves only its own markup and styles, fonts self-hosted by
 * next/font, and images from `public/` or GitHub — so the policy can be tight.
 * `unsafe-inline` on styles is required by Next's inlined critical CSS; scripts
 * need it for Next's bootstrap and the JSON-LD tag, and moving to a nonce would
 * mean giving up static rendering.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https://raw.githubusercontent.com https://*.githubusercontent.com",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Nothing gains from advertising the framework version.
  poweredByHeader: false,

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
