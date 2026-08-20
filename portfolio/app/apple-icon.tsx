import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const runtime = "nodejs";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Same mark at the size iOS asks for when a visitor adds the site to the home screen. */
export default function AppleIcon() {
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
        fontSize: 110,
        fontWeight: 700,
        fontFamily: "sans-serif",
      }}
    >
      j
    </div>,
    size,
  );
}
