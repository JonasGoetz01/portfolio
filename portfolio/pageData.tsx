import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

import { content, EMAIL, GITHUB, LINKEDIN } from "@/lib/content";

/** Data for the Open Graph image, which renders outside the React tree. */
export const pageData = {
    pageTitle: `${content.meta.title} | Portfolio`,
    heading: content.hero.name,
    description: content.hero.eyebrow,
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
