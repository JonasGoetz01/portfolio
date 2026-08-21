import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "./actions";
import { BUTTON, HINT, LABEL } from "./_components/fields";
import { endSession, requireSession } from "@/lib/admin/auth";
import { BRANCH, REPO } from "@/lib/admin/config";
import { GitHubError } from "@/lib/admin/github";
import { listEntries, type EntrySummary } from "@/lib/admin/repo";
import { COLLECTIONS, SPECS, type CollectionSpec } from "@/lib/admin/spec";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Never prerendered. Without this the build — which has no admin environment and
 * no cookies — bakes in the redirect to the sign-in page, and a configured
 * deployment would serve that instead of ever reading the session.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ removed?: string }>;
}) {
  const { session } = await requireSession();
  const { removed } = await searchParams;

  let lists: { spec: CollectionSpec; entries: EntrySummary[] }[];
  try {
    lists = await Promise.all(
      COLLECTIONS.map(async (collection) => ({
        spec: SPECS[collection],
        entries: await listEntries(session.token, SPECS[collection]),
      })),
    );
  } catch (error) {
    // A revoked or expired token is a sign-in problem, not an error page.
    if (error instanceof GitHubError && error.status === 401) {
      await endSession();
      redirect("/admin/login?problem=exchange");
    }
    throw error;
  }

  return (
    <section className="animate-rise-fast pt-[72px]">
      <p className={`${LABEL} mb-2`}>Admin</p>
      <h1 className="mb-[10px] text-[clamp(30px,8vw,40px)] font-semibold leading-tight tracking-[-0.03em]">
        Content
      </h1>
      <p className="mb-4 max-w-[56ch] text-base leading-relaxed text-dim">
        Every save is a commit on{" "}
        <code className="font-mono text-[14px]">
          {REPO}@{BRANCH}
        </code>
        , which is the branch the site is built from — so the change is live once the deploy
        finishes.
      </p>
      <div className="mb-11 flex flex-wrap items-center gap-4">
        <span className={HINT}>
          Signed in as <span className="font-mono text-ink">{session.login}</span>
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="font-mono text-[12px] text-dim underline hover:text-brand"
          >
            Sign out
          </button>
        </form>
      </div>

      {removed && (
        <p role="status" className="mb-7 rounded-md border border-line bg-surface p-4 text-[14px]">
          <code className="font-mono">{removed}</code> was removed.
        </p>
      )}

      <div className="flex flex-col gap-12">
        {lists.map(({ spec, entries }) => (
          <div key={spec.collection}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{spec.plural}</h2>
              <Link href={`/admin/${spec.collection}/new`} className={`${BUTTON} no-underline`}>
                New {spec.label.toLowerCase()}
              </Link>
            </div>

            {entries.length === 0 ? (
              <p className={HINT}>Nothing here yet.</p>
            ) : (
              <ul className="flex list-none flex-col">
                {entries.map((entry) => (
                  <li key={entry.path} className="border-b border-line last:border-0">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                      <Link
                        href={`/admin/${spec.collection}/${entry.slug}`}
                        className="text-[16px] font-medium tracking-[-0.01em] underline decoration-line underline-offset-4 transition-colors hover:text-brand"
                      >
                        {entry.title}
                      </Link>
                      {entry.hidden && (
                        <span className="rounded border border-line bg-surface px-[6px] py-[2px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-dim">
                          off the site
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-4 font-mono text-[11.5px] text-dim">
                        {entry.meta && <span>{entry.meta}</span>}
                        <span>{entry.slug}</span>
                        {!entry.hidden && (
                          <Link
                            href={`${spec.route}/${entry.slug}`}
                            className="underline transition-colors hover:text-brand"
                          >
                            view
                          </Link>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
