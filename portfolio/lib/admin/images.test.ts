import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { assetName, assetPath, toAvif, UploadError } from "./images";

/** A small real picture, so the conversion is exercised rather than mocked. */
async function png(width = 64, height = 48): Promise<Uint8Array> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 194, g: 65, b: 12 } },
  })
    .png()
    .toBuffer();
}

describe("toAvif", () => {
  it("returns AVIF", async () => {
    const out = await toAvif(await png());
    // `ftyp` at offset 4, then the brand: an AVIF file rather than a copied PNG.
    expect(Buffer.from(out).subarray(4, 12).toString("latin1")).toContain("ftyp");
    expect((await sharp(out).metadata()).format).toBe("heif");
  });

  it("keeps the picture's size", async () => {
    const meta = await sharp(await toAvif(await png(120, 90))).metadata();
    expect([meta.width, meta.height]).toEqual([120, 90]);
  });

  it("drops the metadata that came in with it", async () => {
    const withExif = await sharp({
      create: { width: 32, height: 32, channels: 3, background: "#fff" },
    })
      .withExif({ IFD0: { Copyright: "Jonas Götz", Software: "a camera" } })
      .jpeg()
      .toBuffer();

    expect((await sharp(withExif).metadata()).exif).toBeDefined();
    expect((await sharp(await toAvif(withExif)).metadata()).exif).toBeUndefined();
  });

  it("turns a file that is not a picture into an explainable failure", async () => {
    await expect(toAvif(new TextEncoder().encode("not a picture"))).rejects.toBeInstanceOf(
      UploadError,
    );
  });
});

describe("assetName", () => {
  it("makes a filename fit for a URL", () => {
    expect(assetName("Sommerlager Gruppe 2.JPG")).toBe("sommerlager-gruppe-2");
    expect(assetName("/tmp/IMG_0421.jpeg")).toBe("img-0421");
    expect(assetName("Müller & Söhne.png")).toBe("muller-sohne");
    expect(assetName("already-fine.avif")).toBe("already-fine");
  });

  it("never returns an empty name", () => {
    expect(assetName("___.png")).toBe("picture");
    expect(assetName(".png")).toBe("picture");
  });

  it("does not end on a hyphen after being cut short", () => {
    expect(assetName(`${"a".repeat(59)} tail.png`)).toBe("a".repeat(59));
  });
});

describe("assetPath", () => {
  it("groups a picture under its entry", () => {
    expect(assetPath("blog", "homelab", "rack")).toBe("blog/homelab/rack.avif");
  });

  it("falls back to the folder when there is no entry to group under", () => {
    expect(assetPath("blog", "", "rack")).toBe("blog/rack.avif");
  });
});
