/**
 * The isometric four-layer stack: four plates lifted along the Z axis with
 * packets travelling up through them. CSS only — no canvas, no library.
 */
const PACKETS = [
  { left: "50%", top: "50%", size: 10, offset: "-5px 0 0 -5px", delay: "0s" },
  { left: "32%", top: "38%", size: 7, offset: "0", delay: "1.8s" },
  { left: "66%", top: "61%", size: 7, offset: "0", delay: "3.6s" },
];

const PLATES = [
  { inset: "0", border: "var(--line)", fill: "color-mix(in oklab,var(--ink) 5%,transparent)", z: 0 },
  {
    inset: "12px",
    border: "color-mix(in oklab,var(--brand) 45%,var(--line))",
    fill: "color-mix(in oklab,var(--brand) 6%,transparent)",
    z: 42,
  },
  {
    inset: "24px",
    border: "color-mix(in oklab,var(--brand) 65%,var(--line))",
    fill: "color-mix(in oklab,var(--brand) 9%,transparent)",
    z: 84,
  },
  {
    inset: "36px",
    border: "var(--brand)",
    fill: "color-mix(in oklab,var(--brand) 13%,transparent)",
    z: 126,
  },
];

export default function StackDiagram() {
  return (
    <div
      aria-hidden
      className="relative mx-auto h-[300px] w-[280px] max-w-full flex-none"
      style={{ perspective: "1000px" }}
    >
      <div
        className="animate-tilt-stack absolute left-1/2 top-1/2 h-[170px] w-[170px]"
        style={{ margin: "-40px 0 0 -85px", transformStyle: "preserve-3d" }}
      >
        {PLATES.map((plate) => (
          <div
            key={plate.inset}
            className="absolute"
            style={{
              inset: plate.inset,
              border: `1px solid ${plate.border}`,
              background: plate.fill,
              transform: `translateZ(${plate.z}px)`,
            }}
          />
        ))}
        {PACKETS.map((packet) => (
          <div
            key={packet.delay}
            className="animate-packet absolute bg-brand"
            style={{
              left: packet.left,
              top: packet.top,
              width: packet.size,
              height: packet.size,
              margin: packet.offset,
              animationDelay: packet.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
