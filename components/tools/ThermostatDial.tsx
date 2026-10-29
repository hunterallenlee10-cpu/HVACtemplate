"use client";
/** "Dial it in": a draggable thermostat that crossfades the same room from cold to warm. */
import { useCallback, useEffect, useRef, useState } from "react";
import { thermostat as T } from "@/content/site";
import { tempColor } from "@/lib/temperature";
import Pic from "../Pic";
import SectionHead from "../sections/SectionHead";

const START = 135; // degrees, measured clockwise from 3 o'clock
const SWEEP = 270;
const R = 112;
const C = 140;

const polar = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};
const arc = (from: number, to: number) => {
  const [x1, y1] = polar(from);
  const [x2, y2] = polar(to);
  const large = to - from > 180 ? 1 : 0;
  return `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
};

export default function ThermostatDial() {
  const [v, setV] = useState(T.initial);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const t = (v - T.min) / (T.max - T.min);
  const color = tempColor(t);
  const clampV = (x: number) => Math.min(T.max, Math.max(T.min, Math.round(x)));

  const fromPointer = useCallback((e: React.PointerEvent | PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    let deg = (Math.atan2(y, x) * 180) / Math.PI;
    let rel = (deg - START + 720) % 360;
    if (rel > SWEEP) rel = rel > SWEEP + (360 - SWEEP) / 2 ? 0 : SWEEP;
    deg = rel;
    setV(clampV(T.min + (deg / SWEEP) * (T.max - T.min)));
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const step: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 3, PageDown: -3 };
    if (e.key in step) { e.preventDefault(); setV((x) => clampV(x + step[e.key])); }
    if (e.key === "Home") { e.preventDefault(); setV(T.min); }
    if (e.key === "End") { e.preventDefault(); setV(T.max); }
  };

  useEffect(() => {
    const up = () => (dragging.current = false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  const caption = T.captions.find((c) => v <= c.max)!.text;
  const midOpacity = Math.min(1, t * 2);
  const warmOpacity = Math.max(0, (t - 0.5) * 2);
  const knobDeg = START + SWEEP * t;
  const [kx, ky] = polar(knobDeg);

  return (
    <section id={T.id} className="section tool tool--thermo" aria-labelledby="thermo-h">
      <SectionHead eyebrow={T.eyebrow} heading={T.heading} sub={T.sub} id="thermo-h" />
      <div className="thermo card" style={{ ["--dial" as string]: color }}>
        <div className="thermo__media">
          <Pic base="/img/keys/K02-cold-room" alt={T.imgAlt.cold} sizes="(min-width: 1100px) 1100px, 100vw" className="thermo__img" />
          <Pic base="/img/keys/K06b-mid-room" alt={T.imgAlt.mid} sizes="(min-width: 1100px) 1100px, 100vw" className="thermo__img" style={{ opacity: midOpacity }} />
          <Pic base="/img/keys/K06-warm-room" alt={T.imgAlt.warm} sizes="(min-width: 1100px) 1100px, 100vw" className="thermo__img" style={{ opacity: warmOpacity }} />
          <div className="thermo__scrim" />
          <p className="thermo__caption" aria-live="polite">
            <span className="thermo__caption-temp">{v}°</span> {caption}
          </p>
        </div>
        <div className="thermo__dial">
          <svg
            ref={svgRef}
            viewBox="0 0 280 280"
            className="dial"
            role="slider"
            tabIndex={0}
            aria-label={T.ariaLabel}
            aria-valuemin={T.min}
            aria-valuemax={T.max}
            aria-valuenow={v}
            aria-valuetext={`${v} degrees`}
            onKeyDown={onKey}
            onPointerDown={(e) => {
              dragging.current = true;
              (e.currentTarget as Element).setPointerCapture(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => dragging.current && fromPointer(e)}
            onPointerUp={() => (dragging.current = false)}
          >
            <circle cx={C} cy={C} r={R + 22} className="dial__face" />
            {Array.from({ length: T.max - T.min + 1 }, (_, i) => {
              const d = START + (SWEEP * i) / (T.max - T.min);
              const [x1, y1] = polar(d, R + 14);
              const [x2, y2] = polar(d, R + (i % 2 ? 17 : 20));
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="dial__tick" />;
            })}
            <path d={arc(START, START + SWEEP)} className="dial__track" />
            {t > 0.001 && <path d={arc(START, knobDeg)} className="dial__active" stroke={color} />}
            <circle cx={kx} cy={ky} r="13" className="dial__knob" />
            <circle cx={kx} cy={ky} r="4.5" fill={color} />
            <text x={C} y={C - 34} className="dial__label" textAnchor="middle">{T.dialLabel}</text>
            <text x={C} y={C + 28} className="dial__num" textAnchor="middle">{v}°</text>
          </svg>
          <div className="dial__btns">
            <button type="button" className="icon-btn icon-btn--lg" onClick={() => setV((x) => clampV(x - 1))} aria-label={T.decrease}>−</button>
            <button type="button" className="icon-btn icon-btn--lg" onClick={() => setV((x) => clampV(x + 1))} aria-label={T.increase}>+</button>
          </div>
        </div>
      </div>
      <div className="tool__below">
        <p>{T.below}</p>
        <a className="btn btn--primary" href={T.cta.href}>
          {T.cta.label} <span className="btn__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
