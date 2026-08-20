import Link from "next/link";

import PageIntro from "../_components/page-intro";
import { content } from "@/lib/content";
import type { Post } from "@/lib/blog";

export default function BlogView({ posts }: { posts: Post[] }) {
  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={content.blogPage.title} intro={content.blogPage.intro} />
      <div className="border-t border-line">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="grid gap-6 border-b border-line py-6 transition-colors hover:bg-surface sm:[grid-template-columns:110px_1fr]"
          >
            <span className="font-mono text-xs text-dim">{post.dateLabel}</span>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{post.title}</h2>
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-dim text-pretty">
                {post.excerpt}
              </p>
              {post.state && <span className="font-mono text-[11px] text-brand">{post.state}</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
