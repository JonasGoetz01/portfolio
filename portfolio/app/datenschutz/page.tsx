import type { Metadata } from "next";
import Link from "next/link";

import PageIntro from "../_components/page-intro";
import { EMAIL, content } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content.privacy.title} — Jonas Götz`,
  description: "Informationen zur Datenverarbeitung nach Art. 13 DSGVO.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  const { privacy, impressum } = content;
  const hasAddress = Boolean(impressum.street && impressum.city);

  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={privacy.title} intro={privacy.intro} />

      <h2 className="mb-[10px] font-mono text-[11px] tracking-[0.06em] text-dim uppercase">
        {privacy.controllerTitle}
      </h2>
      {/* One source of truth: the controller is whoever the Impressum names. */}
      <address className="text-[15px] leading-relaxed not-italic">
        {impressum.name}
        {hasAddress && (
          <>
            <br />
            {impressum.street}
            <br />
            {impressum.city}
            <br />
            {impressum.country}
          </>
        )}
        <br />
        <a href={`mailto:${EMAIL}`} className="text-brand transition-colors hover:text-ink">
          {EMAIL}
        </a>
      </address>

      {privacy.sections.map((section) => (
        <section key={section.title} className="mt-11">
          <h2 className="mb-[10px] text-[17px] font-semibold tracking-[-0.01em]">
            {section.title}
          </h2>
          <div className="flex flex-col gap-3">
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[68ch] text-[14.5px] leading-relaxed text-dim text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-11">
        <h2 className="mb-[10px] text-[17px] font-semibold tracking-[-0.01em]">
          {privacy.rightsTitle}
        </h2>
        <p className="max-w-[68ch] text-[14.5px] leading-relaxed text-dim">{privacy.rightsIntro}</p>
        <ul className="mt-3 flex max-w-[68ch] flex-col gap-[6px]">
          {privacy.rights.map((right) => (
            <li
              key={right}
              className="flex gap-[10px] text-[14.5px] leading-relaxed text-dim text-pretty"
            >
              <span aria-hidden className="text-brand">
                ·
              </span>
              <span>{right}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-[68ch] text-[14.5px] leading-relaxed text-dim text-pretty">
          {privacy.rightsOutro}
        </p>
      </section>

      <p className="mt-11 font-mono text-[11px] text-dim">
        <Link href="/impressum" className="transition-colors hover:text-ink">
          {impressum.title}
        </Link>
      </p>
    </section>
  );
}
