import { describe, expect, it } from "vitest";

import { getPost, getPosts } from "./blog";
import { getProject, getProjects } from "./projects";

/**
 * These run against the real `content/` folder, so they double as a guard on the
 * content itself: a malformed file fails here as well as during `next build`.
 */
describe("getProjects", () => {
  const projects = getProjects();

  it("finds the project files", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("gives every project a unique, URL-safe slug", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("sorts by order, then slug", () => {
    const keys = projects.map((p) => [p.order, p.slug] as const);
    const sorted = [...keys].sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]));
    expect(keys).toEqual(sorted);
  });

  it("never yields an entry without a title", () => {
    for (const project of projects) expect(project.title).not.toBe("");
  });

  it("looks an entry up by slug and misses cleanly", () => {
    expect(getProject(projects[0].slug)?.slug).toBe(projects[0].slug);
    expect(getProject("does-not-exist")).toBeUndefined();
  });
});

describe("getPosts", () => {
  const posts = getPosts();

  it("finds the post files with unique slugs", () => {
    expect(posts.length).toBeGreaterThan(0);
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
  });

  it("puts undated posts before dated ones, then sorts dated newest first", () => {
    const dated = posts.filter((p) => p.date);
    const undated = posts.filter((p) => !p.date);
    const firstDated = posts.findIndex((p) => p.date);
    if (firstDated !== -1) {
      expect(posts.slice(0, firstDated).length).toBe(undated.length);
    }
    const dates = dated.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("falls back to the ISO date when no dateLabel is given", () => {
    for (const post of posts) {
      if (post.date && !post.dateLabel) expect.unreachable("dateLabel should never be empty");
    }
  });

  it("looks a post up by slug and misses cleanly", () => {
    expect(getPost(posts[0].slug)?.slug).toBe(posts[0].slug);
    expect(getPost("does-not-exist")).toBeUndefined();
  });

  it("skips README and underscore-prefixed files", () => {
    expect(posts.map((p) => p.slug)).not.toContain("README");
    for (const post of posts) expect(post.slug.startsWith("_")).toBe(false);
  });
});
