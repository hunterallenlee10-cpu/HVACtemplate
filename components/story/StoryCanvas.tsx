"use client";
/**
 * The pinned, scroll-scrubbed story.
 *
 * Layout: a tall <section> whose first child is a 100svh sticky stage (CSS sticky, which
 * plays nicely with Lenis). A GSAP ScrollTrigger with scrub: 0.6 eases a progress value
 * over the section; a GSAP ticker callback maps that progress to (chapter, frame), draws
 * the frame to the canvas only when it changes, and drives the overlays.
 *
 * Reduced motion / no JS: CSS switches the section to a stacked layout of keyframe stills
 * plus the same text (see .story.is-static in globals.css), and this engine never starts.
 */
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  chapters,
  frameCounts,
  frameUrl,
  MOBILE_BREAKPOINT,
  STORY_MOBILE_SCALE,
  totalScrollVh,
  TEXT_IN,
  TEXT_OUT,
} from "@/content/chapters";
import { story } from "@/content/site";
import { SequenceLoader } from "@/lib/sequenceLoader";
import { chapterOffsets, overlays, progressHandlers, stageRect, storyStore } from "@/lib/storyStore";
import { clamp01, lerp } from "@/lib/temperature";
import { prefersReducedMotion } from "@/lib/useLenis";
import blur from "@/content/blur.json";
import ChapterText from "./ChapterText";
import HeroText from "./HeroText";
import XrayCallouts from "./XrayCallouts";
import TuneupChecklist from "./TuneupChecklist";
import FrostParticles from "./FrostParticles";

const seqChapters = chapters.filter((c) => c.seq);

export default function StoryCanvas() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const poster = posterRef.current!;
    const stage = stageRef.current!;

    if (prefersReducedMotion()) {
      section.classList.add("is-static");
      storyStore.set({ staticMode: true, loaded: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx2d = canvas.getContext("2d", { alpha: false })!;
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    const set = mobile ? "mobile" : "desktop";
    const counts = seqChapters.map((c) => frameCounts[set][c.seq!] ?? 1);
    let dirty = true;

    const loader = new SequenceLoader(
      seqChapters.map((c, i) => ({ seq: c.seq!, count: counts[i] })),
      (seq, i) => frameUrl(set, seq, i),
      {
        concurrency: 6,
        window: mobile ? 8 : 12,
        onFrame: (c, f) => {
          if (c === cur.seqIndex && Math.abs(f - cur.frame) < 30) dirty = true;
        },
      }
    );
    loader.prioritize(0);
    loader.seek(0, 0);

    // ---------- layout ----------
    const scale = mobile ? STORY_MOBILE_SCALE : 1;
    const lens = chapters.map((c) => c.scrollVh);
    const starts: number[] = [];
    lens.reduce((acc, l, i) => ((starts[i] = acc), acc + l), 0);
    section.style.setProperty("--story-scale", String(scale));

    // exposed for scripts/qa-screens.mjs
    (window as unknown as { __storyOffsets: typeof chapterOffsets }).__storyOffsets = chapterOffsets;
    const updateOffsets = () => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight / 100;
      chapterOffsets.current = starts.map((s) => top + s * scale * vh);
    };

    // ---------- canvas sizing ----------
    let cw = 0, ch = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = stage.clientWidth;
      ch = stage.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      dirty = true;
      updateOffsets();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // ---------- draw ----------
    const mobileAspect = frameCounts.mobileAspect || 0.75;
    let lastImg: CanvasImageSource | null = null;
    const draw = (img: ImageBitmap | HTMLImageElement, focal: number, zoom: number) => {
      const iw = img.width, ih = img.height;
      const W = canvas.width, H = canvas.height;
      const s = Math.max(W / iw, H / ih) * zoom;
      const dw = iw * s, dh = ih * s;
      // keep the chapter's focal point in view on narrow screens
      const fx = mobile ? 0.5 : focal;
      const dx = Math.min(0, Math.max(W - dw, W / 2 - fx * dw));
      const dy = (H - dh) / 2;
      ctx2d.drawImage(img, dx, dy, dw, dh);
      lastImg = img;
      // expose the drawn rect (CSS px) for the x-ray callouts
      stageRect.dx = dx / dpr;
      stageRect.dy = dy / dpr;
      stageRect.dw = dw / dpr;
      stageRect.dh = dh / dpr;
      if (mobile) {
        const cropW = (mobileAspect * 9) / 16;
        stageRect.cropW = cropW;
        stageRect.cropX0 = Math.min(1 - cropW, Math.max(0, focal - cropW / 2));
      } else {
        stageRect.cropW = 1;
        stageRect.cropX0 = 0;
      }
      stageRect.version++;
    };

    // ---------- progress ----------
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    const flagsST = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const vhPx = window.innerHeight / 100;
        const scrolled = self.progress * totalScrollVh * scale * vhPx;
        storyStore.set({ pastHero: scrolled > lens[0] * scale * vhPx * 0.55 });
      },
      onToggle: (self) => storyStore.set({ inStory: self.isActive }),
      onLeave: () => storyStore.set({ pastStory: true }),
      onEnterBack: () => storyStore.set({ pastStory: false }),
      onRefresh: updateOffsets,
    });

    const cur = { chapter: -1, seqIndex: 0, frame: 0, textOn: -1, warmth: -1, poster: -1, stageAlpha: -1 };
    const root = document.documentElement;

    const render = () => {
      const p = clamp01(proxy.p);
      const pos = p * totalScrollVh;
      let ci = chapters.length - 1;
      for (let i = 0; i < chapters.length; i++) {
        if (pos < starts[i] + lens[i]) { ci = i; break; }
      }
      const c = chapters[ci];
      const t = clamp01((pos - starts[ci]) / lens[ci]);

      // chapter change
      if (ci !== cur.chapter) {
        const prev = cur.chapter;
        cur.chapter = ci;
        storyStore.set({ chapter: c.id, chapterIndex: ci });
        if (c.seq) loader.prioritize(seqChapters.indexOf(c));
        if (prev >= 0 && cur.textOn === prev) {
          overlays.get(chapters[prev].id)?.leave?.();
          cur.textOn = -1;
        }
        section.dataset.chapter = c.id;
      }

      // overlay text window
      const [textIn, textOut] = c.textWindow ?? (ci === 0 ? [0, 0.62] : [TEXT_IN, TEXT_OUT]);
      const shouldShow = t >= textIn && t <= textOut && storyStore.get().ready;
      if (shouldShow && cur.textOn !== ci) {
        cur.textOn = ci;
        overlays.get(c.id)?.enter?.();
      } else if (!shouldShow && cur.textOn === ci) {
        cur.textOn = -1;
        overlays.get(c.id)?.leave?.();
      }
      progressHandlers.get(c.id)?.forEach((fn) => fn(t));

      // warmth
      const w = lerp(c.warmth[0], c.warmth[1], t);
      if (Math.abs(w - cur.warmth) > 0.003) {
        cur.warmth = w;
        root.style.setProperty("--warmth", w.toFixed(3));
      }

      // hero poster crossfades into ch1's first frame
      const posterAlpha = ci === 0 ? 1 : ci === 1 ? 1 - clamp01(t / 0.06) : 0;
      if (posterAlpha !== cur.poster) {
        cur.poster = posterAlpha;
        poster.style.opacity = String(posterAlpha);
        poster.style.visibility = posterAlpha === 0 ? "hidden" : "visible";
      }

      // fade the stage out at the very end of the story
      const stageAlpha = ci === chapters.length - 1 ? 1 - clamp01((t - 0.93) / 0.07) : 1;
      if (stageAlpha !== cur.stageAlpha) {
        cur.stageAlpha = stageAlpha;
        stage.style.opacity = String(stageAlpha);
      }

      // frame
      const seqIndex = c.seq ? seqChapters.indexOf(c) : 0;
      const localT = c.seq ? clamp01(t / (c.playUntil ?? 1)) : 0;
      const n = counts[seqIndex];
      const frame = Math.min(n - 1, Math.round(localT * (n - 1)));
      const focalPair = frameCounts.focal[seqChapters[seqIndex].seq!] ?? [0.5, 0.5];
      const focal = lerp(focalPair[0], focalPair[1], localT);
      if (frame !== cur.frame || seqIndex !== cur.seqIndex || dirty) {
        cur.frame = frame;
        cur.seqIndex = seqIndex;
        loader.seek(seqIndex, frame);
        const img = loader.nearest(seqIndex, frame);
        // ch1 starts slightly zoomed so it matches the hero poster's Ken Burns end state
        const zoom = ci === 1 ? lerp(1.05, 1, clamp01(t / 0.12)) : ci === 0 ? 1.05 : 1;
        if (img) {
          draw(img, focal, zoom);
          dirty = !loader.has(seqIndex, frame);
        } else if (!lastImg) {
          ctx2d.fillStyle = "#0A0D12";
          ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // preloader progress (first chapter's frames)
      const s = storyStore.get();
      if (!s.ready) storyStore.set({ loaded: Math.round(loader.progress(0) * 50) / 50 });
    };

    gsap.ticker.add(render);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(render);
      tween.scrollTrigger?.kill();
      tween.kill();
      flagsST.kill();
      ro.disconnect();
      loader.destroy();
    };
  }, []);

  const storyChapters = chapters.slice(1);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="story"
      aria-label="Follow the heat: a scroll story through the house"
      style={{ ["--story-vh" as string]: totalScrollVh }}
    >
      <div className="story__sticky">
        <div ref={stageRef} className="story__stage" aria-hidden="true">
          <canvas ref={canvasRef} className="story__canvas" />
          <div ref={posterRef} className="story__poster">
            <Image
              src="/img/keys/K01-hero-2400.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={(blur as Record<string, string>)["K01-hero"]}
              className="story__poster-img"
            />
          </div>
          <FrostParticles />
          <div className="story__vignette" />
          <div className="story__scrim" />
          <XrayCallouts />
        </div>
        <TuneupChecklist />
        <div className="story__chapters">
          <HeroText still={chapters[0]} />
          {storyChapters.map((c) => (
            <ChapterText key={c.id} chapter={c} copy={story[c.id]} />
          ))}
        </div>
      </div>

      {/* scroll anchors so nav links and the progress rail can target chapters */}
      <div className="story__anchors" aria-hidden="true">
        {chapters.map((c, i) => (
          <span
            key={c.id}
            id={`story-${c.id}`}
            style={{
              top: `calc((${chapters.slice(0, i).reduce((s, x) => s + x.scrollVh, 0)} + ${i === 0 ? 0 : c.scrollVh * 0.2}) * var(--story-scale, 1) * 1vh)`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
