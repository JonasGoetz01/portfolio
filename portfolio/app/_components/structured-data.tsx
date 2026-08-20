import { EMAIL, GITHUB, LINKEDIN, PORTRAIT, SITE_URL, content } from "@/lib/content";

/**
 * schema.org Person markup, so search engines and AI crawlers read the site as a
 * person rather than guessing from the prose. Rendered on the server as a plain
 * script tag — the JSON is built here, never from user input.
 */
export default function StructuredData() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.hero.name,
    url: SITE_URL,
    image: `${SITE_URL}${PORTRAIT}`,
    email: `mailto:${EMAIL}`,
    jobTitle: "Head of IT",
    description: content.meta.description,
    worksFor: { "@type": "Organization", name: "42 Heilbronn", url: "https://42heilbronn.de" },
    address: { "@type": "PostalAddress", addressLocality: "Heilbronn", addressCountry: "DE" },
    knowsAbout: content.skills,
    sameAs: [GITHUB, LINKEDIN],
  };

  return (
    <script
      type="application/ld+json"
      // Static, server-built JSON — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
    />
  );
}
