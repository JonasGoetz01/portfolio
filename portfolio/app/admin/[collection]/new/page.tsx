import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Editor from "../../_components/editor";
import { requireSession } from "@/lib/admin/auth";
import { emptyDraft, isCollection, SPECS } from "@/lib/admin/spec";

export const metadata: Metadata = {
  title: "New entry — Admin",
  robots: { index: false, follow: false },
};

/**
 * Never prerendered. Without this the build — which has no admin environment and
 * no cookies — bakes in the redirect to the sign-in page, and a configured
 * deployment would serve that instead of ever reading the session.
 */
export const dynamic = "force-dynamic";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  await requireSession();

  const { collection } = await params;
  if (!isCollection(collection)) notFound();

  const spec = SPECS[collection];
  const draft = emptyDraft(spec);

  // A post is nearly always for today; a wrong date is easier to notice than a
  // missing one, which silently sorts the post above everything else.
  if (collection === "blog") draft.values.date = new Date().toISOString().slice(0, 10);

  return <Editor collection={collection} draft={draft} hidden={false} sha="" path="" />;
}
