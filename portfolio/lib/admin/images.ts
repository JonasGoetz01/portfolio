/**
 * Pictures are converted before they are committed, not after.
 *
 * `.github/workflows/images.yml` exists because pictures are often dropped into
 * `assets/` through the GitHub web UI, which cannot convert anything — so a
 * workflow re-commits them as AVIF. An upload from here arrives as AVIF
 * already, at the same quality the workflow's ImageMagick uses, so that
 * workflow has nothing left to do and the picture is the right size the moment
 * it lands.
 *
 * Metadata is not carried over. sharp drops it unless asked to keep it, which is
 * the behaviour a site with a privacy page wants: no camera serial, no GPS.
 */

import sharp from "sharp";

/** The same `QUALITY` default as `image-optimizer/convert.sh`. */
export const AVIF_QUALITY = 50;

/** Above this an upload is refused rather than tying up the server on it. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/**
 * Rasterising an SVG is the one conversion that loses rather than saves: it is
 * already small, already sharp at any size, and it can pull in outside
 * references on the way through. Commit those to `public/` by hand instead.
 */
export const REFUSED_TYPES = ["image/svg+xml"];

export class UploadError extends Error {}

/**
 * AVIF bytes for whatever came in. EXIF orientation is applied while the
 * orientation tag is still there to read — `rotate()` with no argument does
 * exactly that, and dropping it is how a phone photo ends up sideways.
 */
export async function toAvif(input: Uint8Array): Promise<Uint8Array> {
  try {
    return await sharp(input, { failOn: "error" })
      .rotate()
      .avif({ quality: AVIF_QUALITY })
      .toBuffer();
  } catch (cause) {
    throw new UploadError(
      `That file could not be read as a picture: ${cause instanceof Error ? cause.message : "unknown error"}`,
    );
  }
}

/**
 * A filename fit for a URL, from whatever the file was called on the way in.
 * `Sommerlager Gruppe 2.JPG` becomes `sommerlager-gruppe-2`.
 */
export function assetName(filename: string): string {
  const base = filename.replace(/\.[^./\\]+$/, "").replace(/^.*[/\\]/, "");
  const slug = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "picture";
}

/**
 * Where a picture for this entry belongs, below `assets/`. Grouping by entry is
 * what `content/README.md` documents, and it keeps one post's pictures together
 * rather than in a flat pile.
 */
export function assetPath(collection: string, entrySlug: string, name: string): string {
  return [collection, entrySlug, `${name}.avif`].filter(Boolean).join("/");
}
