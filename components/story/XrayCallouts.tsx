"use client";
/**
 * Chapter 7 callouts: five DOM tags with SVG leader lines that draw in (stroke-dashoffset)
 * as the exploded view scrubs. Anchors are % of the 16:9 frame (content/chapters.ts) and
 * are mapped through the canvas's cover-fit rect so they track the image on any screen.
 */
import { useEffect, useRef } from "react";
import { xray } from "@/content/site";
import { xrayAnchors } from "@/content/chapters";
import { onChapterProgress, stageRect, storyStore } from "@/lib/storyStore";
import { smoothstep } from "@/lib/temperature";

export default function XrayCallouts() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current!;
    let lastT = -1, lastV = -1;
    const off = onChapterProgress("ch7", (t) => {
      if (t === lastT && stageRect.version === lastV) return;
      lastT = t;
      lastV = stageRect.version;
      const narrow = root.clientWidth < 768;
      const W = root.clientWidth;
      const out = smoothstep(0.9, 0.97, t);
      xray.callouts.forEach((c, i) => {
        const a = xrayAnchors[c.id];
        const tag = tagRefs.current[i], line = lineRefs.current[i], dot = dotRefs.current[i];
        if (!tag || !line || !dot) return;
        const fx = (a.x / 100 - stageRect.cropX0) / stageRect.cropW;
        const x = stageRect.dx + fx * stageRect.dw;
        const y = stageRect.dy + (a.y / 100) * stageRect.dh;
        const reach = narrow ? Math.min(70, W * 0.16) : Math.min(170, W * 0.12);
        const dir = a.side === "right" ? 1 : -1;
        let tx = x + dir * reach;
        const ty = y - (narrow ? 0 : 26);
        const tagW = tag.offsetWidth;
        // keep tags on screen
        if (dir === 1) tx = Math.min(tx, W - tagW - 12);
        else tx = Math.max(tx, tagW + 12);
        const appear = smoothstep(a.at, a.at + 0.07, t) * (1 - out);
        const draw = smoothstep(a.at - 0.03, a.at + 0.05, t);
        tag.style.opacity = String(appear);
        tag.style.transform = `translate(${dir === 1 ? tx : tx - tagW}px, ${ty - tag.offsetHeight / 2}px)`;
        line.setAttribute("x1", String(x));
        line.setAttribute("y1", String(y));
        line.setAttribute("x2", String(tx));
        line.setAttribute("y2", String(ty));
        const len = Math.hypot(tx - x, ty - y);
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = String(len * (1 - draw));
        line.style.opacity = String(1 - out);
        dot.setAttribute("cx", String(x));
        dot.setAttribute("cy", String(y));
        dot.style.opacity = String(draw * (1 - out));
      });
    });
    const unsub = storyStore.subscribe(() => {
      root.dataset.active = String(storyStore.get().chapter === "ch7");
    });
    return () => {
      off();
      unsub();
    };
  }, []);

  return (
    <div ref={rootRef} className="xray" data-active="false">
      <svg className="xray__lines" width="100%" height="100%">
        {xray.callouts.map((c, i) => (
          <g key={c.id}>
            <line ref={(el) => { lineRefs.current[i] = el; }} />
            <circle ref={(el) => { dotRefs.current[i] = el; }} r="4" />
          </g>
        ))}
      </svg>
      {xray.callouts.map((c, i) => (
        <div key={c.id} ref={(el) => { tagRefs.current[i] = el; }} className="xray__tag" style={{ opacity: 0 }}>
          <span className="xray__label">{c.label}</span>
          <span className="xray__text">{c.text}</span>
        </div>
      ))}
    </div>
  );
}
