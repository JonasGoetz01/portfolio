import type { Metadata } from "next";

import PageIntro from "../_components/page-intro";
import { EMAIL, SITE_URL, content } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content.impressum.title} — Jonas Götz`,
  description: "Angaben gemäß § 5 DDG.",
  alternates: { canonical: "/impressum" },
  // A legal notice has to be reachable, but it is not a search result anyone
  // wants — indexable, deliberately not promoted.
  robots: { index: true, follow: true },
};

/** A block of legal prose under its own heading. */
function Clause({ title, children }: { title: string; children: string }) {
  return (
    <section className="mt-11">
      <h2 className="mb-[10px] text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="max-w-[68ch] text-[14.5px] leading-relaxed text-dim text-pretty">{children}</p>
    </section>
  );
}

export default function ImpressumPage() {
  const { impressum } = content;
  const hasAddress = Boolean(impressum.street && impressum.city);

  return (
    // The prose is German; marking it lets a screen reader pronounce it and
    // lets the browser hyphenate the long compounds correctly.
    <section lang="de" className="animate-rise-fast pt-[72px]">
      <PageIntro title={impressum.title} />

      <h2 className="mb-[10px] font-mono text-[11px] tracking-[0.06em] text-dim uppercase">
        {impressum.providerLabel}
      </h2>
      <address className="text-[15px] leading-relaxed not-italic">
        {impressum.name}
        {/*
          Rendered only once a real address is present. Printing an empty line,
          or a placeholder, would look like a complete legal notice while not
          being one — worse than the page plainly lacking it.
        */}
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
      </address>

      <h2 className="mt-9 mb-[10px] font-mono text-[11px] tracking-[0.06em] text-dim uppercase">
        {impressum.contactLabel}
      </h2>
      <p className="font-mono text-[13px]">
        <a href={`mailto:${EMAIL}`} className="text-brand transition-colors hover:text-ink">
          {EMAIL}
        </a>
      </p>

      <h2 className="mt-9 mb-[10px] font-mono text-[11px] tracking-[0.06em] text-dim uppercase">
        {impressum.responsibleLabel}
      </h2>
      <address className="text-[15px] leading-relaxed not-italic">
        {impressum.name}
        {hasAddress && (
          <>
            <br />
            {impressum.street}
            <br />
            {impressum.city}
          </>
        )}
      </address>

      <Clause title={impressum.liabilityTitle}>{impressum.liabilityContent}</Clause>
      <Clause title={impressum.liabilityLinksTitle}>{impressum.liabilityLinks}</Clause>
      <Clause title={impressum.copyrightTitle}>{impressum.copyright}</Clause>

      <p className="mt-11 font-mono text-[11px] text-dim">{SITE_URL.replace("https://", "")}</p>
    </section>
  );
}
