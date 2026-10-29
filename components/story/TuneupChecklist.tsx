"use client";
/** Glass "tune-up checklist" panel for chapter 7: items tick off and a counter runs to 21 as you scroll. */
import { useEffect, useRef } from "react";
import { xray } from "@/content/site";
import { CHECKLIST } from "@/content/chapters";
import { onChapterProgress, storyStore } from "@/lib/storyStore";
import { smoothstep } from "@/lib/temperature";

const SHOWN = 8;

export default function TuneupChecklist() {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const el = ref.current!;
    let last = -1;
    const off = onChapterProgress("ch7", (t) => {
      const [a, b] = CHECKLIST.show;
      const visible = smoothstep(a, a + 0.05, t) * (1 - smoothstep(b - 0.05, b, t));
      el.style.opacity = String(visible);
      el.style.visibility = visible > 0.01 ? "visible" : "hidden";
      const n = Math.round(xray.total * smoothstep(CHECKLIST.tick[0], CHECKLIST.tick[1], t));
      if (n === last) return;
      last = n;
      if (countRef.current) countRef.current.textContent = String(n);
      itemRefs.current.forEach((li, i) => {
        li?.classList.toggle("is-done", n >= Math.round(((i + 1) * xray.total) / SHOWN));
      });
    });
    const unsub = storyStore.subscribe(() => {
      if (storyStore.get().chapter !== "ch7") {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      }
    });
    return () => {
      off();
      unsub();
    };
  }, []);

  return (
    <aside ref={ref} className="checklist glass" aria-label={xray.checklistTitle}>
      <div className="checklist__head">
        <span className="checklist__title">{xray.checklistTitle}</span>
        <span className="checklist__count">
          <span ref={countRef}>0</span>/{xray.total}
        </span>
      </div>
      <ol className="checklist__list">
        {xray.checklist.slice(0, SHOWN).map((item, i) => (
          <li key={item} ref={(el) => { itemRefs.current[i] = el; }}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="1" y="1" width="14" height="14" rx="4" />
              <path d="M4.5 8.2l2.3 2.3 4.7-4.9" />
            </svg>
            {item}
          </li>
        ))}
      </ol>
    </aside>
  );
}
