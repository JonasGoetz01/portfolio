/**
 * The fixed grid and the two accent glows that sit behind everything.
 * Purely decorative, so it never takes pointer events.
 */
export default function Backdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-55"
        style={{
          backgroundImage:
            "linear-gradient(to right,var(--line) 1px,transparent 1px),linear-gradient(to bottom,var(--line) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom,#000 0%,rgba(0,0,0,0.55) 22%,rgba(0,0,0,0.12) 48%,rgba(0,0,0,0.4) 78%,#000 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom,#000 0%,rgba(0,0,0,0.55) 22%,rgba(0,0,0,0.12) 48%,rgba(0,0,0,0.4) 78%,#000 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 z-0 h-[620px] w-[900px] -translate-x-1/2 opacity-[0.16] blur-[40px]"
        style={{
          top: "-260px",
          background: "radial-gradient(closest-side,var(--brand),transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed z-0 h-[760px] w-[760px] opacity-[0.09] blur-[60px]"
        style={{
          bottom: "-320px",
          right: "-160px",
          background: "radial-gradient(closest-side,var(--brand),transparent 70%)",
        }}
      />
    </>
  );
}
