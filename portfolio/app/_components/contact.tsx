"use client";

import { useState, type FormEvent } from "react";

import { content, EMAIL, GITHUB, LINKEDIN } from "@/lib/content";

const LINKS = [
  { href: `mailto:${EMAIL}`, label: EMAIL, external: false },
  { href: GITHUB, label: "github.com/jonasGoetz01", external: true },
  { href: LINKEDIN, label: "linkedin.com/in/jonasgoetz01", external: true },
];

const FIELD_CLASS =
  "rounded-md border border-line bg-surface px-[13px] py-[11px] text-[14.5px] text-ink outline-none placeholder:text-dim focus:border-brand";

export default function Contact() {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [message, setMessage] = useState("");

  // No backend on this site: the form hands the message to the visitor's mail
  // client, pre-filled.
  function submit(event: FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(`${content.contact.subject} ${name || "website"}`);
    const body = encodeURIComponent(`${message}\n\n${mail}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="mt-20 border-t border-line pt-11">
      <div className="grid gap-11 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        <div className="flex flex-col gap-[14px]">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em]">{content.contact.title}</h2>
          <p className="max-w-[36ch] text-[15px] leading-relaxed text-dim">
            {content.contact.intro}
          </p>
          <div className="mt-[6px] flex flex-col gap-[7px] font-mono text-[13px]">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="w-fit text-brand transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <form className="flex flex-col gap-[10px]" onSubmit={submit}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={content.contact.name}
            aria-label={content.contact.name}
            className={FIELD_CLASS}
          />
          <input
            type="email"
            value={mail}
            onChange={(event) => setMail(event.target.value)}
            placeholder={content.contact.mail}
            aria-label={content.contact.mail}
            className={FIELD_CLASS}
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={content.contact.message}
            aria-label={content.contact.message}
            rows={4}
            className={`${FIELD_CLASS} resize-y`}
          />
          <button
            type="submit"
            className="cursor-pointer self-start rounded-md bg-brand px-5 py-[11px] font-mono text-[12.5px] tracking-[0.03em] text-bg transition-opacity hover:opacity-85"
          >
            {content.contact.send}
          </button>
        </form>
      </div>
      <p className="mt-14 font-mono text-[11px] text-dim">{content.footer}</p>
    </section>
  );
}
