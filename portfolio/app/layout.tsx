import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import Backdrop from "./_components/backdrop";
import Contact from "./_components/contact";
import SiteHeader from "./_components/site-header";
import StructuredData from "./_components/structured-data";
import { SITE_URL, content } from "@/lib/content";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: content.meta.title,
  description: content.meta.description,
  keywords: [
    "Jonas Götz",
    "Portfolio",
    "Head of IT",
    "42 Heilbronn",
    "Software Engineer",
    "System Administrator",
  ],
  authors: [{ name: "Jonas Götz", url: SITE_URL }],
  creator: "Jonas Götz",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen bg-bg font-sans text-ink antialiased`}
      >
        <StructuredData />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:font-mono focus:text-[12.5px] focus:text-bg"
        >
          Skip to content
        </a>
        <Backdrop />
        <SiteHeader />
        <main id="content" className="relative z-[1] mx-auto max-w-[900px] px-5 pb-24 sm:px-7">
          {children}
          <Contact />
        </main>
      </body>
    </html>
  );
}
