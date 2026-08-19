/** The shared title + lead paragraph that opens every sub-page. */
export default function PageIntro({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h1 className="mb-[10px] text-[40px] font-semibold leading-tight tracking-[-0.03em]">
        {title}
      </h1>
      <p className="mb-11 max-w-[52ch] text-base leading-relaxed text-dim">{intro}</p>
    </>
  );
}
