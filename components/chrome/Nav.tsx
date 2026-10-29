"use client";
import { useEffect, useRef, useState } from "react";
import { config, nav } from "@/content/site";
import { useStory } from "@/lib/useStory";
import Logo from "./Logo";

export default function Nav() {
  const pastStory = useStory((s) => s.pastStory || s.staticMode);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    document.documentElement.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  const glass = pastStory || open;
  return (
    <header className={`nav${glass ? " nav--glass" : ""}${scrolled ? " nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <Logo />
        <nav aria-label="Main" className="nav__links">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href} className="nav__link">
              {l.label}
            </a>
          ))}
          <a href={nav.cta.href} className="btn btn--outline nav__cta">
            {nav.cta.label}
          </a>
        </nav>
        <div className="nav__mobile">
          <a href={config.phoneHref} className="icon-btn" aria-label={`${nav.callLabel} ${config.phone}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
            </svg>
          </a>
          <button
            ref={btnRef}
            type="button"
            className="icon-btn nav__burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.closeLabel : nav.menuLabel}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
      <div id="mobile-menu" ref={menuRef} className={`menu${open ? " is-open" : ""}`} hidden={!open}>
        <nav aria-label="Mobile">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href} className="menu__link" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href={nav.cta.href} className="btn btn--primary menu__cta" onClick={() => setOpen(false)}>
            {nav.cta.label} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a href={config.phoneHref} className="menu__phone">
            {config.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
