import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import Editor from "../../_components/editor";
import { endSession, requireSession } from "@/lib/admin/auth";
import { GitHubError } from "@/lib/admin/github";
import { loadEntry, type LoadedEntry } from "@/lib/admin/repo";
import { isCollection, SPECS } from "@/lib/admin/spec";

export const metadata: Metadata = {
  title: "Edit — Admin",
  robots: { index: false, follow: false },
};

/**
 * Never prerendered. Without this the build — which has no admin environment and
 * no cookies — bakes in the redirect to the sign-in page, and a configured
 * deployment would serve that instead of ever reading the session.
 */
export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { session } = await requireSession();

  const { collection, slug } = await params;
  if (!isCollection(collection)) notFound();
  const { saved } = await searchParams;

  // The file is read from the branch, not from the build this page is served
  // from — an entry saved a moment ago has to be editable before the redeploy.
  let loaded: LoadedEntry | null;
  try {
    loaded = await loadEntry(session.token, SPECS[collection], slug);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 401) {
      await endSession();
      redirect("/admin/login?problem=exchange");
    }
    throw error;
  }

  if (!loaded) notFound();

  return (
    <Editor
      collection={collection}
      draft={loaded.draft}
      hidden={loaded.hidden}
      sha={loaded.sha}
      path={loaded.path}
      savedCommit={saved}
    />
  );
}
