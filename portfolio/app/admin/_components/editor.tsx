"use client";

/**
 * The form that writes one Markdown file.
 *
 * It holds the whole entry in one piece of state and posts it as JSON in a
 * hidden field, rather than as three dozen named inputs — the fields are
 * generated from the collection's spec, and a list of pictures has no sensible
 * flat form encoding anyway. The server reads it back through the same spec.
 */

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { deleteAction, saveAction } from "../actions";
import {
  BUTTON,
  BUTTON_QUIET,
  GalleryField,
  HINT,
  INPUT,
  LABEL,
  PictureField,
  Row,
  ScalarField,
  UploadButton,
  useUpload,
} from "./fields";
import {
  SPECS,
  field as fieldFor,
  type Collection,
  type Draft,
  type ImageValue,
} from "@/lib/admin/spec";

export default function Editor({
  collection,
  draft: initial,
  hidden: initialHidden,
  sha,
  path,
  savedCommit,
}: {
  collection: Collection;
  draft: Draft;
  hidden: boolean;
  /** Blob sha of the file being replaced. Empty for a new entry. */
  sha: string;
  /** Path of the file being replaced. Empty for a new entry. */
  path: string;
  /** Commit sha, when this page was reached by saving. */
  savedCommit?: string;
}) {
  const spec = SPECS[collection];
  const isNew = !path;

  const [draft, setDraft] = useState(initial);
  const [hidden, setHidden] = useState(initialHidden);
  const [state, submit, saving] = useActionState(saveAction, null);
  const [confirming, setConfirming] = useState(false);

  // Compared as text: the draft is a plain tree, and this is the cheapest way to
  // know whether anything at all differs from the file that was loaded.
  const dirty =
    JSON.stringify({ draft, hidden }) !== JSON.stringify({ draft: initial, hidden: initialHidden });

  // A tab closed mid-post loses the post: nothing is stored until it is
  // committed, so the browser gets to ask.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function setValue(name: string, value: Draft["values"][string]) {
    setDraft((current) => ({ ...current, values: { ...current.values, [name]: value } }));
  }

  const title =
    (draft.values.title as string) || draft.slug || `Untitled ${spec.label.toLowerCase()}`;

  return (
    <section className="animate-rise-fast pt-[72px]">
      <p className={`${LABEL} mb-2`}>
        <Link href="/admin" className="transition-colors hover:text-brand">
          Admin
        </Link>
        {" / "}
        {spec.plural}
      </p>

      <h1 className="mb-[10px] text-[clamp(26px,7vw,34px)] font-semibold leading-tight tracking-[-0.03em] break-words">
        {isNew ? `New ${spec.label.toLowerCase()}` : title}
      </h1>

      <p className="mb-9 max-w-[56ch] text-[15px] leading-relaxed text-dim">
        Saving commits to the branch the site is built from, so the change is live once the deploy
        finishes — a minute or two.
      </p>

      {savedCommit && (
        <Notice tone="good">
          Committed as <code className="font-mono text-[13px]">{savedCommit.slice(0, 7)}</code>. The
          site rebuilds itself from here.{" "}
          <Link href={`${spec.route}/${draft.slug}`} className="underline">
            The page
          </Link>{" "}
          shows the new version once it has.
        </Notice>
      )}

      {state?.problems.length ? (
        <Notice tone="bad">
          <ul className="flex list-none flex-col gap-1">
            {state.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <form action={submit} className="flex flex-col gap-7">
        <input type="hidden" name="collection" value={collection} />
        <input type="hidden" name="path" value={path} />
        <input type="hidden" name="sha" value={sha} />
        <input type="hidden" name="draft" value={JSON.stringify(draft)} />
        {hidden && <input type="hidden" name="hidden" value="on" />}

        <fieldset className="flex flex-col gap-[10px] rounded-md border border-line bg-surface p-4">
          <legend className={`${LABEL} px-1`}>File</legend>
          <Row
            id="field-slug"
            label="Filename"
            hint={
              isNew
                ? `Lowercase words with hyphens. It is also the URL: ${spec.route}/<filename>.`
                : `Changing this moves the file, and the old URL ${spec.route}/${initial.slug} stops working.`
            }
          >
            <div className="flex items-center gap-2">
              <input
                id="field-slug"
                type="text"
                required
                inputMode="url"
                aria-describedby="field-slug-hint"
                className={`${INPUT} max-w-[340px] font-mono text-[14px]`}
                value={draft.slug}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    slug: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
              />
              <span className="font-mono text-[13px] text-dim">.md</span>
            </div>
          </Row>

          <label className="flex items-start gap-[10px] pt-1 text-[14px] leading-relaxed">
            <input
              type="checkbox"
              className="mt-[3px] size-4 accent-[var(--brand)]"
              checked={hidden}
              onChange={(event) => setHidden(event.target.checked)}
            />
            <span>
              Keep it off the site
              <span className={`block ${HINT}`}>
                Saves as <code className="font-mono">_{draft.slug || "filename"}.md</code>. The file
                stays in the repository; the page and the listing do not appear.
              </span>
            </span>
          </label>
        </fieldset>

        {spec.form.map((group, index) => (
          <div key={index} className="flex flex-col gap-5">
            {group.map((name) => {
              const field = fieldFor(spec, name);
              if (field.kind === "image")
                return (
                  <PictureField
                    key={name}
                    field={field}
                    collection={collection}
                    slug={draft.slug}
                    value={draft.values[name] as ImageValue}
                    onChange={(value) => setValue(name, value)}
                  />
                );
              if (field.kind === "images")
                return (
                  <GalleryField
                    key={name}
                    field={field}
                    collection={collection}
                    slug={draft.slug}
                    value={draft.values[name] as ImageValue[]}
                    onChange={(value) => setValue(name, value)}
                  />
                );
              return (
                <ScalarField
                  key={name}
                  field={field}
                  value={draft.values[name] as string | string[]}
                  onChange={(value) => setValue(name, value)}
                />
              );
            })}
          </div>
        ))}

        <BodyField
          collection={collection}
          slug={draft.slug}
          value={draft.body}
          onChange={(body) => setDraft((current) => ({ ...current, body }))}
        />

        {Object.keys(draft.extra).length > 0 && (
          <p className={HINT}>
            This file also has{" "}
            <code className="font-mono">{Object.keys(draft.extra).join(", ")}</code> in its
            frontmatter. The editor does not touch those, and writes them back as they are.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <button type="submit" className={BUTTON} disabled={saving}>
            {saving ? "Committing…" : isNew ? `Create the ${spec.label.toLowerCase()}` : "Save"}
          </button>
          <span className={HINT}>
            {dirty ? "Unsaved changes." : savedCommit ? "Saved." : "No changes yet."}
          </span>
        </div>
      </form>

      {!isNew && (
        <div className="mt-11 flex flex-col gap-3 border-t border-line pt-6">
          <span className={LABEL}>Danger</span>
          <form action={deleteAction} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="collection" value={collection} />
            <input type="hidden" name="path" value={path} />
            <input type="hidden" name="sha" value={sha} />
            <input type="hidden" name="slug" value={initial.slug} />
            <input type="hidden" name="title" value={title} />
            {confirming ? (
              <>
                <button type="submit" className={BUTTON}>
                  Yes, delete it
                </button>
                <button type="button" className={BUTTON_QUIET} onClick={() => setConfirming(false)}>
                  Keep it
                </button>
                <span className={HINT}>
                  The commit removes the file. Its history, and its pictures under{" "}
                  <code className="font-mono">assets/</code>, stay.
                </span>
              </>
            ) : (
              <button type="button" className={BUTTON_QUIET} onClick={() => setConfirming(true)}>
                Delete this {spec.label.toLowerCase()}
              </button>
            )}
          </form>
        </div>
      )}
    </section>
  );
}

/**
 * The Markdown body, plus an uploader that drops an `![alt](gh:…)` line in at the
 * cursor — the way a picture gets between two paragraphs rather than into the
 * frontmatter.
 */
function BodyField({
  collection,
  slug,
  value,
  onChange,
}: {
  collection: Collection;
  slug: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  const { upload, pending, problem } = useUpload(collection, slug);

  function insert(reference: string) {
    const snippet = `![](${reference})`;
    const element = area.current;
    const at = element ? element.selectionStart : value.length;
    const before = value.slice(0, at).replace(/\n+$/, "");
    const after = value.slice(at).replace(/^\n+/, "");
    onChange(`${before}\n\n${snippet}\n\n${after}`.replace(/^\n+/, ""));
  }

  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor="field-body" className={LABEL}>
        Text
      </label>
      <textarea
        id="field-body"
        ref={area}
        aria-describedby="field-body-hint"
        spellCheck
        className="min-h-[440px] w-full rounded-md border border-line bg-bg p-4 font-mono text-[13.5px] leading-[1.7] text-ink outline-none transition-colors focus:border-brand"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <p id="field-body-hint" className={HINT}>
        Markdown. Blank lines separate paragraphs; a single newline is just a line wrap, so lines
        can stay short here. <code className="font-mono">##</code> for a section heading.
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <UploadButton
          id="field-body-file"
          label="Insert a picture at the cursor…"
          disabled={!slug}
          pending={pending}
          onFile={(file) => upload(file, insert)}
        />
        <span className={HINT}>Remember to fill in the alt text it leaves empty.</span>
      </div>
      {problem && <p className="text-[13px] text-brand">{problem}</p>}
    </div>
  );
}

function Notice({ tone, children }: { tone: "good" | "bad"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      className={`mb-7 rounded-md border p-4 text-[14px] leading-relaxed ${
        tone === "bad" ? "border-brand bg-surface" : "border-line bg-surface"
      }`}
    >
      {children}
    </div>
  );
}
