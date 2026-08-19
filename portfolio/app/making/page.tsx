import type { Metadata } from "next";

import MakingView from "./view";
import { content, DEFAULT_LANG } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content[DEFAULT_LANG].makingPage.title} — Jonas Götz`,
  description: content[DEFAULT_LANG].makingPage.intro,
};

export default function MakingPage() {
  return <MakingView />;
}
