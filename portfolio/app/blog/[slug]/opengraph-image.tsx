import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../_og/card";
import { getPost, getPosts } from "@/lib/blog";

export const dynamic = "force-static";
export const runtime = "nodejs";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** One image per post file, generated at build time. */
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  return ogCard({
    eyebrow: [post?.dateLabel, post?.state].filter(Boolean).join(" · ") || "BLOG",
    title: post?.title ?? "Post",
    subtitle: post?.excerpt,
  });
}
