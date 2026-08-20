import type { Metadata } from "next";

import ResumeView from "./view";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content.resume.title} — Jonas Götz`,
  description: content.meta.description,
};

export default function ResumePage() {
  return <ResumeView />;
}
