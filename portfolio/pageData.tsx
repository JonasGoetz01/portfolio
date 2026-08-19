import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

import { content, DEFAULT_LANG, EMAIL, GITHUB, LINKEDIN } from "@/lib/content";

const base = content[DEFAULT_LANG];

/** Data for the Open Graph image, which renders outside the React tree. */
export const pageData = {
    pageTitle: `${base.meta.title} | Portfolio`,
    heading: base.hero.name,
    description: base.hero.eyebrow,
    links: [
        {
            href: `mailto:${EMAIL}`,
            username: EMAIL,
            label: "Email",
            icon: faEnvelope,
        },
        {
            href: GITHUB,
            username: "jonasgoetz01",
            label: "GitHub",
            icon: faGithub,
        },
        {
            href: LINKEDIN,
            username: "jonasgoetz01",
            label: "LinkedIn",
            icon: faLinkedinIn,
        },
    ],
};
