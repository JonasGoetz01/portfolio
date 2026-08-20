import { renderResumePdf } from "@/lib/resume-pdf";

/** Rendered once during `next build` and served as a static file. */
export const dynamic = "force-static";

export async function GET() {
  const pdf = await renderResumePdf();

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="jonas-goetz-cv.pdf"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
