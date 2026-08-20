import ImageSlot from "./image-slot";
import type { Block } from "@/lib/content-files";

/**
 * Renders a body written in a content Markdown file: paragraphs, plus any
 * pictures dropped between them. Used by project detail pages and blog posts.
 */
export default function ContentBlocks({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) =>
        block.kind === "image" ? (
          <ImageSlot
            key={block.id}
            src={block.src}
            hint={block.alt}
            className="my-3 h-[300px] w-full"
            sizes="(max-width: 900px) 100vw, 820px"
          />
        ) : (
          <p key={block.id} className="max-w-[62ch] text-[15.5px] leading-relaxed text-pretty">
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}
