import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/content";
import { getProjects } from "@/lib/projects";

/**
 * Built from the content folders, so a new Markdown file appears in the sitemap
 * without anyone remembering to add it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/resume", "/projects", "/blog"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projects = getProjects().map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const posts = getPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    // Only dated posts carry a meaningful last-modified date.
    ...(post.date ? { lastModified: new Date(post.date) } : {}),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projects, ...posts];
}
