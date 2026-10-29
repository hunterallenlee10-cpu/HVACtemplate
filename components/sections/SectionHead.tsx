"use client";
import { useEffect, useRef } from "react";
import { revealLines, hideLines } from "@/lib/reveal";
import { scramble } from "@/lib/scramble";
import SplitHeading from "../story/SplitHeading";
import { prefersReducedMotion } from "@/lib/useLenis";

type Props = { eyebrow: string; heading: string; accent?: string; sub?: string; id: string; align?: "left" | "center" };

/** Section eyebrow + headline + sub, revealed (scramble + line mask) when scrolled into view. */
export default function SectionHead({ eyebrow, heading, accent, sub, id, align = "left" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const eb = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (prefersReducedMotion()) return;
    hideLines(el);
    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.classList.add("is-in");
        revealLines(el.querySelector(".split"));
        if (eb.current) scramble(eb.current, eyebrow, 700);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eyebrow]);
  return (
    <div ref={ref} className={`shead shead--${align}`}>
      <p ref={eb} className="eyebrow">{eyebrow}</p>
      <SplitHeading text={heading} accent={accent} id={id} className="display display--section" />
      {sub && <p className="shead__sub">{sub}</p>}
    </div>
  );
}
