"use client";
/** "Is it worth fixing?": the age × repair-quote rule of thumb, with symptoms and an R-22 note. */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { repairCalc as R } from "@/content/site";
import SectionHead from "../sections/SectionHead";

type Sys = (typeof R.systemOptions)[number];
const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function verdictFor(age: number, quote: number, symptoms: number) {
  const score = age * quote;
  if (score > R.threshold || symptoms >= 3) return { key: "replace" as const, score };
  if ((score >= R.closeLow && score <= R.threshold) || symptoms === 2) return { key: "close" as const, score };
  return { key: "repair" as const, score };
}

export default function RepairReplaceCalc() {
  const [system, setSystem] = useState<Sys>("Furnace");
  const [age, setAge] = useState(R.ageInitial);
  const [quote, setQuote] = useState(R.quoteInitial);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const markerRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  const { key, score } = verdictFor(age, quote, symptoms.length);
  const v = R.verdicts[key];
  // meter: the $5,000 line sits in the middle; symptoms push it toward replace
  const fromScore = Math.min(1, score / (R.threshold * 2));
  const fromSymptoms = symptoms.length >= 3 ? 0.78 : symptoms.length === 2 ? 0.5 : 0;
  const pos = Math.max(fromScore, fromSymptoms);
  const over = score > R.threshold;
  const r22 = system !== "Furnace" && age >= 15;

  useEffect(() => {
    if (markerRef.current) gsap.to(markerRef.current, { left: `${pos * 100}%`, duration: 0.6, ease: "expo.out" });
  }, [pos]);
  useEffect(() => {
    if (wordRef.current) gsap.fromTo(wordRef.current, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
  }, [key]);

  const toggle = (s: string) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <section id={R.id} className="section tool tool--calc" aria-labelledby="calc-h">
      <SectionHead eyebrow={R.eyebrow} heading={R.heading} sub={R.sub} id="calc-h" />
      <div className="calc">
        <form className="calc__inputs card" onSubmit={(e) => e.preventDefault()} aria-label="Your system">
          <fieldset className="field">
            <legend className="field__label">{R.systemLabel}</legend>
            <div className="chips" role="radiogroup">
              {R.systemOptions.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={system === s} className={`chipbtn${system === s ? " is-on" : ""}`} onClick={() => setSystem(s)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label className="field__label" htmlFor="calc-age">
              {R.ageLabel} <output htmlFor="calc-age">{age} yrs</output>
            </label>
            <input id="calc-age" type="range" min={R.ageMin} max={R.ageMax} step={1} value={age} onChange={(e) => setAge(+e.target.value)} className="range" style={{ ["--fill" as string]: `${((age - R.ageMin) / (R.ageMax - R.ageMin)) * 100}%` }} aria-valuetext={`${age} years`} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="calc-quote">
              {R.quoteLabel} <output htmlFor="calc-quote">{usd(quote)}</output>
            </label>
            <input id="calc-quote" type="range" min={R.quoteMin} max={R.quoteMax} step={R.quoteStep} value={quote} onChange={(e) => setQuote(+e.target.value)} className="range" style={{ ["--fill" as string]: `${((quote - R.quoteMin) / (R.quoteMax - R.quoteMin)) * 100}%` }} aria-valuetext={usd(quote)} />
          </div>
          <fieldset className="field">
            <legend className="field__label">{R.symptomsLabel}</legend>
            <div className="chips">
              {R.symptoms.map((s) => (
                <button key={s} type="button" aria-pressed={symptoms.includes(s)} className={`chipbtn${symptoms.includes(s) ? " is-on" : ""}`} onClick={() => toggle(s)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        <div className={`calc__result card calc__result--${key}`} aria-live="polite">
          <p className="calc__lead">{v.lead}</p>
          <p className="calc__verdict">
            <span ref={wordRef} className="calc__word">{v.word}</span>
          </p>
          <p className="body">{v.text}</p>
          <div className="meter" aria-hidden="true">
            <div className="meter__bar" />
            <span className="meter__line" />
            <span ref={markerRef} className="meter__marker" />
            <div className="meter__labels">
              <span>{R.meterCold}</span>
              <span>{usd(R.threshold)}</span>
              <span>{R.meterHot}</span>
            </div>
          </div>
          <p className="calc__formula">
            {age} yrs × {usd(quote)} = <strong>{usd(score)}</strong> — {over ? R.overLine : R.underLine} {usd(R.threshold)} {R.lineSuffix}
            {symptoms.length > 0 && (
              <>
                {" "}
                <span className="calc__sym">+ {symptoms.length} {R.symptomsNote}</span>
              </>
            )}
          </p>
          {r22 && <p className="calc__note">{R.r22Note}</p>}
          <a className="btn btn--primary" href={R.cta.href}>
            {R.cta.label} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <p className="footnote">{R.fine}</p>
        </div>
      </div>
    </section>
  );
}
