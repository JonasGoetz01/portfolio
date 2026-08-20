import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found — Jonas Götz",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="animate-rise-fast pt-[72px]">
      <span className="mb-[10px] block font-mono text-[11px] tracking-[0.05em] text-brand">
        404
      </span>
      <h1 className="mb-[10px] text-[clamp(30px,8vw,40px)] font-semibold leading-tight tracking-[-0.03em] hyphens-auto break-words">
        Nothing here
      </h1>
      <p className="mb-11 max-w-[52ch] text-base leading-relaxed text-dim">
        That page does not exist — it may have been renamed or never existed at all.
      </p>
      <Link
        href="/"
        className="font-mono text-[12.5px] text-brand transition-colors hover:text-ink"
      >
        ← Back home
      </Link>
    </section>
  );
}
