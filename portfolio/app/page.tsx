import Link from "next/link";

import ImageSlot from "./_components/image-slot";
import StackDiagram from "./_components/stack-diagram";
import { content, PORTRAIT } from "@/lib/content";

export default function Home() {
  return (
    <>
      {/* ---------------------------------- Hero --------------------------------- */}
      <section className="animate-rise pb-2 pt-9 sm:pt-[72px]">
        <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:items-start sm:gap-11">
          <div className="flex flex-col gap-[22px] sm:flex-1 sm:basis-[340px]">
            <div className="flex flex-col gap-[10px]">
              <span className="font-mono text-xs tracking-[0.06em] text-brand">
                {content.hero.eyebrow}
                <span className="animate-caret ml-[3px] inline-block">_</span>
              </span>
              <h1 className="text-[clamp(34px,9vw,56px)] font-semibold leading-[1.02] tracking-[-0.03em] break-words">
                {content.hero.name}
              </h1>
            </div>
            <div className="flex max-w-[46ch] flex-col gap-4">
              <p className="text-[17px] leading-[1.65] text-pretty">{content.hero.paragraphs[0]}</p>
              <p className="text-[17px] leading-[1.65] text-dim text-pretty">
                {content.hero.paragraphs[1]}
              </p>
            </div>
          </div>
          {/*
            A fixed-width portrait leaves dead space beside it once the column
            narrows, so on phones the frame spans the column and reads as a
            deliberate band. The wide frame wants a looser crop than the narrow
            desktop one, hence the two scales.
          */}
          <ImageSlot
            src={PORTRAIT}
            hint={content.hero.portraitAlt}
            className="h-[260px] w-full sm:h-[290px] sm:w-[230px]"
            sizes="(max-width: 640px) 100vw, 230px"
            scale={1.06}
            scaleSm={1.46}
            priority
          />
        </div>
      </section>

      {/* ---------------------------------- Now ---------------------------------- */}
      <section className="pt-14">
        <div className="mb-[18px] flex items-center gap-[10px]">
          <span className="relative inline-flex h-[7px] w-[7px] items-center justify-center">
            <span className="animate-pulse-dot absolute inset-0 rounded-full bg-brand" />
            <span className="absolute inset-[1.5px] rounded-full bg-brand" />
          </span>
          <span className="font-mono text-xs tracking-[0.06em] text-dim">{content.nowLabel}</span>
          <span className="animate-sweep h-px flex-1" />
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {content.now.map((item) => (
            <div key={item.tag} className="flex flex-col gap-2 bg-bg p-[22px]">
              <span className="font-mono text-[11px] tracking-[0.05em] text-brand">{item.tag}</span>
              <p className="text-[14.5px] leading-[1.55]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------- Stack --------------------------------- */}
      <section className="pt-16">
        <div className="flex flex-wrap items-center gap-10 rounded-[10px] border border-line bg-surface px-5 py-7 sm:px-8">
          <StackDiagram />
          <div className="flex flex-1 basis-[300px] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{content.stackTitle}</h2>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-dim text-pretty">
                {content.stackIntro}
              </p>
            </div>
            {/* Reversed so layer 01 — the workshop — sits at the bottom of the stack. */}
            <div className="flex flex-col-reverse gap-px overflow-hidden rounded-md border border-line bg-line">
              {content.stack.map((layer) => (
                <div key={layer.n} className="flex items-baseline gap-3 bg-bg px-[14px] py-[11px]">
                  <span className="font-mono text-[11px] text-brand">{layer.n}</span>
                  <span className="text-[14.5px] font-semibold tracking-[-0.01em]">
                    {layer.title}
                  </span>
                  <span className="ml-auto text-right font-mono text-[11px] text-dim">
                    {layer.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------- Cards --------------------------------- */}
      <section className="pt-14">
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {content.cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex flex-col gap-[6px] rounded-lg border border-line bg-surface p-5 text-left transition-colors hover:border-brand"
            >
              <span className="text-base font-semibold tracking-[-0.01em]">{card.title}</span>
              <span className="text-[13.5px] leading-[1.5] text-dim">{card.sub}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
