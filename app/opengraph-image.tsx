import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config, seo } from "@/content/site";

export const runtime = "nodejs";
export const alt = seo.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const bg = await readFile(path.join(process.cwd(), "public/img/og-base.jpg"));
  const src = `data:image/jpeg;base64,${bg.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} alt="" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,13,18,.92) 0%, rgba(10,13,18,.55) 48%, rgba(10,13,18,0) 75%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 720 }}>
          <div style={{ color: "#FF6B2C", fontSize: 22, letterSpacing: 4, marginBottom: 22 }}>{`${config.cityState.toUpperCase()} · HEATING & AIR`}</div>
          <div style={{ color: "#F4ECDF", fontSize: 84, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>{seo.ogHeadline}</div>
          <div style={{ color: "rgba(244,236,223,.8)", fontSize: 28, marginTop: 28 }}>{`${config.businessName} · ${config.phone}`}</div>
        </div>
      </div>
    ),
    size
  );
}
