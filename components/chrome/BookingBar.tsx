"use client";
import { useEffect, useState } from "react";
import { bookingBar, config } from "@/content/site";
import { useStory } from "@/lib/useStory";

export default function BookingBar() {
  const pastHero = useStory((s) => s.pastHero || s.pastStory || s.staticMode);
  const ready = useStory((s) => s.ready);
  const [formInView, setFormInView] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const watch = (sel: string, set: (v: boolean) => void) => {
      const el = document.querySelector(sel);
      if (!el) return () => {};
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { threshold: 0.05 });
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch("#book", setFormInView);
    const b = watch("footer.footer", setFooterInView);
    return () => { a(); b(); };
  }, []);

  const visible = ready && pastHero && !formInView && !footerInView;
  return (
    <div className={`bbar${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <div className="bbar__inner glass">
        <div className="bbar__copy">
          <span className="bbar__line">{bookingBar.line}</span>
          <strong className="bbar__price">{bookingBar.price}</strong>
        </div>
        <a href="#book" className="btn btn--primary bbar__cta" tabIndex={visible ? 0 : -1}>
          {bookingBar.cta} <span className="btn__arrow" aria-hidden="true">→</span>
        </a>
        <div className="bbar__mobile">
          <a href={config.phoneHref} className="btn btn--ghost" tabIndex={visible ? 0 : -1}>
            {bookingBar.call}
          </a>
          <a href="#book" className="btn btn--primary" tabIndex={visible ? 0 : -1}>
            {bookingBar.book}
          </a>
        </div>
      </div>
    </div>
  );
}
