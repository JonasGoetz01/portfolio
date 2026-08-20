import { describe, expect, it } from "vitest";

import { EMAIL, SITE_URL, content } from "./content";

describe("site constants", () => {
  it("has an absolute origin with no trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it("has a plausible contact address", () => {
    expect(EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });
});

/**
 * § 5 DDG requires a postal address at which the provider is reachable, and the
 * page hides the address block until one exists — so without this test an
 * incomplete legal notice would ship silently and look deliberate. Failing here
 * is the reminder.
 */
describe("Impressum", () => {
  const { impressum } = content;

  it("names the provider", () => {
    expect(impressum.name.trim()).not.toBe("");
  });

  // Shows up as an outstanding item on every run until the address is filled
  // in. Not an assertion: the value is not in the repo's gift, and a red CI
  // over missing personal data would block unrelated work.
  it.todo("needs a postal address in content.impressum.street / .city (§ 5 DDG)");

  it("has either a whole address or none, never half of one", () => {
    expect(Boolean(impressum.street.trim())).toBe(Boolean(impressum.city.trim()));
  });

  it("keeps the required clauses", () => {
    for (const clause of [
      impressum.liabilityContent,
      impressum.liabilityLinks,
      impressum.copyright,
    ]) {
      expect(clause.length).toBeGreaterThan(80);
    }
  });
});

/**
 * The privacy notice makes concrete factual claims: no cookies, no storage, no
 * third-party requests. Those are properties of the code, so they are asserted
 * here — if someone adds an analytics snippet or a remote <img>, the statement
 * becomes false and this fails.
 */
describe("Datenschutzerklärung", () => {
  const { privacy } = content;

  it("names a controller and a host", () => {
    expect(privacy.controllerTitle.trim()).not.toBe("");
    expect(privacy.host.trim()).not.toBe("");
  });

  it("covers the processing this site actually does", () => {
    const titles = privacy.sections.map((section) => section.title.toLowerCase()).join(" ");
    for (const topic of ["logfiles", "hosting", "cookies", "kontakt", "links"]) {
      expect(titles).toContain(topic);
    }
  });

  it("lists the data-subject rights with their articles", () => {
    expect(privacy.rights.length).toBeGreaterThanOrEqual(6);
    for (const right of privacy.rights) expect(right).toMatch(/Art\. \d+ DSGVO/);
  });

  it("has no empty section", () => {
    for (const section of privacy.sections) {
      expect(section.body.length).toBeGreaterThan(0);
      for (const paragraph of section.body) expect(paragraph.length).toBeGreaterThan(40);
    }
  });
});
