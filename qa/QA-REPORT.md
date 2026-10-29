# QA report (2026-10-29)

Live: https://hvactemplate.vercel.app (Vercel project `hvactemplate`, team `leu`)

## Screenshots
`node scripts/qa-screens.mjs` (and `--reduced`) captured the middle of every chapter (ch7 at 30/70/90%) and every section at
1440×900 and 390×844, plus reduced-motion versions of both. All were reviewed by eye. Fixed along the way: invisible headlines
(GSAP read the CSS translate as px), collapsed word spaces in masked headings, ch7 checklist/text/callout collisions,
see-through nav glass, uneven filter stat cards, hero CTA gap, mobile eyebrow/chip wrapping, contrast on review placeholders.
PNGs are gitignored; re-run the script to regenerate.

## Console
0 errors / 0 warnings: local production build (desktop, mobile, reduced motion) and the live deployment.

## Interactions: `node scripts/qa-tools.mjs`, 36/36 pass
- Thermostat dial: arrow keys, PageUp/PageDown, Home/End, mouse drag, touch tap, −/+ buttons, caption updates; dial is 260px on a 390px screen.
- Filter compare: keyboard (Home/arrows/PageUp), mouse drag, touch tap.
- System picker: click, tap, arrow keys with focus following the active tab.
- Repair/replace: repair / toss-up / replace thresholds, 3-symptom override, R-22 note for heat pump/AC ≥ 15 yrs.
- FAQ: Enter toggles, single-open accordion. Mobile menu: opens, Esc closes, focus returns. Skip link is the first tab stop.
- Booking form: empty submit shows 4 field errors and focuses the first; valid submit shows the success state and the mock n8n
  webhook (`scripts/mock-webhook.mjs`) received the full JSON payload.
- API: honeypot answers ok but is not forwarded; bad ZIP → 422 with field errors; 6th request from one IP in 10 min → 429.

## Lighthouse (mobile, simulated slow 4G, local production build)
| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 90 | 100 | 100 | 100 |

LCP 3.1 s (the hero paragraph; Chrome ignores full-viewport images such as the poster as LCP candidates), CLS 0, TBT 170 ms,
FCP 1.0 s. Initial JS 182 KB (Next's reported first-load size).

## Payload
Frames: desktop 36.5 MB (541 frames), mobile 11 MB (271 frames), loaded per chapter, current + next only, cached immutable.
