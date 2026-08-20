import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { EMAIL, SITE_URL, content } from "@/lib/content";

/** Every Open Graph image on the site is 1200x630 PNG. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const TOKENS = {
  bg: "#ffffff",
  surface: "#f7f7f7",
  line: "#e5e5e5",
  ink: "#0f0f0f",
  dim: "#6d6d6d",
  brand: "#c2410c",
} as const;

/** "goetz.sh" — the footer shows the domain, not a repeat of the name. */
const SITE_HOST = new URL(SITE_URL).host;

/**
 * Read once per build. `next build` renders every one of these routes, so
 * caching the buffers keeps it from re-reading the fonts a dozen times.
 */
let assets: Promise<{ regular: Buffer; bold: Buffer; portrait: string }> | undefined;

function loadAssets() {
  assets ??= (async () => {
    const [regular, bold, portrait] = await Promise.all([
      readFile(join(process.cwd(), "fonts", "Inter-Regular.ttf")),
      readFile(join(process.cwd(), "fonts", "Inter-Bold.ttf")),
      readFile(join(process.cwd(), "public", "jonas.jpg")),
    ]);
    return {
      regular,
      bold,
      portrait: `data:image/jpeg;base64,${portrait.toString("base64")}`,
    };
  })();
  return assets;
}

type CardProps = {
  /** Small mono line above the title, e.g. "PROJECT" or a project's own kind. */
  eyebrow: string;
  title: string;
  /** One or two lines under the title. Trimmed to keep the card readable. */
  subtitle?: string;
  /** Small tags along the bottom, e.g. a project's stack. */
  tags?: string[];
  /** Show the portrait. Used by the home card, off for content pages. */
  portrait?: boolean;
};

/**
 * One template for every share preview, so a link to any page looks like it
 * belongs to the same site. Styling is inline because Satori supports only a
 * subset of CSS and no external stylesheet.
 */
export async function ogCard({ eyebrow, title, subtitle, tags = [], portrait }: CardProps) {
  const { regular, bold, portrait: portraitData } = await loadAssets();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: TOKENS.bg,
        fontFamily: "Inter",
        padding: "64px 80px",
        justifyContent: "space-between",
      }}
    >
      {/* Brand rule along the top edge. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 10,
          background: TOKENS.brand,
        }}
      />

      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 56 }}>
        {portrait && (
          <img
            src={portraitData}
            alt=""
            width={220}
            height={220}
            style={{ borderRadius: 9999, objectFit: "cover" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 2,
              color: TOKENS.brand,
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: title.length > 40 ? 62 : 76,
              lineHeight: 1.05,
              fontWeight: 700,
              color: TOKENS.ink,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 28, lineHeight: 1.4, color: TOKENS.dim }}>
              {subtitle.length > 150 ? `${subtitle.slice(0, 149)}…` : subtitle}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                border: `2px solid ${TOKENS.line}`,
                background: TOKENS.surface,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 22,
                color: TOKENS.dim,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: TOKENS.ink }}>{SITE_HOST}</div>
          <div style={{ fontSize: 22, color: TOKENS.dim }}>{EMAIL}</div>
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: regular, weight: 400 as const },
        { name: "Inter", data: bold, weight: 700 as const },
      ],
    },
  );
}
