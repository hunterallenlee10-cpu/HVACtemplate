// Generates gradient placeholder frame sequences so the StoryCanvas can be built
// and tested before the real Higgsfield frames exist.  node scripts/make-placeholders.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const chapters = [
  ["ch01", "Cold house → living room", "#0d1a2b", "#1d3550"],
  ["ch02", "Into the vent", "#101c2a", "#22374a"],
  ["ch03", "Down the duct", "#14161c", "#5a2e14"],
  ["ch04", "At the burner", "#1a0f0a", "#1f3c8a"],
  ["ch05", "Warm room", "#2a170b", "#8a4a16"],
  ["ch06", "The outdoor half", "#1d140c", "#6b3a12"],
  ["ch07", "X-ray", "#071417", "#0d4a44"],
];
const COUNT = 72;
const out = { placeholder: true, desktop: {}, mobile: {}, focal: {}, mobileAspect: 0.75 };

const svg = (w, h, a, b, title, i, n) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${w * (0.2 + 0.6 * (i / n))}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.18}" fill="#ffffff" opacity="0.06"/>
<text x="50%" y="46%" fill="#F4ECDF" opacity="0.5" font-family="monospace" font-size="${w * 0.035}" text-anchor="middle">${title}</text>
<text x="50%" y="56%" fill="#F4ECDF" opacity="0.35" font-family="monospace" font-size="${w * 0.025}" text-anchor="middle">frame ${String(i + 1).padStart(4, "0")} / ${n}</text>
</svg>`;

for (const [id, title, a, b] of chapters) {
  for (const [set, w, h, step] of [["desktop", 1600, 900, 1], ["mobile", 810, 1080, 2]]) {
    const dir = path.join(root, "public/seq", set, id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    let k = 0;
    for (let i = 0; i < COUNT; i += step) {
      k++;
      await sharp(Buffer.from(svg(w, h, a, b, title, i, COUNT))).webp({ quality: 60 }).toFile(path.join(dir, `${String(k).padStart(4, "0")}.webp`));
    }
    out[set][id] = k;
  }
  out.focal[id] = [0.5, 0.5];
  console.log("placeholder", id);
}
fs.writeFileSync(path.join(root, "content/frames.json"), JSON.stringify(out, null, 2) + "\n");
