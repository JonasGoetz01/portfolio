import Image from "next/image";

type Props = {
  /** Path under /public. Leave empty to show the placeholder. */
  src?: string;
  /** Shown inside the placeholder and used as alt text once an image exists. */
  hint: string;
  className?: string;
  /** Zoom applied on top of the cover crop, mirroring the design's framing. */
  scale?: number;
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
        className="object-cover"
        style={scale ? { transform: `scale(${scale})` } : undefined}
      />
    </div>
  );
}
