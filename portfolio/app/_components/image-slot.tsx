import Image from "next/image";
import type { CSSProperties } from "react";

type Props = {
  /** Path under /public. Leave empty to show the placeholder. */
  src?: string;
  /** Shown inside the placeholder and used as alt text once an image exists. */
  hint: string;
  className?: string;
  /** Zoom applied on top of the cover crop, mirroring the design's framing. */
  scale?: number;
  /**
   * Zoom from the `sm` breakpoint up. A wide phone frame and a narrow desktop
   * one want different crops of the same picture, and one element cannot carry
   * two inline transforms — so the values go in as custom properties and
   * `.img-zoom` in globals.css picks the right one per breakpoint.
   */
  scaleSm?: number;
  sizes?: string;
  priority?: boolean;
};

/**
 * A picture frame with a fixed shape: renders the image once one is dropped
 * into /public, and a labelled placeholder until then.
 */
export default function ImageSlot({
  src,
  hint,
  className = "",
  scale,
  scaleSm,
  sizes = "(max-width: 768px) 100vw, 400px",
  priority,
}: Props) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-dashed border-line bg-surface p-4 text-center font-mono text-[11px] leading-relaxed text-dim ${className}`}
      >
        {hint}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-md bg-surface ${className}`}>
      <Image
        src={src}
        alt={hint}
        fill
        sizes={sizes}
        priority={priority}
        /*
          Written as whole literals, not `\`object-cover${...}\``: Tailwind
          extracts class names statically from the source text, and a utility
          sitting immediately before `${` is not recognised — which silently left
          every picture on `object-fit: fill`, stretching it into its frame
          instead of cropping. tests/mobile.spec.ts now guards this.
        */
        className={scale ? "object-cover img-zoom" : "object-cover"}
        style={
          scale
            ? ({
                "--img-scale": scale,
                ...(scaleSm ? { "--img-scale-sm": scaleSm } : {}),
              } as CSSProperties)
            : undefined
        }
      />
    </div>
  );
}
