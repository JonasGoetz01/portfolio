import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { pageData } from "@/pageData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: pageData.pageTitle,
  description: pageData.description,
  keywords: ["Jonas Götz", "Portfolio", "Software Engineer", "System Administrator"],
  authors: [{ name: "Jonas Götz", url: "https://goetz.sh" }],
  creator: "Jonas Götz"

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="absolute top-0 left-0 right-0 z-[-2] min-h-screen w-full bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <footer className="flex-shrink-0 py-5 sm:py-0 sm:pt-10 text-center text-sm text-muted-foreground mt-5 mb-7">
          Made by <strong>Jonas Götz</strong>
        </footer>

        {/* ------------------------------- Bottom Blur ------------------------------ */}
        <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background" />
      </body>
    </html>
  );
}
