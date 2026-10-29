"use client";
/** "How old is your filter?": before/after drag slider (clip-path) + guidance stats. */
import { useRef, useState } from "react";
import { filter as F } from "@/content/site";
import Pic from "../Pic";
import SectionHead from "../sections/SectionHead";

export default function FilterCompare() {
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromX = (clientX: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step: Record<string, number> = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 };
    if (e.key in step) { e.preventDefault(); setPos((p) => Math.min(100, Math.max(0, p + step[e.key]))); }
    if (e.key === "Home") { e.preventDefault(); setPos(0); }
    if (e.key === "End") { e.preventDefault(); setPos(100); }
  };

  return (
    <section id={F.id} className="section tool tool--filter" aria-labelledby="filter-h">
      <div className="filter">
        <div className="filter__copy">
          <SectionHead eyebrow={F.eyebrow} heading={F.heading} id="filter-h" />
          <p className="body">{F.body}</p>
          <dl className="filter__stats">
            {F.stats.map((s) => (
              <div key={s.label} className="filter__stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="footnote">{F.footnote}</p>
          <a className="btn btn--primary" href={F.cta.href}>
            {F.cta.label} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div
          ref={boxRef}
          className="compare card"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
            setFromX(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <Pic base="/img/keys/K09-filter-dirty" alt={F.altBefore} sizes="(min-width: 1000px) 640px, 100vw" className="compare__img" />
          <Pic
            base="/img/keys/K10-filter-clean"
            alt={F.altAfter}
            sizes="(min-width: 1000px) 640px, 100vw"
            className="compare__img compare__img--top"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          />
          <span className="compare__tag compare__tag--l" style={{ opacity: pos > 18 ? 1 : 0 }}>{F.tagBefore}</span>
          <span className="compare__tag compare__tag--r" style={{ opacity: pos < 88 ? 1 : 0 }}>{F.tagAfter}</span>
          <div
            className="compare__handle"
            style={{ left: `${pos}%` }}
            role="slider"
            tabIndex={0}
            aria-label={F.sliderLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% dirty filter shown`}
            onKeyDown={onKey}
          >
            <span className="compare__grip" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
