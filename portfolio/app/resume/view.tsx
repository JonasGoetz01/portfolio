"use client";

import PageIntro from "../_components/page-intro";
import { useLanguage } from "@/lib/language";

export default function ResumeView() {
  const { t } = useLanguage();

  return (
    <section className="animate-rise-fast pt-[72px]">
      <PageIntro title={t.resume.title} intro={t.resume.intro} />

      <h2 className="mb-5 font-mono text-xs font-medium tracking-[0.06em] text-dim">
        {t.resume.experience}
      </h2>
      <div className="border-t border-line">
        {t.jobs.map((job) => (
          <div
            key={`${job.org}-${job.period}`}
            className="grid gap-6 border-b border-line py-[22px] sm:[grid-template-columns:180px_1fr]"
          >
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-brand">{job.period}</span>
              <span className="font-mono text-[11px] text-dim">{job.place}</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="text-[17px] font-semibold tracking-[-0.01em]">{job.role}</span>
              <span className="text-sm text-dim">{job.org}</span>
              {job.bullets && (
                <ul className="mt-[6px] flex list-disc flex-col gap-1 pl-4">
                  {job.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm leading-[1.55]">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-5 mt-12 font-mono text-xs font-medium tracking-[0.06em] text-dim">
        {t.resume.education}
      </h2>
      <div className="border-t border-line">
        {t.edu.map((entry) => (
          <div
            key={`${entry.title}-${entry.period}`}
            className="grid gap-6 border-b border-line py-5 sm:[grid-template-columns:180px_1fr]"
          >
            <span className="font-mono text-xs text-brand">{entry.period}</span>
            <div className="flex flex-col gap-[5px]">
              <span className="text-base font-semibold tracking-[-0.01em]">{entry.title}</span>
              <span className="text-sm text-dim">{entry.org}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-[18px] mt-12 font-mono text-xs font-medium tracking-[0.06em] text-dim">
        {t.resume.skills}
      </h2>
      <div className="flex flex-wrap gap-2">
        {t.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-line bg-surface px-3 py-[6px] font-mono text-xs"
          >
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-[22px] font-mono text-xs text-dim">{t.resume.cert}</p>
    </section>
  );
}
