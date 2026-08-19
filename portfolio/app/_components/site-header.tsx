"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { useLanguage } from "@/lib/language";
import { useHydrated } from "@/lib/use-hydrated";

export default function SiteHeader() {
  const { lang, t, toggleLang } = useLanguage();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // next-themes only knows the resolved theme in the browser; render a neutral
  // label until then so the server and client markup agree.
  const hydrated = useHydrated();
  const themeLabel = !hydrated ? "THEME" : resolvedTheme === "dark" ? "LIGHT" : "DARK";

  return (
    <header className="sticky top-0 z-20 border-b border-line backdrop-blur-[12px] [background:color-mix(in_oklab,var(--bg)_82%,transparent)]">
      <div className="mx-auto flex max-w-[900px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-7">
        <Link
          href="/"
          className="font-mono text-[13px] font-medium tracking-[-0.01em] text-ink"
        >
          jonas<span className="animate-blip text-brand">.</span>goetz
        </Link>

        <nav className="order-3 flex w-full gap-5 sm:order-none sm:ml-auto sm:w-auto">
          {t.nav.map((item) => {
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

        <div className="ml-auto flex items-center gap-2 sm:ml-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={lang === "de" ? "Switch to English" : "Auf Deutsch umschalten"}
            className="cursor-pointer rounded-full border border-line bg-surface px-[10px] py-1 font-mono text-[11px] text-dim transition-colors hover:text-ink"
          >
            {lang === "de" ? "EN" : "DE"}
          </button>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle colour theme"
            className="cursor-pointer rounded-full border border-line bg-surface px-[10px] py-1 font-mono text-[11px] text-dim transition-colors hover:text-ink"
          >
            {themeLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
