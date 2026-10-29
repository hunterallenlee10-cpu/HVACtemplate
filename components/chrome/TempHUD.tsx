"use client";
/** Fixed temperature readout that follows the story: big number, color bar, mono location. */
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { chapters } from "@/content/chapters";
import { useStory } from "@/lib/useStory";
import { scramble } from "@/lib/scramble";
import { tempColor, tempToT, mix, FROST, EMBER } from "@/lib/temperature";

export default function TempHUD() {
  const index = useStory((s) => s.chapterIndex);
  const visible = useStory((s) => s.ready && s.inStory && !s.pastStory && !s.staticMode && s.chapterIndex > 0);
  const numRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const val = useRef({ v: 61 });

  const hud = chapters[index]?.hud;

  useEffect(() => {
    if (!hud) return;
    if (labelRef.current) scramble(labelRef.current, hud.label, 600);
    const color = hud.temp != null ? tempColor(tempToT(hud.temp, 58, 72)) : mix(FROST, EMBER, 0.85);
    if (barRef.current) gsap.to(barRef.current, { "--hud-color": color, duration: 0.8, ease: "power2.out" });
    if (hud.temp != null) {
      gsap.to(val.current, {
        v: hud.temp,
        duration: 1.1,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = String(Math.round(val.current.v));
        },
      });
    }
  }, [hud]);

  const hasTemp = hud?.temp != null;
  return (
    <div className={`hud glass${visible ? " is-visible" : ""}`} aria-hidden={!visible} role="status">
      <span ref={barRef} className="hud__bar" />
      <span className="hud__read">
        <span className="hud__num">
          {hasTemp ? (
            <>
              <span ref={numRef}>{Math.round(val.current.v)}</span>
              <span className="hud__deg">°</span>
            </>
          ) : (
            <svg className="hud__fan" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
              <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
              <g fill="currentColor">
                <path d="M12 12c0-3 1-6 3.5-6.5 1.6-.3 2.4 1.5 1.2 2.6C15.4 9.3 13.6 11 12 12z" />
                <path d="M12 12c2.6 1.5 4.6 4 3.7 6.4-.6 1.5-2.5 1.3-2.9-.3-.4-1.6-.8-4.1-.8-6.1z" />
                <path d="M12 12c-2.6 1.5-5.7 2-7.3 0-1-1.3.1-2.8 1.7-2.4 1.6.5 3.9 1.4 5.6 2.4z" />
              </g>
              <circle cx="12" cy="12" r="1.4" fill="currentColor" />
            </svg>
          )}
        </span>
        <span ref={labelRef} className="hud__label">
          {hud?.label ?? ""}
        </span>
      </span>
    </div>
  );
}
