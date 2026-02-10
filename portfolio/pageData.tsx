import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

export const pageData = {
    pageTitle: "Jonas Götz | Portfolio",
    heading: "Hi, I'm Jonas Götz",
    description:
        "Software Engineer and System Administrator",
    links: [
        {
            href: "mailto:jonas@goetz.sh",
            username: "jonas@goetz.sh",
            label: "Email",
            icon: faEnvelope,
        },
        {
            href: "https://github.com/jonasgoetz01",
            username: "jonasgoetz01",
            label: "GitHub",
            icon: faGithub,
        },
        {
            href: "https://linkedin.com/in/jonasgoetz01",
            username: "jonasgoetz01",
            label: "LinkedIn",
            icon: faLinkedinIn,
        },
    ],
};