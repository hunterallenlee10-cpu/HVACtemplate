/** Mono-style text scramble: characters resolve left to right. Returns a cancel fn. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

export function scramble(el: HTMLElement, text: string, duration = 700): () => void {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = text;
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const settled = Math.floor(t * text.length);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (i < settled || c === " " || c === "·") out += c;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) raf = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
