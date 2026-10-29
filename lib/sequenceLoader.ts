/**
 * Frame sequence loader for the StoryCanvas.
 *
 * - Fetches compressed WebP frames with a concurrency limit (6), current chapter first
 *   (coarse pass, then fill-in), then prefetches the next chapter.
 * - Keeps every frame as a compressed Blob, but only decodes (createImageBitmap) a
 *   small window around the playhead and closes bitmaps that fall far outside it,
 *   so memory stays bounded (a decoded 1600×900 frame is ~5.8MB).
 * - `nearest()` returns the closest decoded frame so the canvas never goes blank.
 */
export type Drawable = ImageBitmap | HTMLImageElement;

type Chapter = { seq: string; count: number };

export class SequenceLoader {
  private blobs: (Blob | undefined)[][];
  private bitmaps = new Map<number, Drawable>();
  private decoding = new Set<number>();
  private queue: [number, number][] = [];
  private inflight = 0;
  private wanted = new Set<number>();
  private loadedCount: number[];
  private destroyed = false;
  private playhead: [number, number] = [0, 0];

  constructor(
    private chapters: Chapter[],
    private url: (seq: string, i: number) => string,
    private opts: { concurrency?: number; window?: number; onFrame?: (c: number, f: number) => void } = {}
  ) {
    this.blobs = chapters.map((c) => new Array(c.count));
    this.loadedCount = chapters.map(() => 0);
  }

  private key = (c: number, f: number) => c * 100000 + f;

  /** Coarse-to-fine order: every 8th frame, then every 4th, 2nd, then the rest. */
  private order(count: number) {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const step of [8, 4, 2, 1]) for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); out.push(i); }
    if (!seen.has(count - 1)) out.push(count - 1);
    return out;
  }

  /** Make chapter `c` the loading priority, then `c + 1`. */
  prioritize(c: number) {
    const list: [number, number][] = [];
    for (const ci of [c, c + 1]) {
      if (ci < 0 || ci >= this.chapters.length) continue;
      for (const f of this.order(this.chapters[ci].count)) {
        if (!this.blobs[ci][f]) list.push([ci, f]);
      }
    }
    // keep anything already queued for other chapters at the back
    const keep = this.queue.filter(([ci]) => ci !== c && ci !== c + 1);
    this.queue = list.concat(keep);
    this.pump();
  }

  progress(c: number) {
    const n = this.chapters[c]?.count || 1;
    return this.loadedCount[c] / n;
  }

  private pump() {
    const limit = this.opts.concurrency ?? 6;
    while (!this.destroyed && this.inflight < limit && this.queue.length) {
      const [c, f] = this.queue.shift()!;
      const k = this.key(c, f);
      if (this.blobs[c][f] || this.wanted.has(k)) continue;
      this.wanted.add(k);
      this.inflight++;
      fetch(this.url(this.chapters[c].seq, f))
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((b) => {
          if (this.destroyed) return;
          this.blobs[c][f] = b;
          this.loadedCount[c]++;
          // decode right away if it's near the playhead
          const [pc, pf] = this.playhead;
          if (c === pc && Math.abs(f - pf) <= (this.opts.window ?? 10)) this.decode(c, f);
          else if (c === pc + 1 && f < 3) this.decode(c, f);
        })
        .catch(() => {
          this.wanted.delete(k);
        })
        .finally(() => {
          this.inflight--;
          this.pump();
        });
    }
  }

  private decode(c: number, f: number) {
    if (c < 0 || c >= this.blobs.length || f < 0) return;
    const k = this.key(c, f);
    const blob = this.blobs[c][f];
    if (!blob || this.bitmaps.has(k) || this.decoding.has(k)) return;
    this.decoding.add(k);
    const done = (bmp: Drawable) => {
      this.decoding.delete(k);
      if (this.destroyed) return;
      this.bitmaps.set(k, bmp);
      this.opts.onFrame?.(c, f);
    };
    if (typeof createImageBitmap === "function") {
      createImageBitmap(blob)
        .then(done)
        .catch(() => this.decoding.delete(k));
    } else {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.decode().then(() => done(img)).catch(() => this.decoding.delete(k));
    }
  }

  /** Tell the loader where the playhead is: decodes a window around it, evicts the rest. */
  seek(c: number, f: number) {
    this.playhead = [c, f];
    const R = this.opts.window ?? 10;
    const count = this.chapters[c]?.count ?? 0;
    // decode outward from the playhead so the nearest frames land first
    for (let d = 0; d <= R; d++) {
      if (f + d < count) this.decode(c, f + d);
      if (d && f - d >= 0) this.decode(c, f - d);
    }
    // the first frames of the next chapter and the last of the previous, for clean hand-offs
    if (f > count - R) for (let i = 0; i < 3; i++) this.decode(c + 1, i);
    if (f < R && c > 0) this.decode(c - 1, (this.chapters[c - 1]?.count ?? 1) - 1);
    // evict decoded frames far from the playhead
    if (this.bitmaps.size > R * 4) {
      for (const [k, bmp] of this.bitmaps) {
        const kc = Math.floor(k / 100000), kf = k % 100000;
        const lastOfPrev = kc === c - 1 && kf === (this.chapters[kc]?.count ?? 0) - 1;
        const headOfNext = kc === c + 1 && kf < 3;
        const far = kc === c ? Math.abs(kf - f) > R * 2 : !(lastOfPrev || headOfNext);
        if (far) {
          if ("close" in bmp) bmp.close();
          this.bitmaps.delete(k);
        }
      }
    }
  }

  /** Closest decoded frame to (c, f) in the same chapter, or null. */
  nearest(c: number, f: number): Drawable | null {
    const exact = this.bitmaps.get(this.key(c, f));
    if (exact) return exact;
    const count = this.chapters[c]?.count ?? 0;
    for (let d = 1; d < count; d++) {
      const a = this.bitmaps.get(this.key(c, f - d));
      if (a) return a;
      const b = this.bitmaps.get(this.key(c, f + d));
      if (b) return b;
    }
    return null;
  }

  has(c: number, f: number) {
    return this.bitmaps.has(this.key(c, f));
  }

  destroy() {
    this.destroyed = true;
    for (const b of this.bitmaps.values()) if ("close" in b) b.close();
    this.bitmaps.clear();
    this.queue = [];
  }
}
