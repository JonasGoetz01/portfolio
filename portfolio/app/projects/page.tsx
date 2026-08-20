import type { Metadata } from "next";

import ProjectsView from "./view";
import { content } from "@/lib/content";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: `${content.projectsPage.title} — Jonas Götz`,
  description: content.projectsPage.intro,
};

export default function ProjectsPage() {
  // Read on the server, render in the client view — the language toggle needs
  // both languages in the browser.
  return <ProjectsView projects={getProjects()} />;
}
