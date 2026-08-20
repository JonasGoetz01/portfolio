/**
 * The blog's RSS document, built as a pure string from the same loader the pages
 * use. Kept out of the route handler so it can be tested directly.
 */

import { getPosts, type Post } from "@/lib/blog";
import { EMAIL, SITE_URL, content } from "@/lib/content";

/** XML has five characters that must never appear raw in text or attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const author = `${EMAIL} (${content.hero.name})`;

function item(post: Post): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const body = post.body.trim();

  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    post.date ? `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>` : "",
    post.excerpt ? `      <description>${escapeXml(post.excerpt)}</description>` : "",
    // CDATA is the one place raw text is legal, so `]]>` is the only escape needed.
    body
      ? `      <content:encoded><![CDATA[${body.replace(/]]>/g, "]]&gt;")}]]></content:encoded>`
      : "",
    `      <author>${escapeXml(author)}</author>`,
    "    </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildRssFeed(): string {
  const posts = getPosts();
  const newest = posts.find((post) => post.date)?.date;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(`${content.blogPage.title} — ${content.hero.name}`)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(content.blogPage.intro)}</description>
    <language>en</language>
    <managingEditor>${escapeXml(author)}</managingEditor>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${newest ? `    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>\n` : ""}${posts.map(item).join("\n")}
  </channel>
</rss>
`;
}
