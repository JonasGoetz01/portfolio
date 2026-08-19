"use client";

import PageIntro from "../_components/page-intro";
import { useLanguage } from "@/lib/language";

export default function BlogView() {
  const { t } = useLanguage();

  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={t.blogPage.title} intro={t.blogPage.intro} />
      <div className="border-t border-line">
        {t.posts.map((post) => (
          <article
            key={post.title}
            className="grid gap-6 border-b border-line py-6 sm:[grid-template-columns:110px_1fr]"
          >
            <span className="font-mono text-xs text-dim">{post.date}</span>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{post.title}</h2>
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-dim text-pretty">
                {post.excerpt}
              </p>
              <span className="font-mono text-[11px] text-brand">{post.state}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
