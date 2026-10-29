/** Color helpers for the warmth system (0 = cold, 1 = warm). */
type RGB = [number, number, number];

const hex = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = ([r, g, b]: RGB) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  const k = Math.min(1, Math.max(0, t));
  return toHex([A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]);
};

export const FROST = "#9FD3FF";
export const EMBER = "#FF6B2C";
export const EMBER_HI = "#FF9A3D";

/** frost → ember through a soft neutral, for HUD bars and dial arcs */
export const tempColor = (t: number) => (t < 0.5 ? mix(FROST, "#F4ECDF", t * 2) : mix("#F4ECDF", EMBER, (t - 0.5) * 2));

/** map a temperature in °F (60–74) to 0–1 */
export const tempToT = (f: number, min = 60, max = 74) => Math.min(1, Math.max(0, (f - min) / (max - min)));

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
