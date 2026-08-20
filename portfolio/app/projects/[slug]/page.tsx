import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectDetailView from "./view";
import { getProject, getProjects } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

/** Only the slugs in the content folder exist; anything else is a 404 at build time. */
export const dynamicParams = false;

/** One static page per file in content/projects/. */
export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Jonas Götz`,
    description: project.subtitle,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetailView project={project} />;
}
