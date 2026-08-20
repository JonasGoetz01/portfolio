/** The shared title + optional lead paragraph that opens every sub-page. */
export default function PageIntro({ title, intro }: { title: string; intro?: string }) {
  return (
    <>
      <h1
        className={`text-[clamp(30px,8vw,40px)] font-semibold leading-tight tracking-[-0.03em] hyphens-auto break-words ${
          intro ? "mb-[10px]" : "mb-11"
        }`}
      >
        {title}
      </h1>
      {intro && <p className="mb-11 max-w-[52ch] text-base leading-relaxed text-dim">{intro}</p>}
    </>
  );
}
