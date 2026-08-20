import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "../../_og/card";
import { getProject, getProjects } from "@/lib/projects";

export const dynamic = "force-static";
export const runtime = "nodejs";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** One image per project file, generated at build time. */
export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  return ogCard({
    eyebrow: project?.kind || "PROJECT",
    title: project?.title ?? "Project",
    subtitle: project?.subtitle,
    tags: project?.stack,
  });
}
