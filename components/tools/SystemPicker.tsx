"use client";
/** "Pick your next system": segmented tabs with a sliding pill, product image with parallax, counting stats. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { systems as S, type SystemKey } from "@/content/site";
import { countTo } from "@/lib/reveal";
import SectionHead from "../sections/SectionHead";

const money = (n: number) => "$" + (Math.round(n / 100) * 100).toLocaleString("en-US");
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function SystemPicker() {
  const [active, setActive] = useState<SystemKey>("furnace");
  const tabsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const statRefs2 = useRef<(HTMLSpanElement | null)[]>([]);
  const first = useRef(true);
  const item = S.items.find((i) => i.key === active)!;

  // FLIP-style sliding pill
  useIso(() => {
    const tabs = tabsRef.current, pill = pillRef.current;
    if (!tabs || !pill) return;
    const btn = tabs.querySelector<HTMLElement>(`[data-key="${active}"]`);
    if (!btn) return;
    const to = { x: btn.offsetLeft, width: btn.offsetWidth };
    if (first.current) gsap.set(pill, to);
    else gsap.to(pill, { ...to, duration: 0.55, ease: "expo.out" });
    const onResize = () => gsap.set(pill, { x: btn.offsetLeft, width: btn.offsetWidth });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  // count stats up on change (and on first view)
  useEffect(() => {
    const run = () =>
      item.stats.forEach((s, i) => {
        if (s.value == null) return;
        const fmt = s.money ? money : (n: number) => String(Math.round(n));
        countTo(statRefs.current[i], 0, s.value, { duration: 1.2, format: fmt });
        if (s.value2) countTo(statRefs2.current[i], 0, s.value2, { duration: 1.4, format: fmt });
      });
    if (first.current) {
      first.current = false;
      const el = mediaRef.current!;
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 });
      io.observe(el);
      return () => io.disconnect();
    }
    run();
    gsap.fromTo(mediaRef.current!.querySelectorAll(".picker__img.is-active"), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" });
  }, [active, item]);

  const onTabKey = (e: React.KeyboardEvent) => {
    const keys = S.items.map((i) => i.key);
    const idx = keys.indexOf(active);
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % keys.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + keys.length) % keys.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = keys.length - 1;
    else return;
    e.preventDefault();
    setActive(keys[next]);
    tabsRef.current?.querySelector<HTMLElement>(`[data-key="${keys[next]}"]`)?.focus();
  };

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(e.currentTarget.querySelectorAll(".picker__img"), { x: x * -18, y: y * -12, duration: 0.8, ease: "power3.out" });
    gsap.to(e.currentTarget.querySelector(".picker__glow"), { x: x * 30, y: y * 20, duration: 1, ease: "power3.out" });
  };

  return (
    <section id={S.id} className="section tool tool--picker" aria-labelledby="picker-h">
      <SectionHead eyebrow={S.eyebrow} heading={S.heading} id="picker-h" />
      <div ref={tabsRef} className="seg" role="tablist" aria-label="System type" onKeyDown={onTabKey}>
        <span ref={pillRef} className="seg__pill" aria-hidden="true" />
        {S.items.map((i) => (
          <button
            key={i.key}
            data-key={i.key}
            role="tab"
            id={`tab-${i.key}`}
            aria-selected={active === i.key}
            aria-controls="picker-panel"
            tabIndex={active === i.key ? 0 : -1}
            className={`seg__btn${active === i.key ? " is-active" : ""}`}
            onClick={() => setActive(i.key)}
          >
            {i.tab}
          </button>
        ))}
      </div>
      <div id="picker-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="picker card">
        <div ref={mediaRef} className="picker__media" onPointerMove={onMove}>
          <span className="picker__glow" aria-hidden="true" />
          {S.items.map((i) => (
            <picture key={i.key} className={`picker__img${i.key === active ? " is-active" : ""}`} aria-hidden={i.key !== active}>
              <source type="image/avif" srcSet={`${i.img}-900.avif 900w, ${i.img}-1400.avif 1400w`} sizes="(min-width: 1000px) 560px, 90vw" />
              <img src={`${i.img}-900.webp`} srcSet={`${i.img}-900.webp 900w, ${i.img}-1400.webp 1400w`} sizes="(min-width: 1000px) 560px, 90vw" alt={i.key === active ? i.alt : ""} loading="lazy" decoding="async" width={900} height={900} />
            </picture>
          ))}
        </div>
        <div className="picker__info">
          <p className="eyebrow">{item.bestFor}</p>
          <h3 className="picker__name">{item.name}</h3>
          <p className="body">{item.description}</p>
          <dl className="picker__stats">
            {item.stats.map((s, i) => (
              <div key={s.label} className="picker__stat">
                <dt>{s.label}</dt>
                <dd>
                  {s.text ? (
                    <span className="picker__stat-text">{s.text}</span>
                  ) : (
                    <>
                      {s.prefix && !s.money ? <small>{s.prefix}</small> : null}
                      <span ref={(el) => { statRefs.current[i] = el; }}>{s.money ? money(s.value!) : s.value}</span>
                      {s.value2 ? (
                        <>
                          –<span ref={(el) => { statRefs2.current[i] = el; }}>{s.money ? money(s.value2) : s.value2}</span>
                        </>
                      ) : null}
                      {s.suffix ? <small>{s.suffix}</small> : null}
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <a className="btn btn--primary" href="#book">
            {item.cta} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <p className="footnote">{S.footnote}</p>
        </div>
      </div>
    </section>
  );
}
