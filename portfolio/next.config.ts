import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Project pictures may either be committed to `public/` or hosted on GitHub
     * and referenced by URL. next/image refuses remote hosts it has not been
     * told about, so the GitHub ones are allowed here.
     *
     * - `raw.githubusercontent.com` — any file committed to a public repo.
     * - `*.githubusercontent.com` — where release assets and the
     *   `github.com/user-attachments` links redirect to.
     * - `github.com` — narrowed to the two paths that serve files: attachments
     *   dragged into an issue or PR, and release downloads.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/user-attachments/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/*/*/releases/download/**",
      },
    ],
  },
};

export default nextConfig;
