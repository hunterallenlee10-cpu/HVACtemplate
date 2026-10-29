"use client";
import { useState } from "react";
import { booking as B, config } from "@/content/site";
import SectionHead from "./SectionHead";

type Status = "idle" | "sending" | "done" | "error";

export default function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    // zod is loaded on demand to keep it out of the initial bundle
    const { bookingSchema } = await import("@/lib/bookingSchema");
    const parsed = bookingSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      const first = Object.keys(errs)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setServerError(json.error || B.error);
        if (json.fieldErrors) setErrors(json.fieldErrors);
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setServerError(B.error);
      setStatus("error");
    }
  }

  const err = (k: string) =>
    errors[k] ? (
      <span className="field__err" id={`err-${k}`}>
        {errors[k]}
      </span>
    ) : null;
  const a11y = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `err-${k}` : undefined });

  return (
    <section id={B.id} className="section book" aria-labelledby="book-h">
      <div className="book__grid">
        <div className="book__intro">
          <SectionHead eyebrow={B.eyebrow} heading={B.heading} accent={B.accent} sub={B.sub} id="book-h" />
          <p className="book__call">
            {B.orCall}{" "}
            <a href={config.phoneHref} className="book__phone">
              {config.phone}
            </a>
          </p>
          <p className="footnote">{config.hours}</p>
        </div>

        {status === "done" ? (
          <div className="book__done card" role="status" aria-live="polite">
            <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
              <circle cx="24" cy="24" r="22" fill="none" stroke="var(--ember)" strokeWidth="2" />
              <path d="M14 24.5l7 7 13-14" fill="none" stroke="var(--ember)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="book__done-h">{B.success}</p>
            <p className="body">
              {B.successSub} <a href={config.phoneHref}>{config.phone}</a>.
            </p>
          </div>
        ) : (
          <form className="book__form card" onSubmit={onSubmit} noValidate>
            <div className="grid2">
              <label className="field">
                <span className="field__label">{B.fields.name}</span>
                <input name="name" autoComplete="name" required className="input" {...a11y("name")} />
                {err("name")}
              </label>
              <label className="field">
                <span className="field__label">{B.fields.phone}</span>
                <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required className="input" {...a11y("phone")} />
                {err("phone")}
              </label>
              <label className="field">
                <span className="field__label">{B.fields.email}</span>
                <input name="email" type="email" autoComplete="email" required className="input" {...a11y("email")} />
                {err("email")}
              </label>
              <label className="field">
                <span className="field__label">{B.fields.zip}</span>
                <input name="zip" autoComplete="postal-code" inputMode="numeric" required maxLength={10} className="input" {...a11y("zip")} />
                {err("zip")}
              </label>
              <label className="field">
                <span className="field__label">{B.fields.service}</span>
                <select name="service" className="input" defaultValue={B.services[0]} {...a11y("service")}>
                  {B.services.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {err("service")}
              </label>
              <label className="field">
                <span className="field__label">{B.fields.window}</span>
                <select name="window" className="input" defaultValue={B.windows[0]} {...a11y("window")}>
                  {B.windows.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {err("window")}
              </label>
            </div>
            <label className="field">
              <span className="field__label">{B.fields.notes}</span>
              <textarea name="notes" rows={4} className="input" placeholder={B.fields.notesPlaceholder} {...a11y("notes")} />
              {err("notes")}
            </label>
            {/* honeypot */}
            <div className="hp" aria-hidden="true">
              <label>
                Company
                <input name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {status === "error" && (
              <p className="field__err field__err--form" role="alert">
                {serverError}
              </p>
            )}
            <div className="book__actions">
              <button type="submit" className="btn btn--primary btn--lg" disabled={status === "sending"}>
                {status === "sending" ? B.sending : B.submit} <span className="btn__arrow" aria-hidden="true">→</span>
              </button>
              <p className="footnote">{B.privacy}</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
