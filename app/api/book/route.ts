/**
 * POST /api/book
 * Validates with zod, drops honeypot submissions, rate-limits per IP, then forwards JSON to
 * BOOKING_WEBHOOK_URL (n8n). If that isn't set but RESEND_API_KEY is, emails BOOKING_TO_EMAIL.
 */
import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/bookingSchema";
import { booking, config } from "@/content/site";

export const runtime = "nodejs";

// Best-effort in-memory limiter (per serverless instance). Put a real limiter
// (Vercel Firewall rule, Upstash) in front if spam becomes a problem.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please call us instead." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: booking.error }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot filled → pretend success so bots learn nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) return NextResponse.json({ ok: true });
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }
  const { company: _hp, ...data } = parsed.data;
  void _hp;

  const payload = {
    type: "booking_request",
    business: config.businessName,
    source: config.domain,
    submittedAt: new Date().toISOString(),
    ...data,
  };

  const webhook = process.env.BOOKING_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;

  try {
    if (webhook) {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`webhook ${r.status}`);
      return NextResponse.json({ ok: true });
    }
    if (resendKey && process.env.BOOKING_TO_EMAIL) {
      const rows = Object.entries(data)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(String(v))}</td></tr>`)
        .join("");
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.BOOKING_FROM_EMAIL || "Website <onboarding@resend.dev>",
          to: [process.env.BOOKING_TO_EMAIL],
          reply_to: data.email,
          subject: `New booking request: ${data.service} · ${data.name} (${data.zip})`,
          html: `<h2>New booking request</h2><table>${rows}</table><p>Submitted ${esc(payload.submittedAt)}</p>`,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`resend ${r.status}`);
      return NextResponse.json({ ok: true });
    }
    if (process.env.NODE_ENV !== "production") {
      console.info("[book] no delivery configured; payload:", payload);
      return NextResponse.json({ ok: true, dev: true });
    }
    console.error("[book] BOOKING_WEBHOOK_URL / RESEND_API_KEY not configured");
    return NextResponse.json({ ok: false, error: `Online booking isn't connected yet. Please call ${config.phone}.` }, { status: 503 });
  } catch (e) {
    console.error("[book] delivery failed:", (e as Error).message);
    return NextResponse.json({ ok: false, error: booking.error }, { status: 502 });
  }
}
