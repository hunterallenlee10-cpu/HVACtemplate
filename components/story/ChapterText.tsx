"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Chapter } from "@/content/chapters";
import type { StoryCopy } from "@/content/site";
import { overlays } from "@/lib/storyStore";
import { countTo, revealLines } from "@/lib/reveal";
import { scramble } from "@/lib/scramble";
import SplitHeading from "./SplitHeading";
import Still from "./Still";

/** One chapter's overlay copy: real DOM text, lower-left, animated in/out by the engine. */
export default function ChapterText({ chapter, copy }: { chapter: Chapter; copy: StoryCopy }) {
  const ref = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const statRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const fades = el.querySelectorAll(".chapter__fade");
    let cancelScramble = () => {};
    const enter = () => {
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", overwrite: true });
      revealLines(el.querySelector(".split"), 0.05);
      if (eyebrowRef.current) cancelScramble = scramble(eyebrowRef.current, copy.eyebrow ?? copy.chip ?? "", 650);
      gsap.fromTo(fades, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, delay: 0.3, overwrite: true });
      if (copy.stat) countTo(statRef.current, copy.stat.from, copy.stat.to, { duration: 1.6 });
    };
    const leave = () => {
      cancelScramble();
      gsap.to(el, { autoAlpha: 0, y: -20, duration: 0.4, ease: "power2.in", overwrite: true });
    };
    overlays.set(chapter.id, { enter, leave });
    return () => {
      overlays.delete(chapter.id);
    };
  }, [chapter.id, copy]);

  const label = copy.eyebrow ?? copy.chip;
  return (
    <article ref={ref} className={`chapter chapter--${chapter.id}`} data-chapter={chapter.id} aria-labelledby={`h-${chapter.id}`}>
      <Still base={chapter.still} alt={chapter.stillAlt} />
      <div className="chapter__text">
        {label && (
          <p ref={eyebrowRef} className={copy.chip ? "chip" : "eyebrow"}>
            {label}
          </p>
        )}
        <SplitHeading id={`h-${chapter.id}`} text={copy.heading} accent={copy.accent} className="display display--chapter" />
        {copy.stat && (
          <p className="stat chapter__fade">
            <span className="stat__num">
              <span ref={statRef}>{copy.stat.to}</span>
              {copy.stat.suffix}
            </span>
            <span className="stat__label">{copy.stat.label}</span>
          </p>
        )}
        {copy.body && <p className="body chapter__fade">{copy.body}</p>}
        {copy.cta && (
          <a className="btn btn--primary chapter__fade" href={copy.cta.href}>
            {copy.cta.label} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        )}
        {copy.footnote && <p className="footnote chapter__fade">{copy.footnote}</p>}
      </div>
    </article>
  );
}
