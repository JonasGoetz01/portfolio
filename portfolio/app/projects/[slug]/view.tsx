import Link from "next/link";

import ContentBlocks from "../../_components/content-blocks";
import { ProjectStructuredData } from "../../_components/structured-data";
import ImageSlot from "../../_components/image-slot";
import { content } from "@/lib/content";
import type { MarkdownBlock } from "@/lib/markdown";
import type { Project } from "@/lib/projects";

export default function ProjectDetailView({
  project,
  blocks,
}: {
  project: Project;
  blocks: MarkdownBlock[];
}) {
  return (
    <article className="animate-rise-fast pt-[72px]">
      <ProjectStructuredData
        title={project.title}
        subtitle={project.subtitle}
        slug={project.slug}
        stack={project.stack}
      />

      <Link
        href="/projects"
        className="mb-7 inline-block font-mono text-[12px] text-dim transition-colors hover:text-ink"
      >
        ← {content.projectsPage.back}
      </Link>

      <span className="mb-[10px] block font-mono text-[11px] tracking-[0.05em] text-brand">
        {project.kind}
      </span>
      <h1 className="mb-[10px] text-[40px] font-semibold leading-tight tracking-[-0.03em]">
        {project.title}
      </h1>
      <p className="mb-7 max-w-[52ch] text-base leading-relaxed text-dim">{project.subtitle}</p>

      {project.stack.length > 0 && (
        <div className="mb-9 flex flex-wrap gap-[6px]">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded border border-line bg-surface px-[7px] py-[3px] font-mono text-[11px] text-dim"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {project.hero && (
        <ImageSlot
          src={project.hero.src}
          hint={project.hero.alt}
          className="mb-11 h-[320px] w-full"
          sizes="(max-width: 900px) 100vw, 900px"
          priority
        />
      )}

      <ContentBlocks blocks={blocks} />

      {project.images.length > 0 && (
        <>
          <h2 className="mt-14 mb-5 font-mono text-xs font-medium tracking-[0.06em] text-dim">
            {content.projectsPage.gallery}
          </h2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {project.images.map((image) => (
              <ImageSlot
                key={image.src}
                src={image.src}
                hint={image.alt}
                className="h-[220px] w-full"
                sizes="(max-width: 640px) 100vw, 420px"
              />
            ))}
          </div>
        </>
      )}
    </article>
  );
}
