import { plans as P } from "@/content/site";
import SectionHead from "./SectionHead";

export default function Plans() {
  return (
    <section id={P.id} className="section plans" aria-labelledby="plans-h">
      <SectionHead eyebrow={P.eyebrow} heading={P.heading} sub={P.sub} id="plans-h" />
      <ul className="plans__grid">
        {P.tiers.map((t) => (
          <li key={t.name} className={`plan card${t.featured ? " plan--featured" : ""}`}>
            <div className="plan__head">
              <h3 className="plan__name">{t.name}</h3>
              {t.featured && <span className="plan__badge">MOST POPULAR</span>}
            </div>
            <p className="plan__price">
              <span className="plan__amt">${t.price}</span>
              <span className="plan__per">{t.period}</span>
            </p>
            <p className="plan__blurb">{t.blurb}</p>
            <ul className="plan__perks">
              {t.perks.map((p) => (
                <li key={p}>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 8.4l2.8 2.8 6.2-6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {p}
                </li>
              ))}
            </ul>
            <a className={`btn ${t.featured ? "btn--primary" : "btn--outline"} plan__cta`} href="#book">
              {t.cta}
            </a>
          </li>
        ))}
      </ul>
      <p className="footnote plans__note">{P.note}</p>
    </section>
  );
}
