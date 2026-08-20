import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const runtime = "nodejs";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** A generated mark, so the site has no binary icon to keep in sync. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#c2410c",
        color: "#ffffff",
        fontSize: 300,
        fontWeight: 700,
        fontFamily: "sans-serif",
      }}
    >
      j
    </div>,
    size,
  );
}
