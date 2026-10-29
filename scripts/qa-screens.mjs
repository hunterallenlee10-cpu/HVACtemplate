// QA screenshots:  BASE=http://localhost:3100 node scripts/qa-screens.mjs [--reduced] [--only=desktop|mobile]
// Scrolls to the middle of every story chapter and every section at 1440×900 and 390×844,
// saves PNGs to /qa and writes qa/console.json with any console errors/warnings.
import { createRequire } from "node:module";
// Playwright may be installed globally (NODE_PATH) or locally; createRequire covers both.
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3100";
const reduced = process.argv.includes("--reduced");
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const viewports = [
  { name: "desktop", width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
].filter((v) => !only || v.name === only);
const sections = ["comfort-check", "tune-ups", "new-systems", "fix-or-replace", "plans", "reviews", "service-area", "faq", "book"];
fs.mkdirSync("qa", { recursive: true });
const log = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) log.push({ vp: vp.name, reduced, type: m.type(), text: m.text() }); });
  page.on("pageerror", (e) => log.push({ vp: vp.name, reduced, type: "pageerror", text: String(e) }));
  const tag = `${vp.name}${reduced ? "-reduced" : ""}`;
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !document.querySelector(".preloader"), null, { timeout: 8000 }).catch(() => {});
  await sleep(1500);
  await page.screenshot({ path: `qa/${tag}-00-hero.png` });

  if (!reduced) {
    const offsets = await page.evaluate(() => window.__storyOffsets?.current ?? []);
    const storyEnd = await page.evaluate(() => { const s = document.getElementById("story"); return s.offsetTop + s.offsetHeight - innerHeight; });
    for (let i = 1; i < offsets.length; i++) {
      const start = offsets[i], end = offsets[i + 1] ?? storyEnd;
      const stops = i === 7 ? [0.3, 0.7, 0.9] : [0.5];
      for (const f of stops) {
        await page.evaluate((y) => window.scrollTo(0, y), start + (end - start) * f);
        await sleep(1800);
        await page.screenshot({ path: `qa/${tag}-ch${i}${stops.length > 1 ? "-" + Math.round(f * 100) : ""}.png` });
      }
    }
  } else {
    const n = await page.evaluate(() => document.querySelectorAll(".chapter").length);
    for (let i = 1; i < n; i++) {
      await page.evaluate((k) => document.querySelectorAll(".chapter")[k].scrollIntoView(), i);
      await sleep(400);
      await page.screenshot({ path: `qa/${tag}-ch${i}.png` });
    }
  }
  for (const id of sections) {
    await page.evaluate((s) => { const el = document.getElementById(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, id);
    await sleep(1300);
    await page.screenshot({ path: `qa/${tag}-s-${id}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(800);
  await page.screenshot({ path: `qa/${tag}-zz-footer.png` });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`qa/console${reduced ? "-reduced" : ""}.json`, JSON.stringify(log, null, 2));
console.log(`done; ${log.length} console messages`);
for (const l of log.slice(0, 30)) console.log(l.vp, l.type, l.text.slice(0, 200));
