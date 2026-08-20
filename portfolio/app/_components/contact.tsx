import Link from "next/link";

import { EMAIL, GITHUB, LINKEDIN, content } from "@/lib/content";

const LINKS = [
  { href: `mailto:${EMAIL}`, label: EMAIL, external: false },
  { href: GITHUB, label: "github.com/jonasGoetz01", external: true },
  { href: LINKEDIN, label: "linkedin.com/in/jonasgoetz01", external: true },
];

/**
 * There is no form here on purpose. The site has no backend, and a form that
 * hands the message to the visitor's mail client fails silently for anyone
 * without one configured — the message is simply lost. Three plain links always
 * work, and this stays a server component.
 */
export default function Contact() {
  return (
    <>
      <section id="contact" className="mt-20 border-t border-line pt-11">
        <div className="flex flex-col gap-[14px]">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em]">{content.contact.title}</h2>
          <p className="max-w-[42ch] text-[15px] leading-relaxed text-dim">
            {content.contact.intro}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[13px]">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                className="text-brand transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
      <footer className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-dim">
        <span>{content.footer}</span>
        {/* §5 DDG: the legal notice must be reachable from every page. */}
        <Link href="/impressum" className="transition-colors hover:text-ink">
          {content.impressum.title}
        </Link>
      </footer>
    </>
  );
}
