import Link from "next/link";

import ContentBlocks from "../../_components/content-blocks";
import { PostStructuredData } from "../../_components/structured-data";
import ImageSlot from "../../_components/image-slot";
import { content } from "@/lib/content";
import PostNav from "./post-nav";
import type { Post, PostLink } from "@/lib/blog";
import type { MarkdownBlock } from "@/lib/markdown";

export default function PostView({
  post,
  blocks,
  neighbours,
}: {
  post: Post;
  blocks: MarkdownBlock[];
  neighbours: { previous?: PostLink; next?: PostLink };
}) {
  return (
    <article className="animate-rise-fast pt-[72px]">
      <Link
        href="/blog"
        className="mb-7 inline-block font-mono text-[12px] text-dim transition-colors hover:text-ink"
      >
        ← {content.blogPage.back}
      </Link>

      <PostStructuredData
        title={post.title}
        excerpt={post.excerpt}
        slug={post.slug}
        date={post.date}
      />

      <div className="mb-[10px] flex flex-wrap items-center gap-3 font-mono text-[11px]">
        {post.date ? (
          <time dateTime={post.date} className="text-dim">
            {post.dateLabel}
          </time>
        ) : (
          <span className="text-dim">{post.dateLabel}</span>
        )}
        {post.state && <span className="tracking-[0.05em] text-brand">{post.state}</span>}
        <span className="text-dim">{post.readingMinutes} min read</span>
      </div>
      <h1 className="mb-[10px] text-[clamp(30px,8vw,40px)] font-semibold leading-tight tracking-[-0.03em] hyphens-auto break-words">
        {post.title}
      </h1>
      {post.excerpt && (
        <p className="mb-9 max-w-[52ch] text-base leading-relaxed text-dim">{post.excerpt}</p>
      )}

      {post.hero && (
        <ImageSlot
          src={post.hero.src}
          hint={post.hero.alt}
          className="mb-11 h-[320px] w-full"
          sizes="(max-width: 900px) 100vw, 900px"
          priority
        />
      )}

      <ContentBlocks blocks={blocks} />

      <PostNav previous={neighbours.previous} next={neighbours.next} />

      {post.images.length > 0 && (
        <>
          <h2 className="mt-14 mb-5 font-mono text-xs font-medium tracking-[0.06em] text-dim">
            {content.blogPage.gallery}
          </h2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {post.images.map((image) => (
              <ImageSlot
                key={image.src}
                src={image.src}
                hint={image.alt}
                className="h-[220px] w-full"
                sizes="(max-width: 640px) 100vw, 420px"
              />
            ))}
          </div>
        </>
      )}
    </article>
  );
}
