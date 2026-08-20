import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../_og/card";
import { content } from "@/lib/content";

export const dynamic = "force-static";
export const runtime = "nodejs";

export const alt = content.impressum.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "LEGAL",
    title: content.impressum.title,
    subtitle: content.impressum.providerLabel,
  });
}
