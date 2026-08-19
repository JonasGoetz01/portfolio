import type { Metadata } from "next";

import ProjectsView from "./view";
import { content, DEFAULT_LANG } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content[DEFAULT_LANG].projectsPage.title} — Jonas Götz`,
  description: content[DEFAULT_LANG].projectsPage.intro,
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
