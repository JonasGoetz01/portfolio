import Link from "next/link";

import ImageSlot from "../_components/image-slot";
import PageIntro from "../_components/page-intro";
import { content } from "@/lib/content";
import type { Project } from "@/lib/projects";

export default function ProjectsView({ projects }: { projects: Project[] }) {
  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={content.projectsPage.title} intro={content.projectsPage.intro} />
      <div className="flex flex-col gap-7">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="grid items-start gap-7 rounded-[10px] border border-line bg-surface p-5 transition-colors hover:border-brand sm:[grid-template-columns:280px_1fr]"
          >
            <ImageSlot
              src={project.hero?.src}
              hint={project.hero?.alt ?? project.title}
              className="h-[175px] w-full"
              sizes="(max-width: 640px) 100vw, 280px"
              /* The first card is above the fold and is this page's Largest
                 Contentful Paint, so it loads eagerly at high priority instead
                 of waiting for the lazy-loading observer. */
              priority={index === 0}
            />
            <div className="flex flex-col gap-[10px] py-1">
              <span className="font-mono text-[11px] tracking-[0.05em] text-brand">
                {project.kind}
              </span>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{project.title}</h2>
              <p className="text-[15px] leading-relaxed text-pretty">{project.subtitle}</p>
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
          </Link>
        ))}
      </div>
    </section>
  );
}
