import { config } from "@/content/site";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `https://${config.domain}`).replace(/\/$/, "");
