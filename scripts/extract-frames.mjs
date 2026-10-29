// See extract-frames.sh for usage.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "content/sequence.manifest.json"), "utf8"));
const clipsDir = path.join(root, "assets/raw/clips");
const tmpDir = path.join(root, "assets/tmp/frames");
const only = process.argv[2];
const framesJsonPath = path.join(root, "content/frames.json");
const framesJson = fs.existsSync(framesJsonPath)
  ? JSON.parse(fs.readFileSync(framesJsonPath, "utf8"))
  : { placeholder: false, desktop: {}, mobile: {}, focal: {}, mobileAspect: manifest.mobileAspect };

const probe = (f) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

const { fps, desktopWidth, mobileWidth, mobileAspect, mobileStep, desktopQuality, mobileQuality } = manifest;

manifest.chapters.forEach((ch, ci) => {
  if (only && only !== ch.id) return;
  const inputs = [];
  const parts = [];
  let total = 0;
  ch.segments.forEach((seg, si) => {
    const file = path.join(clipsDir, `${seg.clip}.mp4`);
    if (!fs.existsSync(file)) throw new Error(`Missing clip ${file}`);
    const dur = probe(file);
    // Skip one output frame when this segment starts on a frame that duplicates the previous one
    // (every clip's first frame is the previous clip's last frame).
    const dup = seg.from === 0 && (si > 0 || ci > 0) ? 1 / fps : 0;
    const start = seg.from * dur + dup;
    const end = seg.to * dur;
    total += end - start;
    inputs.push("-i", file);
    parts.push(
      `[${si}:v]trim=start=${start.toFixed(4)}:end=${end.toFixed(4)},setpts=PTS-STARTPTS,` +
        `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,setsar=1,format=yuv420p[s${si}]`
    );
  });
  const n = ch.segments.length;
  const [f0, f1] = ch.focal;
  const T = Math.max(total, 0.01).toFixed(4);
  const cropX = `max(0\\,min(iw-ow\\,(${f0}+(${f1 - f0})*t/${T})*iw-ow/2))`;
  const graph =
    parts.join(";") +
    ";" +
    ch.segments.map((_, i) => `[s${i}]`).join("") +
    `concat=n=${n}:v=1:a=0,split=2[a][b];` +
    `[a]fps=${fps},scale=${desktopWidth}:-2:flags=lanczos[d];` +
    `[b]fps=${fps / mobileStep},crop=ih*${mobileAspect}:ih:${cropX}:0,scale=${mobileWidth}:-2:flags=lanczos[m]`;

  const dDir = path.join(root, "public/seq/desktop", ch.id);
  const mDir = path.join(root, "public/seq/mobile", ch.id);
  for (const d of [dDir, mDir]) {
    fs.rmSync(d, { recursive: true, force: true });
    fs.mkdirSync(d, { recursive: true });
  }
  fs.mkdirSync(tmpDir, { recursive: true });
  const graphFile = path.join(tmpDir, `${ch.id}.graph`);
  fs.writeFileSync(graphFile, graph);
  execFileSync(
    "ffmpeg",
    [
      "-y", "-loglevel", "error", ...inputs,
      "-filter_complex_script", graphFile,
      "-map", "[d]", "-c:v", "libwebp", "-quality", String(desktopQuality), "-compression_level", "6", "-start_number", "1", path.join(dDir, "%04d.webp"),
      "-map", "[m]", "-c:v", "libwebp", "-quality", String(mobileQuality), "-compression_level", "6", "-start_number", "1", path.join(mDir, "%04d.webp"),
    ],
    { stdio: "inherit" }
  );
  const count = (d) => fs.readdirSync(d).filter((f) => f.endsWith(".webp")).length;
  const size = (d) => fs.readdirSync(d).reduce((s, f) => s + fs.statSync(path.join(d, f)).size, 0);
  framesJson.desktop[ch.id] = count(dDir);
  framesJson.mobile[ch.id] = count(mDir);
  framesJson.focal[ch.id] = ch.focal;
  console.log(
    `${ch.id}: ${total.toFixed(2)}s → desktop ${framesJson.desktop[ch.id]} frames (${(size(dDir) / 1e6).toFixed(1)}MB), mobile ${framesJson.mobile[ch.id]} (${(size(mDir) / 1e6).toFixed(1)}MB)`
  );
});

framesJson.placeholder = false;
framesJson.mobileAspect = mobileAspect;
fs.writeFileSync(framesJsonPath, JSON.stringify(framesJson, null, 2) + "\n");
console.log("wrote content/frames.json");
