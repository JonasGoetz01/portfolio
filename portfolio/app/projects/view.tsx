"use client";

import ImageSlot from "../_components/image-slot";
import PageIntro from "../_components/page-intro";
import { useLanguage } from "@/lib/language";

export default function ProjectsView() {
  const { t } = useLanguage();

  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={t.projectsPage.title} intro={t.projectsPage.intro} />
      <div className="flex flex-col gap-7">
        {t.projects.map((project) => (
          <article
            key={project.slot}
            className="grid items-start gap-7 rounded-[10px] border border-line bg-surface p-5 sm:[grid-template-columns:280px_1fr]"
          >
            <ImageSlot
              src={project.image}
              hint={project.slotHint}
              className="h-[175px] w-full"
              sizes="(max-width: 640px) 100vw, 280px"
            />
            <div className="flex flex-col gap-[10px] py-1">
              <span className="font-mono text-[11px] tracking-[0.05em] text-brand">
                {project.kind}
              </span>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{project.title}</h2>
              <p className="text-[15px] leading-relaxed text-pretty">{project.desc}</p>
              <div className="mt-1 flex flex-wrap gap-[6px]">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded border border-line bg-bg px-[7px] py-[3px] font-mono text-[11px] text-dim"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
