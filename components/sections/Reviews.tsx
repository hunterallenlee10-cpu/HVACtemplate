import { config, reviews as R } from "@/content/site";
import SectionHead from "./SectionHead";

/** Review slots stay clearly labeled placeholders until real Google reviews are pasted in. */
export default function Reviews() {
  return (
    <section id="reviews" className="section reviews" aria-labelledby="reviews-h">
      <SectionHead eyebrow={R.eyebrow} heading={R.heading} id="reviews-h" />
      <ul className="reviews__grid">
        {Array.from({ length: R.count }, (_, i) => (
          <li key={i} className="review card review--placeholder">
            <p className="review__quote">{R.placeholder}</p>
            <p className="review__meta">{R.placeholderMeta}</p>
          </li>
        ))}
      </ul>
      <a className="btn btn--link" href={config.googleReviewsUrl} target="_blank" rel="noopener noreferrer">
        {R.link} <span className="btn__arrow" aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
