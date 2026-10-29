// Stills pipeline:  node scripts/optimize-images.mjs
//   assets/raw/keys/KXX-name.png   → public/img/keys/KXX-name-{900,1600,2400}.{avif,webp}
//   assets/raw/products/{furnace,heatpump,ductless}.png (transparent cutouts)
//                                   → public/img/products/{name}-{900,1400}.{avif,webp}
//   K14 (OG)                        → public/img/og-base.jpg (1200×630)
//   tiny blurred placeholders       → content/blur.json
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const keysIn = path.join(root, "assets/raw/keys");
const keysOut = path.join(root, "public/img/keys");
const prodIn = path.join(root, "assets/raw/products");
const prodOut = path.join(root, "public/img/products");
fs.mkdirSync(keysOut, { recursive: true });
fs.mkdirSync(prodOut, { recursive: true });
const blurPath = path.join(root, "content/blur.json");
const blur = fs.existsSync(blurPath) ? JSON.parse(fs.readFileSync(blurPath, "utf8")) : {};
const only = process.argv[2];

const fresh = (src, out) => fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(src).mtimeMs;

for (const f of fs.readdirSync(keysIn).filter((f) => f.endsWith(".png")).sort()) {
  const name = f.replace(/\.png$/, "");
  if (only && !name.startsWith(only)) continue;
  const src = path.join(keysIn, f);
  for (const w of [900, 1600, 2400]) {
    const base = path.join(keysOut, `${name}-${w}`);
    if (fresh(src, `${base}.avif`)) continue;
    const img = sharp(src).resize({ width: w, withoutEnlargement: true });
    await img.clone().webp({ quality: w > 1600 ? 74 : 78, effort: 5 }).toFile(`${base}.webp`);
    await img.clone().avif({ quality: w > 1600 ? 52 : 56, effort: 4 }).toFile(`${base}.avif`);
  }
  const tiny = await sharp(src).resize(24).blur(1.2).webp({ quality: 40 }).toBuffer();
  blur[name] = `data:image/webp;base64,${tiny.toString("base64")}`;
  console.log("key", name);
}

// OG base: K14 is a 21:9 reframe with the house on the right third
const og = fs.readdirSync(keysIn).find((f) => f.startsWith("K14"));
if (og) {
  await sharp(path.join(keysIn, og)).resize(1200, 630, { fit: "cover", position: "right" }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(root, "public/img/og-base.jpg"));
  console.log("og-base.jpg");
}

// Products: transparent cutouts, trimmed and padded to a square
const fallbacks = { furnace: "K11-furnace-product.png", heatpump: "K12-heatpump-product.png", ductless: "K13-ductless-product.png" };
for (const [name, fb] of Object.entries(fallbacks)) {
  const cut = path.join(prodIn, `${name}.png`);
  const src = fs.existsSync(cut) ? cut : path.join(keysIn, fb);
  if (!fs.existsSync(src)) continue;
  const isCut = src === cut;
  let pipeline = sharp(src);
  if (isCut) pipeline = pipeline.trim({ threshold: 2 });
  const buf = await pipeline.png().toBuffer();
  const meta = await sharp(buf).metadata();
  const side = Math.round(Math.max(meta.width, meta.height) * 1.08);
  const square = await sharp(buf)
    .extend({
      top: Math.floor((side - meta.height) / 2), bottom: Math.ceil((side - meta.height) / 2),
      left: Math.floor((side - meta.width) / 2), right: Math.ceil((side - meta.width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: isCut ? 0 : 1 },
    })
    .png()
    .toBuffer();
  for (const w of [900, 1400]) {
    const base = path.join(prodOut, `${name}-${w}`);
    const img = sharp(square).resize(w, w);
    await img.clone().webp({ quality: 80, alphaQuality: 90, effort: 5 }).toFile(`${base}.webp`);
    await img.clone().avif({ quality: 58, effort: 4 }).toFile(`${base}.avif`);
  }
  console.log("product", name, isCut ? "(cutout)" : "(fallback, not cut out)");
}

fs.writeFileSync(blurPath, JSON.stringify(blur, null, 2) + "\n");
console.log("wrote content/blur.json");
