import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import Backdrop from "./_components/backdrop";
import Contact from "./_components/contact";
import SiteHeader from "./_components/site-header";
import { ThemeProvider } from "./_components/theme-provider";
import { content, DEFAULT_LANG } from "@/lib/content";
import { LanguageProvider } from "@/lib/language";

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

const base = content[DEFAULT_LANG];

export const metadata: Metadata = {
  metadataBase: new URL("https://goetz.sh"),
  title: base.meta.title,
  description: base.meta.description,
  keywords: [
    "Jonas Götz",
    "Portfolio",
    "Head of IT",
    "42 Heilbronn",
    "Software Engineer",
    "System Administrator",
  ],
  authors: [{ name: "Jonas Götz", url: "https://goetz.sh" }],
  creator: "Jonas Götz",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={DEFAULT_LANG} suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen bg-bg font-sans text-ink antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <Backdrop />
            <SiteHeader />
            <main className="relative z-[1] mx-auto max-w-[900px] px-5 pb-24 sm:px-7">
              {children}
              <Contact />
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
