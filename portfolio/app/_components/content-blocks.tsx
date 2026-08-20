import ImageSlot from "./image-slot";
import type { MarkdownBlock } from "@/lib/markdown";

/**
 * Renders a Markdown body: runs of prose as HTML inside `.prose` (styled in
 * globals.css), and any picture on its own line as a `next/image` figure so it
 * gets optimised and falls back to a labelled placeholder while missing.
 *
 * The HTML comes from the repo's own content files through `renderMarkdown`, so
 * there is no untrusted input here.
 */
export default function ContentBlocks({ blocks }: { blocks: MarkdownBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block) =>
        block.kind === "image" ? (
          <figure key={block.id} className="my-6 flex flex-col gap-[10px]">
            <ImageSlot
              src={block.src}
              hint={block.alt}
              className="h-[340px] w-full"
              sizes="(max-width: 900px) 100vw, 820px"
            />
            {block.caption && (
              <figcaption className="font-mono text-[11.5px] leading-relaxed text-dim">
                {block.caption}
              </figcaption>
            )}
          </figure>
        ) : (
          <div key={block.id} className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />
        ),
      )}
    </div>
  );
}
