// Interaction QA for the tools, menu, FAQ and booking form (mouse, touch and keyboard).
//   BASE=http://localhost:3100 node scripts/qa-tools.mjs
// Run the server with BOOKING_WEBHOOK_URL pointing at scripts/mock-webhook.mjs to check the payload.
import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE || "http://localhost:3100";
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();

async function open(opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !document.querySelector(".preloader"), null, { timeout: 8000 }).catch(() => {});
  return { ctx, page, errors };
}
const jump = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 90); }, sel);

// ---------- desktop: keyboard + mouse ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 } });

  // Thermostat: keyboard
  await jump(page, "#comfort-check"); await sleep(600);
  const dial = page.locator(".dial");
  await dial.focus();
  for (let i = 0; i < 9; i++) await page.keyboard.press("ArrowRight");
  check("thermostat: ArrowRight ×9 → 70°", (await dial.getAttribute("aria-valuenow")) === "70");
  await page.keyboard.press("End");
  check("thermostat: End → 74°", (await dial.getAttribute("aria-valuenow")) === "74");
  await page.keyboard.press("PageDown");
  check("thermostat: PageDown → 71°", (await dial.getAttribute("aria-valuenow")) === "71");
  check("thermostat: caption changes", (await page.locator(".thermo__caption").innerText()).includes("Even, steady warmth"));
  // Thermostat: mouse drag from knob to the left end (9 o'clock ≈ low temps)
  const box = await dial.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx + box.width * 0.3, cy - box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(cx - box.width * 0.35, cy + box.height * 0.3, { steps: 8 });
  await page.mouse.up();
  const dragged = Number(await dial.getAttribute("aria-valuenow"));
  check("thermostat: mouse drag to lower-left → ~60°", dragged <= 61, `got ${dragged}`);
  await page.locator(".dial__btns button").nth(1).click();
  check("thermostat: + button", Number(await dial.getAttribute("aria-valuenow")) === dragged + 1);
  await page.screenshot({ path: "qa/tool-thermo-desktop.png" });

  // Filter compare: keyboard + drag
  await jump(page, "#tune-ups"); await sleep(600);
  const handle = page.locator(".compare__handle");
  await handle.focus();
  await page.keyboard.press("Home");
  check("filter: Home → 0", (await handle.getAttribute("aria-valuenow")) === "0");
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("PageUp");
  check("filter: ArrowRight + PageUp → 12", (await handle.getAttribute("aria-valuenow")) === "12");
  const cmp = await page.locator(".compare").boundingBox();
  await page.mouse.move(cmp.x + cmp.width * 0.5, cmp.y + cmp.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(cmp.x + cmp.width * 0.8, cmp.y + cmp.height * 0.5, { steps: 6 });
  await page.mouse.up();
  const fv = Number(await handle.getAttribute("aria-valuenow"));
  check("filter: mouse drag → ~80", Math.abs(fv - 80) <= 2, `got ${fv}`);
  await page.screenshot({ path: "qa/tool-filter-desktop.png" });

  // System picker: click + arrow keys
  await jump(page, "#new-systems"); await sleep(600);
  await page.getByRole("tab", { name: "Heat pump" }).click(); await sleep(700);
  check("picker: click Heat pump", (await page.locator(".picker__name").innerText()) === "Heat pump");
  await page.keyboard.press("ArrowRight"); await sleep(700);
  check("picker: ArrowRight → Ductless", (await page.locator(".picker__name").innerText()) === "Ductless mini-split");
  check("picker: focus follows tab", await page.evaluate(() => document.activeElement?.getAttribute("data-key") === "ductless"));
  await sleep(1200);
  await page.screenshot({ path: "qa/tool-picker-desktop.png" });

  // Repair calculator
  await jump(page, "#fix-or-replace"); await sleep(600);
  const word = () => page.locator(".calc__word").innerText();
  check("calc: default 12 × $650 → Replace", (await word()) === "Replace it", await page.locator(".calc__formula").innerText());
  await page.locator("#calc-age").focus(); await page.keyboard.press("Home");
  check("calc: age 1 → Repair", (await word()) === "Repair it");
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight"); // age 5
  await page.evaluate(() => { const r = document.getElementById("calc-quote"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(r, "800"); r.dispatchEvent(new Event("input", { bubbles: true })); });
  check("calc: 5 × $800 = $4,000 → toss-up", (await word()) === "It's a toss-up", await page.locator(".calc__formula").innerText());
  await page.getByRole("button", { name: "Bills keep climbing" }).click();
  await page.getByRole("button", { name: "New noises" }).click();
  await page.getByRole("button", { name: "Short cycling" }).click();
  check("calc: 3 symptoms → Replace", (await word()) === "Replace it");
  await page.getByRole("radio", { name: "Heat pump" }).click();
  await page.locator("#calc-age").focus(); await page.keyboard.press("End");
  check("calc: heat pump ≥15 yrs shows R-22 note", await page.locator(".calc__note").isVisible());
  await page.screenshot({ path: "qa/tool-calc-desktop.png" });

  // FAQ keyboard
  await jump(page, "#faq"); await sleep(500);
  const q2 = page.locator(".faq__q").nth(1);
  await q2.focus(); await page.keyboard.press("Enter"); await sleep(600);
  check("faq: Enter opens item 2", (await q2.getAttribute("aria-expanded")) === "true");
  check("faq: item 1 closed", (await page.locator(".faq__q").first().getAttribute("aria-expanded")) === "false");

  // Booking form: validation + submit
  await jump(page, "#book"); await sleep(600);
  await page.getByRole("button", { name: /Request my visit/ }).click(); await sleep(400);
  const errCount = await page.locator(".field__err").count();
  check("form: empty submit shows field errors", errCount >= 4, `${errCount} errors`);
  check("form: focus moves to first invalid field", await page.evaluate(() => document.activeElement?.getAttribute("name") === "name"));
  await page.fill('[name="name"]', "Jamie Rivera");
  await page.fill('[name="phone"]', "(301) 555-0199");
  await page.fill('[name="email"]', "jamie@example.com");
  await page.fill('[name="zip"]', "21702");
  await page.selectOption('[name="service"]', "Repair");
  await page.selectOption('[name="window"]', "Morning (8–12)");
  await page.fill('[name="notes"]', "QA test: upstairs is cold");
  await page.getByRole("button", { name: /Request my visit/ }).click();
  await page.waitForSelector(".book__done", { timeout: 8000 }).catch(() => {});
  check("form: success state", await page.locator(".book__done").isVisible());
  await page.screenshot({ path: "qa/form-success-desktop.png" });

  // skip link (fresh load so focus starts at the top)
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => !document.querySelector(".preloader"), null, { timeout: 8000 }).catch(() => {});
  await page.keyboard.press("Tab");
  check("skip link is first focusable", await page.evaluate(() => document.activeElement?.classList.contains("skip")));

  check("desktop: no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- mobile: touch ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  // menu
  await page.locator(".nav__burger").tap(); await sleep(400);
  check("menu: opens", await page.locator("#mobile-menu").isVisible());
  await page.keyboard.press("Escape"); await sleep(300);
  check("menu: Esc closes", !(await page.locator("#mobile-menu").isVisible()));
  check("menu: focus returns to burger", await page.evaluate(() => document.activeElement?.classList.contains("nav__burger")));

  await page.evaluate(() => document.querySelector(".dial").scrollIntoView({ block: "center" })); await sleep(700);
  const dial = page.locator(".dial");
  const b = await dial.boundingBox();
  check("dial ≥ 260px on mobile", b.width >= 260, `${Math.round(b.width)}px`);
  // tap the right side of the arc (3 o'clock ≈ 70°)
  await page.touchscreen.tap(b.x + b.width * 0.93, b.y + b.height * 0.5); await sleep(200);
  const tv = Number(await dial.getAttribute("aria-valuenow"));
  check("thermostat: touch tap at 3 o'clock → ~72°", tv >= 71 && tv <= 73, `got ${tv}`);
  await page.screenshot({ path: "qa/tool-thermo-mobile.png" });

  await page.evaluate(() => document.querySelector(".compare").scrollIntoView({ block: "center" })); await sleep(700);
  const cmp = await page.locator(".compare").boundingBox();
  await page.touchscreen.tap(cmp.x + cmp.width * 0.25, cmp.y + cmp.height * 0.5); await sleep(200);
  const fv = Number(await page.locator(".compare__handle").getAttribute("aria-valuenow"));
  check("filter: touch tap at 25%", Math.abs(fv - 25) <= 3, `got ${fv}`);
  await page.screenshot({ path: "qa/tool-filter-mobile.png" });

  await jump(page, "#new-systems"); await sleep(600);
  await page.getByRole("tab", { name: "Ductless mini-split" }).tap(); await sleep(900);
  check("picker: tap Ductless", (await page.locator(".picker__name").innerText()) === "Ductless mini-split");
  await page.screenshot({ path: "qa/tool-picker-mobile.png" });

  await jump(page, "#fix-or-replace"); await sleep(600);
  await page.getByRole("button", { name: "Some rooms never warm up" }).tap();
  await page.getByRole("button", { name: "New noises" }).tap();
  check("calc: tap 2 symptoms → toss-up or replace", ["It's a toss-up", "Replace it"].includes(await page.locator(".calc__word").innerText()));
  await page.screenshot({ path: "qa/tool-calc-mobile.png", fullPage: false });

  check("mobile: no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ---------- API: honeypot + validation + rate limit ----------
{
  const post = (body, ip) => fetch(`${BASE}/api/book`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });
  const good = { name: "Bot Test", phone: "3015550100", email: "b@example.com", zip: "21701", service: "Tune-up", window: "First available", notes: "" };
  const before = fs.existsSync("qa/webhook-received.json") ? JSON.parse(fs.readFileSync("qa/webhook-received.json", "utf8")).length : 0;
  const hp = await post({ ...good, company: "spam inc" }, "10.0.0.2");
  const hpJson = await hp.json();
  await sleep(300);
  const after = fs.existsSync("qa/webhook-received.json") ? JSON.parse(fs.readFileSync("qa/webhook-received.json", "utf8")).length : 0;
  check("api: honeypot answers ok but is not forwarded", hp.ok && hpJson.ok && after === before);
  const bad = await post({ ...good, zip: "abc" }, "10.0.0.3");
  const badJson = await bad.json();
  check("api: invalid ZIP → 422 with field error", bad.status === 422 && !!badJson.fieldErrors?.zip);
  let last = 0;
  for (let i = 0; i < 6; i++) last = (await post({ ...good, zip: "x" }, "10.0.0.9")).status;
  check("api: 6th request in 10 min → 429", last === 429);
}

await browser.close();
fs.writeFileSync("qa/tools-results.json", JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
