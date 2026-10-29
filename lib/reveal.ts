import { gsap } from "gsap";

/** Groups a SplitHeading's words into rendered lines and reveals them line by line. */
export function revealLines(root: Element | null, delay = 0) {
  if (!root) return;
  const words = Array.from(root.querySelectorAll<HTMLElement>(".w"));
  const lines: HTMLElement[][] = [];
  let lastTop = -Infinity;
  for (const w of words) {
    const top = w.offsetTop;
    if (Math.abs(top - lastTop) > 4) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(w.querySelector<HTMLElement>(".wi")!);
  }
  gsap.killTweensOf(root.querySelectorAll(".wi"));
  lines.forEach((line, i) => {
    gsap.fromTo(
      line,
      { yPercent: 110, y: 0 },
      { yPercent: 0, y: 0, duration: 0.9, ease: "expo.out", delay: delay + i * 0.07, overwrite: true }
    );
  });
}

export function hideLines(root: Element | null) {
  if (!root) return;
  gsap.set(root.querySelectorAll(".wi"), { yPercent: 110, y: 0 });
}

/** Tween a number into an element's textContent. */
export function countTo(el: HTMLElement | null, from: number, to: number, opts: { duration?: number; format?: (n: number) => string } = {}) {
  if (!el) return;
  const o = { v: from };
  const fmt = opts.format ?? ((n: number) => String(Math.round(n)));
  gsap.to(o, {
    v: to,
    duration: opts.duration ?? 1.4,
    ease: "power3.out",
    overwrite: true,
    onUpdate: () => {
      el.textContent = fmt(o.v);
    },
  });
}
