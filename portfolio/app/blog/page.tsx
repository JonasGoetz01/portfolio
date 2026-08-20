import type { Metadata } from "next";

import BlogView from "./view";
import { content } from "@/lib/content";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: `${content.blogPage.title} — Jonas Götz`,
  alternates: { canonical: "/blog" },
  description: content.blogPage.intro,
};

export default function BlogPage() {
  return <BlogView posts={getPosts()} />;
}
