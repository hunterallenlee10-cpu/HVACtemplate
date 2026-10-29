"use client";
/** Subtle drifting frost specks over the cold opening chapters. Pauses when not needed. */
import { useEffect, useRef } from "react";
import { storyStore } from "@/lib/storyStore";

export default function FrostParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, running = false;
    const N = window.innerWidth < 768 ? 28 : 60;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.00012, vy: 0.00008 + Math.random() * 0.00018, a: 0.15 + Math.random() * 0.45,
    }));
    const size = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02; else if (p.x > 1.02) p.x = -0.02;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#DDF0FF";
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    const update = () => {
      const s = storyStore.get();
      const want = s.chapterIndex <= 1 && s.inStory && !s.staticMode && !document.hidden;
      cv.style.opacity = s.chapterIndex <= 1 ? "1" : "0";
      if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
      if (!want && running) { running = false; cancelAnimationFrame(raf); }
    };
    update();
    const unsub = storyStore.subscribe(update);
    document.addEventListener("visibilitychange", update);
    return () => {
      unsub();
      ro.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return <canvas ref={ref} className="story__frost" aria-hidden="true" />;
}
