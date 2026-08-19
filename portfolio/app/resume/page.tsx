import type { Metadata } from "next";

import ResumeView from "./view";
import { content, DEFAULT_LANG } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content[DEFAULT_LANG].resume.title} — Jonas Götz`,
  description: content[DEFAULT_LANG].resume.intro,
};

export default function ResumePage() {
  return <ResumeView />;
}
