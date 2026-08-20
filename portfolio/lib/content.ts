/**
 * The site's copy.
 *
 * Everything the pages render comes from here, so adding or changing content
 * never means touching layout code. Projects and blog posts are the exception:
 * those are Markdown files under `content/`.
 */

export type NavItem = { href: string; label: string };

export type Job = {
  period: string;
  place: string;
  role: string;
  org: string;
  bullets?: string[];
};

export type Education = {
  period: string;
  title: string;
  org: string;
  bullets?: string[];
};

export type StackLayer = { n: string; title: string; note: string };

export type NowItem = { tag: string; text: string };

export type Card = { href: string; title: string; sub: string };

export type SiteContent = {
  meta: { title: string; description: string };
  nav: NavItem[];
  hero: {
    eyebrow: string;
    name: string;
    paragraphs: [string, string];
    portraitAlt: string;
  };
  nowLabel: string;
  now: NowItem[];
  stackTitle: string;
  stackIntro: string;
  stack: StackLayer[];
  cards: Card[];
  resume: {
    title: string;
    experience: string;
    education: string;
    skills: string;
    /** Label for the PDF download link. */
    download: string;
    certLabel: string;
    certs: string[];
  };
  jobs: Job[];
  edu: Education[];
  skills: string[];
  projectsPage: {
    title: string;
    intro: string;
    /** Link back from a project detail page to the list. */
    back: string;
    /** Heading above a project's extra images. */
    gallery: string;
  };
  blogPage: {
    title: string;
    intro: string;
    /** Link back from a post to the list. */
    back: string;
    /** Heading above a post's extra images. */
    gallery: string;
  };
  contact: { title: string; intro: string };
  footer: string;
  /**
   * Legal notice required of German sites by §5 DDG. Deliberately in German:
   * it exists to satisfy German law, and that is the language it is read in.
   */
  impressum: {
    title: string;
    /** §5 DDG — "Angaben gemäß §5 DDG". */
    providerLabel: string;
    name: string;
    /** Street and number. Empty until filled in — see the note in the object. */
    street: string;
    /** Postcode and city. */
    city: string;
    country: string;
    contactLabel: string;
    /** §18 Abs. 2 MStV — required once a site carries editorial content. */
    responsibleLabel: string;
    liabilityTitle: string;
    liabilityContent: string;
    liabilityLinksTitle: string;
    liabilityLinks: string;
    copyrightTitle: string;
    copyright: string;
  };
};

/**
 * The canonical origin. Used for `metadataBase`, the sitemap, robots.txt and
 * the JSON-LD, so the site has exactly one source of truth for its own URL.
 */
export const SITE_URL = "https://goetz.sh";

export const EMAIL = "jonas@goetz.sh";
export const GITHUB = "https://github.com/jonasGoetz01/";
export const LINKEDIN = "https://www.linkedin.com/in/jonasgoetz01/";
export const PORTRAIT = "/jonas.avif";

export const content: SiteContent = {
  meta: {
    title: "Jonas Götz",
    description:
      "Head of IT at 42 Heilbronn. Infrastructure, self-hosted systems, electronics and a summer camp near Buchen.",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/resume", label: "Resume" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
  ],
  hero: {
    eyebrow: "HEAD OF IT — 42 HEILBRONN",
    name: "Jonas Götz",
    paragraphs: [
      "I run the IT at 42 Heilbronn, a coding school that works without teachers. Most of my job is making systems quietly do their work — and building new ones — so a few hundred students can get on with theirs.",
      "The rest of my time goes into things I can hold: electronics, 3D prints, lasercut parts — and into volunteering, helping lead the Sommerlager Buchen youth camp.",
    ],
    portraitAlt: "Jonas Götz",
  },
  nowLabel: "NOW",
  now: [
    {
      tag: "42 HEILBRONN",
      text: "Building new infrastructure and systems — and keeping the campus running.",
    },
    {
      tag: "COREGAME",
      text: "Founding member — providing the infrastructure.",
    },
    { tag: "SOMMERLAGER", text: "Organising Sommerlager Buchen." },
  ],
  stackTitle: "Four layers, one stack",
  stackIntro:
    "From the soldering iron in the workshop through the homelab on the shelf to the teams I work with. I have a lot of interests and like trying new things.",
  stack: [
    { n: "01", title: "Workshop", note: "Electronics, 3D print, lasercut" },
    {
      n: "02",
      title: "Homelab",
      note: "Servers, network, Proxmox, self-hosting",
    },
    { n: "03", title: "Software & systems", note: "Go, Python, Next.js" },
    { n: "04", title: "People", note: "Leading IT, leading youth groups" },
  ],
  cards: [
    {
      href: "/resume",
      title: "Resume",
      sub: "Seven years, four places, one detour.",
    },
    {
      href: "/projects",
      title: "Projects",
      sub: "Learning Hub and two summer camp projects.",
    },
    { href: "/blog", title: "Blog", sub: "Notes — still in progress." },
  ],
  resume: {
    title: "Resume",
    experience: "EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    download: "Download PDF",
    certLabel: "Certifications",
    certs: [
      "Juleica (youth group leader card)",
      "EU remote pilot training certificate A1/A3",
      "EU remote pilot certificate of competency A2",
    ],
  },
  jobs: [
    {
      period: "Sep 2024 — now",
      place: "Heilbronn",
      role: "Head of IT",
      org: "42 Heilbronn",
      bullets: [
        "Maintaining the IT infrastructure of the campus",
        "Development of new services and web applications",
      ],
    },
    {
      period: "Feb 2024 — Sep 2024",
      place: "Heilbronn",
      role: "Help Desk",
      org: "42 Heilbronn",
      bullets: ["Assisting at events", "Maintenance work on campus"],
    },
    {
      period: "Aug 2023 — now",
      place: "Heilbronn",
      role: "Co-founder",
      org: "Coregame",
      bullets: [
        "Development of the original game server",
        "Server and Kubernetes structure",
        "Providing the server infrastructure",
      ],
    },
    {
      period: "Sep 2021 — Dec 2025",
      place: "Buchen",
      role: "Co-Founder",
      org: "JJM-Events",
      bullets: [
        "Organising and running events",
        "Handling video, network, audio and lighting event technology",
      ],
    },
    {
      period: "Jul 2023 — Sep 2023",
      place: "Mosbach",
      role: "Full Stack Developer & Sysadmin",
      org: "EGOTEC AG",
      bullets: [
        "Fullstack development with Angular, Kotlin and MariaDB",
        "Maintaining self-managed Kubernetes clusters",
        "Worked on a time-tracking app and a whistleblowing application",
      ],
    },
    {
      period: "Okt 2021 — Jul 2023",
      place: "Mosbach",
      role: "Fachinformatiker Anwendungsentwicklung",
      org: "EGOTEC AG",
      bullets: [
        "Fullstack development with Angular, Kotlin and MariaDB",
        "Maintaining self-managed Kubernetes clusters",
        "Worked on a time-tracking app and a whistleblowing application",
      ],
    },
    {
      period: "Okt 2020 — Okt 2021",
      place: "Germany",
      role: "Student",
      org: "Bosch",
      bullets: ["Development of electrical systems", "Basic metalworking training"],
    },
  ],
  edu: [
    {
      period: "Sep 2023 — now",
      title: "Informatics",
      org: "42 Heilbronn",
      bullets: [
        "C, C++, web",
        "libft — a C standard library rebuilt from scratch, without any outside libraries",
        "minishell — a working shell with its own parser, pipes and redirections",
        "philosophers — the dining philosophers problem solved with threads and mutexes",
        "webserv — a non-blocking, configurable HTTP server written in C++",
        "Inception — a multi-service stack orchestrated in Docker, every service isolated",
      ],
    },
    {
      period: "Aug — Sep 2023",
      title: "Piscine, Informatics",
      org: "42 Heilbronn",
      bullets: ["Fundamentals of C and shell"],
    },
    {
      period: "Okt 2021 — Okt 2023",
      title: "Fachinformatiker Anwendungsentwicklung",
      org: "ZGB Buchen",
      bullets: ["Programming in JS, Java and C", "Networking", "Graduated top of the year"],
    },
    {
      period: "2020 — Okt 2021",
      title: "Mechatronik Fahrzeugsystemtechnik und Elektromobilität",
      org: "Duale Hochschule Baden-Württemberg",
      bullets: [
        "Fundamentals of maths, physics and electrical engineering",
        "Programming in C and C++",
        "Basic metalworking training",
        "CAD",
        "Design and development of electronic systems and PCBs",
      ],
    },
    {
      period: "2011 — 2020",
      title: "Abitur",
      org: "Burghardt-Gymnasium Buchen",
      bullets: ["Advanced courses: physics, economics"],
    },
  ],
  skills: [
    "Go",
    "Java",
    "Maven",
    "Kubernetes",
    "Docker",
    "System administration",
    "Full stack development",
    "Leading youth groups",
  ],
  projectsPage: {
    title: "Projects",
    intro: "Software that gets used every day — at the school and at the summer camp.",
    back: "All projects",
    gallery: "More pictures",
  },
  blogPage: {
    title: "Blog",
    intro:
      "Notes on infrastructure, the workshop, and what happens between the two. Still a work in progress.",
    back: "All posts",
    gallery: "More pictures",
  },
  contact: {
    title: "Say hello.",
    intro: "For ideas, questions or suggestions.",
  },
  footer: "© 2026 Jonas Götz — Heilbronn, Germany",

  impressum: {
    title: "Impressum",
    providerLabel: "Angaben gemäß § 5 DDG",
    name: "Jonas Götz",

    // TODO: §5 DDG requires a postal address at which the provider can be
    // reached — a PO box is not enough. Until these two lines hold a real
    // address the page is incomplete, and `lib/content.test.ts` fails to say so.
    street: "",
    city: "",
    country: "Deutschland",

    contactLabel: "Kontakt",
    responsibleLabel: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",

    liabilityTitle: "Haftung für Inhalte",
    liabilityContent:
      "Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werde ich diese Inhalte unverzüglich entfernen.",

    liabilityLinksTitle: "Haftung für Links",
    liabilityLinks:
      "Dieses Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links unverzüglich entfernen.",

    copyrightTitle: "Urheberrecht",
    copyright:
      "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Der Quellcode dieser Seite ist auf GitHub öffentlich einsehbar.",
  },
};
