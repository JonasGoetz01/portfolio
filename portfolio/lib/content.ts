/**
 * All copy for the site, in both languages.
 *
 * Everything the pages render comes from here, so adding or changing content
 * never means touching layout code. `DEFAULT_LANG` is the language a first-time
 * visitor sees; the header toggle stores their choice in localStorage.
 */

export type Lang = "en" | "de";

export const LANGS: Lang[] = ["en", "de"];
export const DEFAULT_LANG: Lang = "en";

export type NavItem = { href: string; label: string };

export type Job = {
  period: string;
  place: string;
  role: string;
  org: string;
  bullets?: string[];
};

export type Education = { period: string; title: string; org: string };

export type StackLayer = { n: string; title: string; note: string };

export type NowItem = { tag: string; text: string };

export type Card = { href: string; title: string; sub: string };

export type Project = {
  slot: string;
  image?: string;
  slotHint: string;
  kind: string;
  title: string;
  desc: string;
  stack: string[];
};

export type MakingItem = {
  slot: string;
  image?: string;
  slotHint: string;
  tag: string;
  title: string;
  desc: string;
};

export type Post = { date: string; title: string; excerpt: string; state: string };

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
    intro: string;
    experience: string;
    education: string;
    skills: string;
    cert: string;
  };
  jobs: Job[];
  edu: Education[];
  skills: string[];
  projectsPage: { title: string; intro: string };
  projects: Project[];
  makingPage: { title: string; intro: string };
  making: MakingItem[];
  blogPage: { title: string; intro: string };
  posts: Post[];
  contact: {
    title: string;
    intro: string;
    name: string;
    mail: string;
    message: string;
    send: string;
    subject: string;
  };
  footer: string;
};

export const EMAIL = "jonas@goetz.sh";
export const GITHUB = "https://github.com/jonasGoetz01/";
export const LINKEDIN = "https://www.linkedin.com/in/jonasgoetz01/";
export const PORTRAIT = "/jonas.avif";

const en: SiteContent = {
  meta: {
    title: "Jonas Götz",
    description:
      "Head of IT at 42 Heilbronn. Infrastructure, self-hosted systems, electronics and a summer camp near Buchen.",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/resume", label: "Résumé" },
    { href: "/projects", label: "Projects" },
    { href: "/making", label: "Making" },
    { href: "/blog", label: "Blog" },
  ],
  hero: {
    eyebrow: "HEAD OF IT — 42 HEILBRONN",
    name: "Jonas Götz",
    paragraphs: [
      "I run the IT at 42 Heilbronn, a coding school that works without teachers. Most of my job is making systems quietly do their work, so a few hundred students can get on with theirs.",
      "The rest of my time goes into things I can hold: electronics, 3D prints, lasercut parts — and a good part of every summer goes into running a youth camp near Buchen.",
    ],
    portraitAlt: "Jonas Götz",
  },
  nowLabel: "NOW",
  now: [
    {
      tag: "42 HEILBRONN",
      text: "Building and running the Learning Hub, plus the infrastructure under it.",
    },
    { tag: "COREGAME", text: "Game servers, Kubernetes and live events, as a co-founder." },
    { tag: "SOMMERLAGER", text: "Organising Sommerlager Buchen with JJM-Events." },
  ],
  stackTitle: "Four layers, one stack",
  stackIntro:
    "From the soldering iron in the workshop through the homelab on the shelf to the teams I work with. The homelab is the layer where I learn the most — whatever ends up in production gets tried out there first.",
  stack: [
    { n: "01", title: "Workshop", note: "Electronics, 3D print, lasercut" },
    { n: "02", title: "Homelab", note: "Servers, network, self-hosting" },
    { n: "03", title: "Software & systems", note: "Go, Java, Kubernetes" },
    { n: "04", title: "People", note: "Leading IT, leading youth groups" },
  ],
  cards: [
    { href: "/resume", title: "Résumé", sub: "Seven years, four places, one detour." },
    { href: "/projects", title: "Projects", sub: "Learning Hub and two summer camp projects." },
    { href: "/making", title: "Making", sub: "Electronics, 3D print, lasercut, volunteering." },
    { href: "/blog", title: "Blog", sub: "Notes — still in progress." },
  ],
  resume: {
    title: "Résumé",
    intro:
      "From mechatronics through an apprenticeship into running an IT department. Less linear than planned, and useful for exactly that reason.",
    experience: "EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    cert: "Certification — Juleica (youth group leader card)",
  },
  jobs: [
    { period: "Sep 2024 — now", place: "Heilbronn", role: "Head of IT", org: "42 Heilbronn" },
    { period: "Feb 2024 — Sep 2024", place: "Heilbronn", role: "Help Desk", org: "42 Heilbronn" },
    {
      period: "Aug 2023 — now",
      place: "Heilbronn",
      role: "Co-founder",
      org: "Coregame",
      bullets: [
        "Development of the original game server",
        "Server and Kubernetes structure",
        "Live events",
      ],
    },
    { period: "Sep 2021 — now", place: "Germany", role: "Co-Founder", org: "JJM-Events" },
    {
      period: "Jul 2023 — Sep 2023",
      place: "Mosbach",
      role: "Full Stack Developer & Sysadmin",
      org: "EGOTEC AG",
    },
    {
      period: "Okt 2021 — Jul 2023",
      place: "Mosbach",
      role: "Fachinformatiker Anwendungsentwicklung",
      org: "EGOTEC AG",
    },
    { period: "Okt 2020 — Okt 2021", place: "Germany", role: "Student", org: "Bosch" },
  ],
  edu: [
    { period: "Sep 2023 — now", title: "Informatics", org: "42 Heilbronn" },
    { period: "Aug — Sep 2023", title: "Piscine, Informatics", org: "42 Heilbronn" },
    {
      period: "Okt 2021 — Okt 2023",
      title: "Fachinformatiker Anwendungsentwicklung",
      org: "ZGB Buchen",
    },
    {
      period: "2020 — Okt 2021",
      title: "Bachelor, Mechatronics",
      org: "Duale Hochschule Baden-Württemberg",
    },
    { period: "2011 — 2020", title: "Abitur", org: "Burghardt-Gymnasium Buchen" },
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
  },
  projects: [
    {
      slot: "proj-learninghub",
      slotHint: "Learning Hub screenshot",
      kind: "WORK — 42 HEILBRONN",
      title: "Learning Hub",
      desc: "A full LMS built for 42 Heilbronn, covering every feature a coding school without teachers actually needs.",
      stack: ["LMS", "Full stack", "Self-hosted"],
    },
    {
      slot: "proj-sola-app",
      slotHint: "Management app screenshot",
      kind: "VOLUNTEER — SUMMER CAMP",
      title: "Sommerlager Management Application",
      desc: "Registrations, participant data and camp logistics in one place, so the team no longer runs the camp out of spreadsheets.",
      stack: ["Web app", "Auth", "Admin"],
    },
    {
      slot: "proj-sola-landing",
      slotHint: "Landing page screenshot",
      kind: "VOLUNTEER — SUMMER CAMP",
      title: "Sommerlager Landing Page",
      desc: "The public face of the camp: what happens, who runs it, and how to sign up.",
      stack: ["Landing page", "CMS"],
    },
  ],
  makingPage: {
    title: "Making & volunteering",
    intro:
      "What happens when I get up from the screen: electronics, 3D printing, lasercut parts — and every summer, a camp full of kids.",
  },
  making: [
    {
      slot: "make-electronics",
      slotHint: "Electronics",
      tag: "ELECTRONICS",
      title: "Electronics",
      desc: "Small boards, microcontrollers and things that are supposed to blink — usually for a concrete problem, sometimes just because.",
    },
    {
      slot: "make-3dprint",
      slotHint: "3D print",
      tag: "3D PRINTING",
      title: "3D printing",
      desc: "Enclosures, mounts, spare parts. The printer runs more repairs than novelties.",
    },
    {
      slot: "make-lasercut",
      slotHint: "Lasercut",
      tag: "LASERCUT",
      title: "Lasercut",
      desc: "Front panels, signs and small batches for the camp and the workshop.",
    },
    {
      slot: "make-homelab",
      slotHint: "Homelab / rack",
      tag: "HOMELAB",
      title: "Homelab",
      desc: "A rack on the shelf: servers, networking and self-hosted services. The playground for everything that later has to run reliably in production.",
    },
    {
      slot: "make-sola",
      slotHint: "Sommerlager Buchen",
      tag: "SOMMERLAGER BUCHEN",
      title: "Volunteering",
      desc: "Years on the team of Sommerlager Buchen — leading youth groups, running the tech, and whatever else comes up.",
    },
  ],
  blogPage: {
    title: "Blog",
    intro:
      "Notes on infrastructure, the workshop, and what happens between the two. Still a work in progress.",
  },
  posts: [
    {
      date: "Soon",
      title: "An LMS for a school without teachers",
      excerpt:
        "What changes when nobody stands at the front and the software carries the learning path.",
      state: "DRAFT",
    },
    {
      date: "Soon",
      title: "Kubernetes for live events",
      excerpt: "What we learned at Coregame the day everyone showed up at once.",
      state: "DRAFT",
    },
    {
      date: "Soon",
      title: "From the lasercutter to the campsite",
      excerpt: "Why a bit of workshop makes any volunteer job better.",
      state: "DRAFT",
    },
  ],
  contact: {
    title: "Say hello.",
    intro: "About a project, about 42, or for no particular reason.",
    name: "Name",
    mail: "Email",
    message: "Message",
    send: "SEND",
    subject: "Message from",
  },
  footer: "© 2026 Jonas Götz — Heilbronn, Germany",
};

const de: SiteContent = {
  meta: {
    title: "Jonas Götz",
    description:
      "IT-Leitung an der 42 Heilbronn. Infrastruktur, selbst gehostete Systeme, Elektronik und ein Sommerlager bei Buchen.",
  },
  nav: [
    { href: "/", label: "Start" },
    { href: "/resume", label: "Lebenslauf" },
    { href: "/projects", label: "Projekte" },
    { href: "/making", label: "Bauen" },
    { href: "/blog", label: "Blog" },
  ],
  hero: {
    eyebrow: "HEAD OF IT — 42 HEILBRONN",
    name: "Jonas Götz",
    paragraphs: [
      "Ich leite die IT an der 42 Heilbronn, einer Programmierschule, die ohne Lehrer funktioniert. Der größte Teil meiner Arbeit besteht darin, Systeme leise ihren Dienst tun zu lassen, damit einige hundert Studierende sich auf ihren konzentrieren können.",
      "Die übrige Zeit fließt in Dinge, die man anfassen kann: Elektronik, 3D-Druck, Lasercut — und ein guter Teil jedes Sommers geht ins Sommerlager bei Buchen.",
    ],
    portraitAlt: "Jonas Götz",
  },
  nowLabel: "GERADE",
  now: [
    {
      tag: "42 HEILBRONN",
      text: "Learning Hub bauen und betreiben — plus die Infrastruktur dahinter.",
    },
    { tag: "COREGAME", text: "Game-Server, Kubernetes und Live-Events, als Mitbegründer." },
    { tag: "SOMMERLAGER", text: "Das Sommerlager Buchen mit JJM-Events organisieren." },
  ],
  stackTitle: "Vier Ebenen, ein Stapel",
  stackIntro:
    "Vom Lötkolben in der Werkstatt über das Homelab im Regal bis zu den Teams, mit denen ich arbeite. Das Homelab ist dabei die Ebene, auf der ich am meisten lerne — hier wird ausprobiert, was später im Betrieb laufen soll.",
  stack: [
    { n: "01", title: "Werkstatt", note: "Elektronik, 3D-Druck, Lasercut" },
    { n: "02", title: "Homelab", note: "Server, Netzwerk, Selfhosting" },
    { n: "03", title: "Software & Systeme", note: "Go, Java, Kubernetes" },
    { n: "04", title: "Menschen", note: "IT-Leitung, Jugendgruppen" },
  ],
  cards: [
    { href: "/resume", title: "Lebenslauf", sub: "Sieben Jahre, vier Stationen, ein Umweg." },
    { href: "/projects", title: "Projekte", sub: "Learning Hub und zwei Sommerlager-Projekte." },
    { href: "/making", title: "Bauen", sub: "Elektronik, 3D-Druck, Lasercut, Ehrenamt." },
    { href: "/blog", title: "Blog", sub: "Notizen — noch in Arbeit." },
  ],
  resume: {
    title: "Lebenslauf",
    intro:
      "Von der Mechatronik über die Ausbildung zur IT-Leitung — der Weg war weniger geradlinig als geplant, und genau deshalb nützlich.",
    experience: "BERUFSERFAHRUNG",
    education: "AUSBILDUNG",
    skills: "KENNTNISSE",
    cert: "Zertifikat — Juleica (Jugendleiterkarte)",
  },
  jobs: [
    { period: "Sep 2024 — heute", place: "Heilbronn", role: "Head of IT", org: "42 Heilbronn" },
    { period: "Feb 2024 — Sep 2024", place: "Heilbronn", role: "Help Desk", org: "42 Heilbronn" },
    {
      period: "Aug 2023 — heute",
      place: "Heilbronn",
      role: "Mitbegründer",
      org: "Coregame",
      bullets: [
        "Entwicklung des ursprünglichen Game-Servers",
        "Server- und Kubernetes-Struktur",
        "Live-Events",
      ],
    },
    { period: "Sep 2021 — heute", place: "Deutschland", role: "Co-Founder", org: "JJM-Events" },
    {
      period: "Jul 2023 — Sep 2023",
      place: "Mosbach",
      role: "Full Stack Developer & Systemadministrator",
      org: "EGOTEC AG",
    },
    {
      period: "Okt 2021 — Jul 2023",
      place: "Mosbach",
      role: "Fachinformatiker Anwendungsentwicklung",
      org: "EGOTEC AG",
    },
    { period: "Okt 2020 — Okt 2021", place: "Deutschland", role: "Student", org: "Bosch" },
  ],
  edu: [
    { period: "Sep 2023 — heute", title: "Informatik", org: "42 Heilbronn" },
    { period: "Aug — Sep 2023", title: "Piscine, Informatics", org: "42 Heilbronn" },
    {
      period: "Okt 2021 — Okt 2023",
      title: "Fachinformatiker Anwendungsentwicklung",
      org: "ZGB Buchen",
    },
    {
      period: "2020 — Okt 2021",
      title: "Bachelor, Mechatronik",
      org: "Duale Hochschule Baden-Württemberg",
    },
    { period: "2011 — 2020", title: "Abitur", org: "Burghardt-Gymnasium Buchen" },
  ],
  skills: [
    "Go",
    "Java",
    "Maven",
    "Kubernetes",
    "Docker",
    "Systemadministration",
    "Full-Stack-Entwicklung",
    "Leitung von Jugendgruppen",
  ],
  projectsPage: {
    title: "Projekte",
    intro: "Software, die täglich benutzt wird — im Betrieb an der Schule und im Sommerlager.",
  },
  projects: [
    {
      slot: "proj-learninghub",
      slotHint: "Learning Hub Screenshot",
      kind: "ARBEIT — 42 HEILBRONN",
      title: "Learning Hub",
      desc: "Ein vollständiges LMS, gebaut für den Betrieb der 42 Heilbronn — mit allen Funktionen, die eine Programmierschule ohne Lehrer wirklich braucht.",
      stack: ["LMS", "Full stack", "Self-hosted"],
    },
    {
      slot: "proj-sola-app",
      slotHint: "Screenshot der Management-App",
      kind: "EHRENAMT — SOMMERLAGER",
      title: "Sommerlager Management Application",
      desc: "Anmeldungen, Teilnehmerdaten und Organisation des Sommerlagers an einem Ort, damit das Team nicht mit Tabellen arbeiten muss.",
      stack: ["Web app", "Auth", "Admin"],
    },
    {
      slot: "proj-sola-landing",
      slotHint: "Screenshot der Landingpage",
      kind: "EHRENAMT — SOMMERLAGER",
      title: "Sommerlager Landing Page",
      desc: "Die öffentliche Seite des Lagers: was passiert, wer dabei ist und wie man sich anmeldet.",
      stack: ["Landing page", "CMS"],
    },
  ],
  makingPage: {
    title: "Bauen & Ehrenamt",
    intro:
      "Was entsteht, wenn ich vom Bildschirm aufstehe: Elektronik, 3D-Druck, Lasercut — und jeden Sommer ein Zeltlager voller Kinder.",
  },
  making: [
    {
      slot: "make-electronics",
      slotHint: "Elektronik",
      tag: "ELECTRONICS",
      title: "Elektronik",
      desc: "Kleine Platinen, Mikrocontroller und Dinge, die blinken sollen — meistens für ein konkretes Problem, manchmal nur so.",
    },
    {
      slot: "make-3dprint",
      slotHint: "3D-Druck",
      tag: "3D PRINTING",
      title: "3D-Druck",
      desc: "Gehäuse, Halterungen, Ersatzteile. Der Drucker läuft öfter für Reparaturen als für Neues.",
    },
    {
      slot: "make-lasercut",
      slotHint: "Lasercut",
      tag: "LASERCUT",
      title: "Lasercut",
      desc: "Frontplatten, Schilder und Kleinserien für Lager und Werkstatt.",
    },
    {
      slot: "make-homelab",
      slotHint: "Homelab / Rack",
      tag: "HOMELAB",
      title: "Homelab",
      desc: "Ein Rack im Regal: Server, Netzwerk und selbst gehostete Dienste. Meine Spielwiese für alles, was später im Betrieb zuverlässig laufen muss.",
    },
    {
      slot: "make-sola",
      slotHint: "Sommerlager Buchen",
      tag: "SOMMERLAGER BUCHEN",
      title: "Ehrenamt",
      desc: "Seit Jahren im Team des Sommerlagers Buchen — Jugendgruppenleitung, Technik und alles, was sonst anfällt.",
    },
  ],
  blogPage: {
    title: "Blog",
    intro:
      "Notizen zu Infrastruktur, Werkstatt und dem, was zwischen beidem passiert. Noch in Arbeit.",
  },
  posts: [
    {
      date: "Bald",
      title: "Ein LMS für eine Schule ohne Lehrer",
      excerpt: "Was sich ändert, wenn niemand vorne steht und die Software den Lernweg trägt.",
      state: "ENTWURF",
    },
    {
      date: "Bald",
      title: "Kubernetes für Live-Events",
      excerpt: "Was wir bei Coregame gelernt haben, als plötzlich alle gleichzeitig da waren.",
      state: "ENTWURF",
    },
    {
      date: "Bald",
      title: "Vom Lasercutter zum Zeltlager",
      excerpt: "Warum ein bisschen Werkstatt jedes Ehrenamt besser macht.",
      state: "ENTWURF",
    },
  ],
  contact: {
    title: "Schreib mir gern.",
    intro: "Für Projekte, Fragen zur 42 oder einfach so.",
    name: "Name",
    mail: "E-Mail",
    message: "Nachricht",
    send: "ABSENDEN",
    subject: "Nachricht von",
  },
  footer: "© 2026 Jonas Götz — Heilbronn, Deutschland",
};

export const content: Record<Lang, SiteContent> = { en, de };
