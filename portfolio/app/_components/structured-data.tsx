import { EMAIL, GITHUB, LINKEDIN, PORTRAIT, SITE_URL, content } from "@/lib/content";

/**
 * schema.org markup, so search engines and AI crawlers read the site as a person
 * with a work history rather than guessing from the prose. Every value comes from
 * `lib/content.ts` or a content file — nothing here is user input, which is why
 * the JSON can go straight into a script tag.
 */

/** `#person` is referenced by the other graphs, so the entity is stated once. */
const PERSON_ID = `${SITE_URL}/#person`;

function jsonLd(data: unknown) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/** The site-wide Person and WebSite graph, rendered once from the root layout. */
export function SiteStructuredData() {
  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: content.hero.name,
    url: SITE_URL,
    image: `${SITE_URL}${PORTRAIT}`,
    email: `mailto:${EMAIL}`,
    jobTitle: content.jobs[0]?.role,
    description: content.meta.description,
    address: { "@type": "PostalAddress", addressLocality: "Heilbronn", addressCountry: "DE" },
    knowsAbout: content.skills,
    sameAs: [GITHUB, LINKEDIN],
    // The résumé, expressed as data rather than only as rendered text.
    hasOccupation: content.jobs.map((job) => ({
      "@type": "Occupation",
      name: job.role,
      occupationLocation: { "@type": "Place", name: job.place },
      hiringOrganization: { "@type": "Organization", name: job.org },
      description: job.bullets?.join(" "),
    })),
    alumniOf: content.edu.map((entry) => ({
      "@type": "EducationalOrganization",
      name: entry.org,
      description: entry.title,
    })),
    hasCredential: content.resume.certs.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert,
    })),
  };

  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: content.meta.title,
        description: content.meta.description,
        publisher: { "@id": PERSON_ID },
        inLanguage: "en",
      },
    ],
  });
}

type Crumb = { name: string; path: string };

/** Breadcrumbs give search results the "Home › Blog › Post" trail. */
function breadcrumbs(trail: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "" }, ...trail].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function PostStructuredData({
  title,
  excerpt,
  slug,
  date,
}: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
}) {
  const url = `${SITE_URL}/blog/${slug}`;

  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: title,
        description: excerpt || undefined,
        url,
        mainEntityOfPage: url,
        image: `${url}/opengraph-image`,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
        inLanguage: "en",
        ...(date ? { datePublished: date, dateModified: date } : {}),
      },
      breadcrumbs([
        { name: content.blogPage.title, path: "/blog" },
        { name: title, path: `/blog/${slug}` },
      ]),
    ],
  });
}

export function ProjectStructuredData({
  title,
  subtitle,
  slug,
  stack,
}: {
  title: string;
  subtitle: string;
  slug: string;
  stack: string[];
}) {
  const url = `${SITE_URL}/projects/${slug}`;

  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        name: title,
        description: subtitle || undefined,
        url,
        image: `${url}/opengraph-image`,
        creator: { "@id": PERSON_ID },
        keywords: stack.join(", ") || undefined,
        inLanguage: "en",
      },
      breadcrumbs([
        { name: content.projectsPage.title, path: "/projects" },
        { name: title, path: `/projects/${slug}` },
      ]),
    ],
  });
}
