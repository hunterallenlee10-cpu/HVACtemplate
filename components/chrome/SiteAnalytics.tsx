"use client";
/** Vercel Analytics everywhere except local machines (the script only exists on Vercel). */
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

export default function SiteAnalytics() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const h = window.location.hostname;
    setOn(!(h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")));
  }, []);
  return on ? <Analytics /> : null;
}
