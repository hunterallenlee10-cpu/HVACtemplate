# Follow the Heat: cinematic scroll-story HVAC site

A scroll-driven marketing site for a residential HVAC company. As you scroll, the camera moves from a frozen house into the
living room, down a floor vent, through the ducts, into the furnace, back up into a warm room, out to the outdoor unit and into
an x-ray exploded view of it. Interactive tools follow (thermostat dial, filter compare, system picker, repair-vs-replace
calculator), then plans, reviews, service area, FAQ and booking.

**Live:** https://hvactemplate.vercel.app · QA results: `qa/QA-REPORT.md`

Brand in this repo: **Northfield Heating & Air, Frederick MD**, a placeholder. See `OWNER-TODO.md`.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Production check:

```bash
npm run build && npm start
```

Copy `.env.example` to `.env.local` to wire the booking form (n8n webhook or Resend). In development, with neither set, bookings are logged to the server console.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · GSAP 3 + ScrollTrigger · Lenis · zod · sharp/ffmpeg asset pipeline · Vercel Analytics.

## How the story works

- `components/story/StoryCanvas.tsx`: one `<section>` whose first child is a 100svh **sticky** stage (CSS sticky plays well
  with Lenis). A GSAP ScrollTrigger (`scrub: 0.6`) eases progress; a GSAP ticker maps progress to (chapter, frame) and redraws the
  `<canvas>` **only when the frame changes**.
- `lib/sequenceLoader.ts`: fetches WebP frames 6 at a time (current chapter coarse-to-fine, then the next chapter), keeps them
  as compressed blobs and only decodes a small window around the playhead, so memory stays bounded. If a frame isn't ready yet,
  the nearest decoded frame is drawn.
- `content/chapters.ts`: scroll length, HUD temperature, warmth range, keyframe still and x-ray callout anchors per chapter.
  Mobile scroll lengths are 70% of desktop.
- All story copy is real HTML (`ChapterText`, `HeroText`) for SEO and screen readers; one `<h1>`.
- `--warmth` (0 → 1) on `<html>` drives the background (night → char) and accent glow.
- **Reduced motion / no JS:** an inline script keeps `html.static-story` for reduced-motion visitors (and `.no-js` without JS),
  which turns the story into stacked full-width sections of keyframe stills plus the same text. No scrubbing, no Lenis.

## Asset pipeline

| Step | Command | In → Out |
|---|---|---|
| Placeholder frames (before art exists) | `npm run placeholders` | → `public/seq/**`, `content/frames.json` |
| Frames from transition clips | `npm run frames` (or `bash scripts/extract-frames.sh ch03`) | `assets/raw/clips/V0X.mp4` → `public/seq/{desktop,mobile}/chXX/*.webp`, `content/frames.json` |
| Stills, products, OG base | `npm run images` | `assets/raw/keys/*.png`, `assets/raw/products/*.png` → `public/img/**`, `content/blur.json` |
| QA screenshots | `BASE=http://localhost:3000 npm run qa` (`-- --reduced` for reduced motion) | → `qa/*.png`, `qa/console.json` |

Clip → chapter mapping, fps, sizes and the mobile crop focal points are in `content/sequence.manifest.json`.
Every generation (model, prompt, settings, job ID, why it won) is logged in `ASSETS.md`.

## Re-skin for another HVAC client (about 10 minutes, plus new art)

1. **`content/site.ts`**: name, phone (+ `phoneHref`), email, license, city/state, service-area towns (with lat/lng), hours,
   founding year, tune-up price, membership name and tiers, system price ranges, FAQ answers, domain. Nothing is hard-coded
   in components.
2. **Logo**: `components/chrome/LogoMark.tsx` (inline SVG) and `app/icon.svg` (favicon); regenerate `app/apple-icon.png` from it.
3. **Colors / type**: tokens at the top of `app/globals.css` (`--ember`, `--frost`, `--night`, `--char`…), fonts in `app/layout.tsx`.
4. **Art (optional but recommended)**: regenerate the house-specific keyframes in the client's house style, keeping the same
   file names, then the transitions:
   - K01 (exterior), K02 (cold room) → K03, K06, K06b (edits of K02), K07 (outdoor unit, ref K01) → K08 (x-ray, ref K07), K14 (OG, ref K01).
   - K04/K05 (duct, burners), K09/K10 (filter) and K11–K13 (products) are generic and can usually stay.
   - Then V01–V08 (prompts in `ASSETS.md`), `npm run frames`, `npm run images`, and re-tune `xrayAnchors` in `content/chapters.ts`
     against the last frame of `public/seq/desktop/ch07/`.
5. Set the Vercel env vars (`BOOKING_WEBHOOK_URL` or `RESEND_API_KEY` + `BOOKING_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`).
6. Work through `OWNER-TODO.md`.

## Folder map

```
app/            layout, page, globals.css, api/book, sitemap, robots, opengraph-image, icons
components/     chrome/ (Nav, TempHUD, ProgressRail, BookingBar, Preloader, Grain…), story/, tools/, sections/
content/        site.ts (all copy + data), chapters.ts, sequence.manifest.json, frames.json, blur.json
lib/            sequenceLoader, storyStore, useLenis, temperature, scramble, reveal, bookingSchema
public/seq      frame sequences (desktop 1600w, mobile 3:4 crop)
public/img      keyframes, products, og-base
scripts/        extract-frames.sh/.mjs, make-placeholders.mjs, optimize-images.mjs, qa-screens.mjs
assets/         jobs.json (Higgsfield job IDs); raw/ (downloads, gitignored)
```
