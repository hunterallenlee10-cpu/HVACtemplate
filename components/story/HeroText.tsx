"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { hero } from "@/content/site";
import type { Chapter } from "@/content/chapters";
import { overlays } from "@/lib/storyStore";
import { revealLines } from "@/lib/reveal";
import { scramble } from "@/lib/scramble";
import SplitHeading from "./SplitHeading";
import Still from "./Still";

export default function HeroText({ still }: { still: Chapter }) {
  const ref = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const fades = el.querySelectorAll(".chapter__fade");
    let shown = false;
    const enter = () => {
      shown = true;
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", overwrite: true });
      revealLines(el.querySelector(".split"), 0.05);
      if (eyebrowRef.current) scramble(eyebrowRef.current, hero.eyebrow, 900);
      gsap.fromTo(fades, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 0.35, overwrite: true });
    };
    const leave = () => {
      if (!shown) return;
      shown = false;
      gsap.to(el, { autoAlpha: 0, y: -24, duration: 0.45, ease: "power2.in", overwrite: true });
    };
    overlays.set("ch0", { enter, leave });
    return () => {
      overlays.delete("ch0");
    };
  }, []);

  return (
    <header ref={ref} className="chapter chapter--hero" data-chapter="ch0">
      <Still base={still.still} alt={still.stillAlt} />
      <div className="chapter__text">
        <p ref={eyebrowRef} className="eyebrow">{hero.eyebrow}</p>
        <SplitHeading as="h1" text={hero.heading} accent={hero.accent} className="display display--hero" />
        <p className="lede chapter__fade">{hero.sub}</p>
        <div className="hero__ctas chapter__fade">
          <a className="btn btn--primary" href={hero.primary.href}>
            {hero.primary.label} <span className="btn__arrow" aria-hidden="true">↓</span>
          </a>
          <a className="btn btn--link" href={hero.secondary.href}>
            {hero.secondary.label} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <div className="hero__cue chapter__fade" aria-hidden="true">
        <span>{hero.scrollCue}</span>
        <i />
      </div>
    </header>
  );
}
