/**
 * The résumé as a PDF, built from the same `lib/content.ts` data the page
 * renders. Generated at build time by `app/resume/jonas-goetz-cv.pdf/route.ts`,
 * so the file can never drift from the page.
 *
 * Server-only. @react-pdf uses its own layout engine, not the DOM, so the
 * styling here is deliberately separate from the site's CSS — but the palette
 * and the type scale are kept in step with the design tokens by hand.
 */

import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { EMAIL, GITHUB, LINKEDIN, SITE_URL, content } from "@/lib/content";

const INK = "#0f0f0f";
const DIM = "#5a5a5a";
const LINE = "#d8d8d8";
const BRAND = "#c2410c";

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 44, paddingHorizontal: 48, fontSize: 9.5, color: INK },

  name: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: -0.4 },
  role: { fontSize: 9.5, color: BRAND, fontFamily: "Helvetica-Bold", marginTop: 4 },
  contact: { fontSize: 8.5, color: DIM, marginTop: 6 },
  rule: { borderBottomWidth: 2, borderBottomColor: BRAND, width: 28, marginTop: 14 },

  sectionTitle: {
    fontSize: 8,
    letterSpacing: 1.1,
    color: DIM,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 7,
  },

  entry: { flexDirection: "row", marginBottom: 9 },
  when: { width: 104, fontSize: 8.5, color: DIM },
  what: { flex: 1 },
  entryTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  entryOrg: { fontSize: 9, color: DIM, marginTop: 1 },

  bullets: { marginTop: 3.5 },
  bullet: { flexDirection: "row", alignItems: "flex-start", marginTop: 1.5 },
  bulletMark: { width: 8, color: BRAND },
  bulletText: { flex: 1 },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 3,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    fontSize: 8.5,
    color: DIM,
  },

  certs: { marginTop: 9, fontSize: 8.5, color: DIM },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 7,
    fontSize: 7.5,
    color: DIM,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Entry({
  when,
  title,
  org,
  bullets,
}: {
  when: string;
  title: string;
  org: string;
  bullets?: string[];
}) {
  return (
    // `wrap={false}` keeps a single job from being split across two pages.
    <View style={styles.entry} wrap={false}>
      <Text style={styles.when}>{when}</Text>
      <View style={styles.what}>
        <Text style={styles.entryTitle}>{title}</Text>
        <Text style={styles.entryOrg}>{org}</Text>
        {bullets && bullets.length > 0 && (
          <View style={styles.bullets}>
            {bullets.map((bullet) => (
              <View key={bullet} style={styles.bullet}>
                <Text style={styles.bulletMark}>·</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function ResumeDocument() {
  const { resume, jobs, edu, skills, hero } = content;

  return (
    <Document
      title={`${hero.name} — ${resume.title}`}
      author={hero.name}
      subject={resume.title}
      keywords={skills.join(", ")}
      creator={SITE_URL}
    >
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{hero.name}</Text>
          <Text style={styles.role}>{hero.eyebrow}</Text>
          <Text style={styles.contact}>
            {EMAIL} · {SITE_URL.replace("https://", "")} · {GITHUB.replace("https://", "")} ·{" "}
            {LINKEDIN.replace("https://", "")}
          </Text>
          <View style={styles.rule} />
        </View>

        <Section title={resume.experience.toUpperCase()}>
          {jobs.map((job) => (
            <Entry
              key={`${job.org}-${job.period}`}
              when={`${job.period}\n${job.place}`}
              title={job.role}
              org={job.org}
              bullets={job.bullets}
            />
          ))}
        </Section>

        <Section title={resume.education.toUpperCase()}>
          {edu.map((entry) => (
            <Entry
              key={`${entry.title}-${entry.period}`}
              when={entry.period}
              title={entry.title}
              org={entry.org}
              bullets={entry.bullets}
            />
          ))}
        </Section>

        <Section title={resume.skills.toUpperCase()}>
          <View style={styles.tags}>
            {skills.map((skill) => (
              <Text key={skill} style={styles.tag}>
                {skill}
              </Text>
            ))}
          </View>
          <Text style={styles.certs}>
            {resume.certLabel}: {resume.certs.join(" · ")}
          </Text>
        </Section>

        <View style={styles.footer} fixed>
          <Text>
            {hero.name} — {resume.title}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

/** The finished PDF. Called once per build. */
export function renderResumePdf(): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument />);
}
