"use client";
import { useState } from "react";
import { faq as F } from "@/content/site";
import SectionHead from "./SectionHead";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section faq" aria-labelledby="faq-h">
      <SectionHead eyebrow={F.eyebrow} heading={F.heading} id="faq-h" />
      <div className="faq__list">
        {F.items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className={`faq__item${isOpen ? " is-open" : ""}`}>
              <h3>
                <button
                  type="button"
                  className="faq__q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  id={`faq-q-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{it.q}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq__a">
                <div className="faq__a-inner">
                  <p>{it.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
