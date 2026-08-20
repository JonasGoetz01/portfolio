"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { content } from "@/lib/content";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line backdrop-blur-[12px] [background:color-mix(in_oklab,var(--bg)_82%,transparent)]">
      <div className="mx-auto flex max-w-[900px] items-center px-5 py-[13px] sm:px-7 sm:py-4">
        <nav aria-label="Main" className="flex gap-[18px] sm:gap-5">
          {content.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b py-[2px] font-mono text-[12.5px] tracking-[0.02em] transition-colors ${
                  active ? "border-brand text-ink" : "border-transparent text-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
