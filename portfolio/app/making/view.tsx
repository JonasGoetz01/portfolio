"use client";

import ImageSlot from "../_components/image-slot";
import PageIntro from "../_components/page-intro";
import { useLanguage } from "@/lib/language";

export default function MakingView() {
  const { t } = useLanguage();

  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={t.makingPage.title} intro={t.makingPage.intro} />
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
        {t.making.map((item) => (
          <article key={item.slot} className="flex flex-col gap-[14px]">
            <ImageSlot
              src={item.image}
              hint={item.slotHint}
              className="h-[190px] w-full"
              sizes="(max-width: 640px) 100vw, 300px"
            />
            <div className="flex flex-col gap-[6px]">
              <span className="font-mono text-[11px] tracking-[0.05em] text-brand">{item.tag}</span>
              <h2 className="text-lg font-semibold tracking-[-0.01em]">{item.title}</h2>
              <p className="text-[14.5px] leading-relaxed text-dim text-pretty">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
