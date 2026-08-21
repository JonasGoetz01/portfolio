"use client";

/**
 * The inputs the editor is built from, and the class strings they share.
 *
 * Every control is a real labelled form field — the admin is a page on the site
 * and is held to the same standard as the rest of it, hints included, which is
 * also what makes the frontmatter conventions discoverable while typing.
 */

import { useRef, useState, useTransition } from "react";

import { uploadAction } from "../actions";
import type { Collection, Field, ImageValue } from "@/lib/admin/spec";

export const LABEL = "font-mono text-[11px] uppercase tracking-[0.06em] text-dim";
export const INPUT =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-[15px] text-ink outline-none transition-colors focus:border-brand";
export const HINT = "text-[12.5px] leading-relaxed text-dim";
export const BUTTON =
  "rounded-md bg-brand px-4 py-[9px] font-mono text-[12.5px] text-bg transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50";
export const BUTTON_QUIET =
  "rounded-md border border-line bg-bg px-4 py-[9px] font-mono text-[12.5px] text-ink transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50";

/** Label, control, hint — the same vertical rhythm for every field. */
export function Row({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className={HINT}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** A text, date, number or comma-separated list field, driven by the spec. */
export function ScalarField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}) {
  const id = `field-${field.name}`;
  const described = field.hint ? `${id}-hint` : undefined;

  if (field.kind === "list") {
    return (
      <Row id={id} label={field.label} hint={field.hint}>
        <input
          id={id}
          type="text"
          className={INPUT}
          placeholder={field.placeholder}
          aria-describedby={described}
          value={(value as string[]).join(", ")}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />
      </Row>
    );
  }

  if (field.kind === "long") {
    return (
      <Row id={id} label={field.label} hint={field.hint}>
        <textarea
          id={id}
          rows={2}
          className={`${INPUT} resize-y leading-relaxed`}
          placeholder={field.placeholder}
          aria-describedby={described}
          required={field.required}
          value={value as string}
          onChange={(event) => onChange(event.target.value)}
        />
      </Row>
    );
  }

  return (
    <Row id={id} label={field.label} hint={field.hint}>
      <input
        id={id}
        type={field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text"}
        className={`${INPUT} ${field.kind === "date" || field.kind === "number" ? "max-w-[220px]" : ""}`}
        placeholder={field.placeholder}
        aria-describedby={described}
        required={field.required}
        value={value as string}
        onChange={(event) => onChange(event.target.value)}
      />
    </Row>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pictures                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Pick a file, and it is converted to AVIF and committed before the button
 * finishes — what comes back is the `gh:` path to put in the frontmatter. Which
 * is why the entry needs a filename first: the picture is committed under it.
 */
function useUpload(collection: Collection, slug: string) {
  const [pending, start] = useTransition();
  const [problem, setProblem] = useState("");

  function upload(file: File, onDone: (reference: string) => void) {
    setProblem("");
    start(async () => {
      const form = new FormData();
      form.set("collection", collection);
      form.set("slug", slug);
      form.set("file", file);
      const result = await uploadAction(form);
      if (result.ok) onDone(result.reference);
      else setProblem(result.problem);
    });
  }

  return { upload, pending, problem };
}

function UploadButton({
  id,
  label,
  disabled,
  pending,
  onFile,
}: {
  id: string;
  label: string;
  disabled: boolean;
  pending: boolean;
  onFile: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className={BUTTON_QUIET}
        disabled={disabled || pending}
        onClick={() => input.current?.click()}
      >
        {pending ? "Converting…" : label}
      </button>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared, so picking the same file twice in a row still fires.
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}

/** The `src` and `alt` of one picture, with the uploader that fills in `src`. */
export function PictureField({
  field,
  value,
  collection,
  slug,
  onChange,
}: {
  field: Field;
  value: ImageValue;
  collection: Collection;
  slug: string;
  onChange: (value: ImageValue) => void;
}) {
  const id = `field-${field.name}`;
  const { upload, pending, problem } = useUpload(collection, slug);

  return (
    <fieldset className="flex flex-col gap-[10px] rounded-md border border-line bg-surface p-4">
      <legend className={`${LABEL} px-1`}>{field.label}</legend>
      {field.hint && <p className={HINT}>{field.hint}</p>}

      <Row id={`${id}-src`} label="Path">
        <input
          id={`${id}-src`}
          type="text"
          className={`${INPUT} font-mono text-[13px]`}
          placeholder="gh:blog/homelab/hero.avif"
          value={value.src}
          onChange={(event) => onChange({ ...value, src: event.target.value })}
        />
      </Row>

      <Row
        id={`${id}-alt`}
        label="Alt text"
        hint="What the picture shows, for anyone who cannot see it. Left empty, the title is used."
      >
        <input
          id={`${id}-alt`}
          type="text"
          className={INPUT}
          value={value.alt}
          onChange={(event) => onChange({ ...value, alt: event.target.value })}
        />
      </Row>

      <div className="flex flex-wrap items-center gap-3">
        <UploadButton
          id={`${id}-file`}
          label={value.src ? "Replace picture…" : "Upload a picture…"}
          disabled={!slug}
          pending={pending}
          onFile={(file) => upload(file, (reference) => onChange({ ...value, src: reference }))}
        />
        <span className={HINT}>
          {slug ? "Converted to AVIF, then committed." : "Set the filename first."}
        </span>
      </div>

      {problem && <p className="text-[13px] text-brand">{problem}</p>}
    </fieldset>
  );
}

/** A list of pictures, each with its own alt text. */
export function GalleryField({
  field,
  value,
  collection,
  slug,
  onChange,
}: {
  field: Field;
  value: ImageValue[];
  collection: Collection;
  slug: string;
  onChange: (value: ImageValue[]) => void;
}) {
  const { upload, pending, problem } = useUpload(collection, slug);

  function update(index: number, next: ImageValue) {
    onChange(value.map((image, at) => (at === index ? next : image)));
  }

  return (
    <fieldset className="flex flex-col gap-[10px] rounded-md border border-line bg-surface p-4">
      <legend className={`${LABEL} px-1`}>{field.label}</legend>
      {field.hint && <p className={HINT}>{field.hint}</p>}

      {value.map((image, index) => (
        <div
          key={index}
          className="flex flex-col gap-[6px] rounded-md border border-line bg-bg p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className={LABEL}>Picture {index + 1}</span>
            <button
              type="button"
              className="font-mono text-[11px] text-dim underline transition-colors hover:text-brand"
              onClick={() => onChange(value.filter((_, at) => at !== index))}
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            aria-label={`Picture ${index + 1} path`}
            className={`${INPUT} font-mono text-[13px]`}
            value={image.src}
            onChange={(event) => update(index, { ...image, src: event.target.value })}
          />
          <input
            type="text"
            aria-label={`Picture ${index + 1} alt text`}
            placeholder="Alt text"
            className={INPUT}
            value={image.alt}
            onChange={(event) => update(index, { ...image, alt: event.target.value })}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <UploadButton
          id={`field-${field.name}-file`}
          label="Add a picture…"
          disabled={!slug}
          pending={pending}
          onFile={(file) =>
            upload(file, (reference) => onChange([...value, { src: reference, alt: "" }]))
          }
        />
        {!slug && <span className={HINT}>Set the filename first.</span>}
      </div>

      {problem && <p className="text-[13px] text-brand">{problem}</p>}
    </fieldset>
  );
}

export { useUpload, UploadButton };
