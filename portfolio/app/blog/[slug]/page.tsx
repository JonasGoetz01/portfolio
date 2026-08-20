import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostView from "./view";
import { getPost, getPosts } from "@/lib/blog";

type Params = { params: Promise<{ slug: string }> };

/** One static page per file in content/blog/. */
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — Jonas Götz`, description: post.excerpt };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return <PostView post={post} />;
}
