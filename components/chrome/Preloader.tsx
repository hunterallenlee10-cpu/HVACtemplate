"use client";
/**
 * Dark screen with the mark and a temperature counting 32° → 70° as chapter 1's frames load.
 * Capped at 2.5s: after that it wipes away and loading continues in the background
 * (the hero poster is already on screen underneath).
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { preloader } from "@/content/site";
import { storyStore } from "@/lib/storyStore";
import { getLenis, prefersReducedMotion } from "@/lib/useLenis";
import LogoMark from "./LogoMark";

const CAP = 2500;
const MIN = 700;

export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const t0 = performance.now();
    const shown = { v: preloader.from };
    let done = false;
    getLenis()?.stop();

    const finish = () => {
      if (done) return;
      done = true;
      const exit = () => {
        storyStore.set({ ready: true });
        getLenis()?.start();
        setGone(true);
      };
      if (prefersReducedMotion()) {
        exit();
        return;
      }
      gsap.to(shown, {
        v: preloader.to, duration: 0.35, ease: "power2.out",
        onUpdate: () => { if (numRef.current) numRef.current.textContent = String(Math.round(shown.v)); },
      });
      gsap.to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut", delay: 0.35, onComplete: exit });
      gsap.delayedCall(0.55, () => storyStore.set({ ready: true }));
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }
    let raf = 0;
    const tick = () => {
      const s = storyStore.get();
      const elapsed = performance.now() - t0;
      const target = preloader.from + (preloader.to - preloader.from) * Math.min(1, s.loaded / 0.4);
      shown.v += (target - shown.v) * 0.12;
      if (numRef.current) numRef.current.textContent = String(Math.round(shown.v));
      if ((s.loaded >= 0.4 && elapsed > MIN) || elapsed > CAP) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;
  return (
    <div ref={ref} className="preloader" role="progressbar" aria-label="Loading" aria-valuemin={0} aria-valuemax={100}>
      <div className="preloader__inner">
        <LogoMark size={56} />
        <p className="preloader__temp">
          <span ref={numRef}>{preloader.from}</span>°
        </p>
        <p className="preloader__label">{preloader.label}</p>
      </div>
    </div>
  );
}
