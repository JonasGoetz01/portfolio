import Link from "next/link";

import type { PostLink } from "@/lib/blog";

/** Previous / next links, in the same order as the blog listing. */
export default function PostNav({ previous, next }: { previous?: PostLink; next?: PostLink }) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="More posts"
      className="mt-16 grid gap-4 border-t border-line pt-7 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/blog/${previous.slug}`}
          rel="prev"
          className="flex flex-col gap-[6px] rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-brand"
        >
          <span className="font-mono text-[11px] tracking-[0.05em] text-dim">← PREVIOUS</span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-pretty">
            {previous.title}
          </span>
        </Link>
      ) : (
        // Keeps a lone "next" card in the right-hand column.
        <span aria-hidden />
      )}

      {next && (
        <Link
          href={`/blog/${next.slug}`}
          rel="next"
          className="flex flex-col gap-[6px] rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-brand sm:items-end sm:text-right"
        >
          <span className="font-mono text-[11px] tracking-[0.05em] text-dim">NEXT →</span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-pretty">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
