import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { seo } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: seo.title, description: seo.description, siteName: seo.title.split(" | ")[0] },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0D12",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint: drop .no-js, and keep .static-story only for reduced-motion visitors.
const bootScript = `(function(){var d=document.documentElement;d.classList.remove('no-js');if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.remove('static-story')}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`no-js static-story ${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body id="top">
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
