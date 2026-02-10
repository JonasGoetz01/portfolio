export const dynamic = "force-static";
export const runtime = "nodejs";

// biome-ignore lint/style/useNodejsImportProtocol: path
import { join } from "path";
import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";
// biome-ignore lint/style/useNodejsImportProtocol: fs/promises
import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";

import { pageData } from "@/pageData";

export const alt = pageData.pageTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function FAIcon({ icon, size = 24, color = "#000" }: { icon: IconDefinition; size?: number; color?: string }) {
    const [width, height, , , path] = icon.icon;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${width} ${height}`}
            width={size}
            height={size}
            fill={color}
        >
            <path d={path as string} />
        </svg>
    );
}

export default async function Image() {
    const imageBuffer = await readFile(join(process.cwd(), "public", "jonas.jpg"));
    const imageBase64 = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`;

    const interRegular = readFile(join(process.cwd(), "fonts", "Inter-Regular.ttf"));
    const interBold = readFile(join(process.cwd(), "fonts", "Inter-Bold.ttf"));

    return new ImageResponse(
        <div tw="flex flex-col items-center justify-center w-full h-full bg-white p-4" style={{ fontFamily: "Inter" }}>
            <div tw="flex flex-row items-center justify-center w-full max-w-[1090px]" style={{ gap: "50px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageBase64} alt={pageData.pageTitle} width={290} height={290} tw="rounded-full shadow-lg" />

                <div tw="flex flex-col justify-center flex-1" style={{ gap: "22px" }}>
                    <h1 tw="font-bold text-7xl mb-0 mt-0">{pageData.heading}</h1>
                    <p tw="max-w-[800px] text-2xl mb-0 mt-0">{pageData.description}</p>

                    <div tw="flex flex-wrap" style={{ gap: "12px" }}>
                        {pageData.links.map((link) => (
                            <span
                                key={link.label}
                                tw="border-slate-200 px-2.5 py-1 text-xl rounded-md font-bold text-slate-900 flex items-center justify-center bg-black text-white shadow-sm"
                                style={{ gap: "6px" }}
                            >
                                <FAIcon icon={link.icon} color="#fff" /> {link.username}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        {
            ...size,
            fonts: [
                { name: "Inter", data: await interRegular, weight: 400 },
                { name: "Inter", data: await interBold, weight: 700 },
            ],
            emoji: "noto",
        },
    );
}
