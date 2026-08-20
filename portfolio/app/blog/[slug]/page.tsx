import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostView from "./view";
import { getPost, getPostNeighbours, getPosts } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";

type Params = { params: Promise<{ slug: string }> };

/** Only the slugs in the content folder exist; anything else is a 404 at build time. */
export const dynamicParams = false;

/** One static page per file in content/blog/. */
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Jonas Götz`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      ...(post.date ? { publishedTime: post.date, modifiedTime: post.date } : {}),
      authors: ["Jonas Götz"],
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const blocks = await renderMarkdown(post.body, post.title, post.slug);
  return <PostView post={post} blocks={blocks} neighbours={getPostNeighbours(post.slug)} />;
}
