import type { Metadata } from "next";

import BlogView from "./view";
import { content, DEFAULT_LANG } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content[DEFAULT_LANG].blogPage.title} — Jonas Götz`,
  description: content[DEFAULT_LANG].blogPage.intro,
};

export default function BlogPage() {
  return <BlogView />;
}
