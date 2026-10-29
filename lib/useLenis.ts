"use client";
/**
 * Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger and Lenis share one clock.
 * Skipped entirely when the visitor prefers reduced motion.
 */
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll to an element, a selector or a Y position, using Lenis when it's running. */
export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target as never, { offset, duration: 1.4 });
    return;
  }
  let y: number;
  if (typeof target === "number") y = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    y = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: y + offset, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function useLenis() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion()) return;
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis = l;
    l.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Route in-page anchor links through Lenis.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector<HTMLElement>(id);
      if (!el) return;
      e.preventDefault();
      l.scrollTo(el, { offset: 0, duration: 1.4 });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      l.destroy();
      lenis = null;
    };
  }, []);
}
