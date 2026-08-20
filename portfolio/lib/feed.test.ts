import { describe, expect, it } from "vitest";

import { getPosts } from "./blog";
import { buildRssFeed, escapeXml } from "./feed";

describe("escapeXml", () => {
  it("escapes all five XML-significant characters", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;",
    );
  });

  it("escapes the ampersand before the entities it introduces", () => {
    expect(escapeXml("&lt;")).toBe("&amp;lt;");
  });
});

/** Built from the real content folder, so this guards the feed and the posts. */
describe("buildRssFeed", () => {
  const xml = buildRssFeed();

  it("is well-formed RSS with a self-referencing atom link", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('rel="self"');
    expect(xml.trimEnd().endsWith("</rss>")).toBe(true);
  });

  it("emits one item per post, each with an absolute permalink guid", () => {
    const posts = getPosts();
    expect(xml.match(/<item>/g) ?? []).toHaveLength(posts.length);
    for (const post of posts) {
      expect(xml).toContain(`<guid isPermaLink="true">https://goetz.sh/blog/${post.slug}</guid>`);
    }
  });

  it("leaves no unescaped angle bracket in text content", () => {
    const text = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "").replace(/<[^>]+>/g, "");
    expect(text).not.toMatch(/[<>]/);
  });

  it("keeps posts in the same order as the blog listing", () => {
    const feedOrder = [...xml.matchAll(/\/blog\/([a-z0-9-]+)<\/link>/g)].map((m) => m[1]);
    expect(feedOrder).toEqual(getPosts().map((post) => post.slug));
  });
});
