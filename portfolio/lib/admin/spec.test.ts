import { describe, expect, it } from "vitest";

import { COLLECTIONS, emptyDraft, fields, SPECS, validate, type Draft } from "./spec";

describe.each(COLLECTIONS)("the %s spec", (collection) => {
  const spec = SPECS[collection];

  /**
   * The form is a second ordering of the same fields, so it can drift. A field
   * missing from it would be written but not editable; a duplicate would render
   * two inputs bound to one value.
   */
  it("shows every field it writes, exactly once", () => {
    const written = fields(spec)
      .map((field) => field.name)
      .sort();
    const shown = spec.form.flat().sort();
    expect(shown).toEqual(written);
  });

  it("has no duplicate field names", () => {
    const names = fields(spec).map((field) => field.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("starts empty and invalid", () => {
    expect(validate(spec, emptyDraft(spec)).length).toBeGreaterThan(0);
  });
});

describe("validate", () => {
  const spec = SPECS.blog;

  function draft(overrides: Partial<Draft> = {}): Draft {
    const base = emptyDraft(spec);
    return {
      ...base,
      slug: "a-post",
      values: { ...base.values, title: "A post" },
      body: "Text.",
      ...overrides,
    };
  }

  it("accepts a complete entry", () => {
    expect(validate(spec, draft())).toEqual([]);
  });

  it("insists on a filename, and on that filename being a slug", () => {
    expect(validate(spec, draft({ slug: "" }))[0]).toContain("filename is required");
    expect(validate(spec, draft({ slug: "A Post" }))[0]).toContain("lowercase words");
    expect(validate(spec, draft({ slug: "a--post" }))[0]).toContain("lowercase words");
    expect(validate(spec, draft({ slug: "-post" }))[0]).toContain("lowercase words");
  });

  it("insists on a title", () => {
    const values = { ...draft().values, title: "   " };
    expect(validate(spec, draft({ values }))).toContain("Title is required.");
  });

  it("insists on text", () => {
    expect(validate(spec, draft({ body: "  \n " }))).toContain("The text is empty.");
  });

  it("checks the date", () => {
    const bad = { ...draft().values, date: "18.08.2026" };
    expect(validate(spec, draft({ values: bad }))[0]).toContain("2026-03-14");

    const impossible = { ...draft().values, date: "2026-02-31" };
    expect(validate(spec, draft({ values: impossible }))[0]).toContain("not a real date");

    const fine = { ...draft().values, date: "2026-08-18" };
    expect(validate(spec, draft({ values: fine }))).toEqual([]);
  });

  it("checks the order is a number", () => {
    const bad = { ...draft().values, order: "first" };
    expect(validate(spec, draft({ values: bad }))[0]).toContain("has to be a number");
  });

  it("catches alt text left behind after a picture was removed", () => {
    const values = { ...draft().values, hero: { src: "", alt: "The rack" } };
    expect(validate(spec, draft({ values }))[0]).toContain("no picture");
  });

  it("catches a gallery entry with no picture", () => {
    const values = { ...draft().values, images: [{ src: "", alt: "" }] };
    expect(validate(spec, draft({ values }))[0]).toContain("entry 1 has no picture");
  });
});
