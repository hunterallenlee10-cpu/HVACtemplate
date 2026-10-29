/**
 * Story chapters: scroll lengths, HUD values, warmth, frame sets and x-ray callout anchors.
 * Frame counts come from content/frames.json, which scripts/extract-frames.sh (real
 * frames) or scripts/make-placeholders.mjs (placeholders) writes.
 */
import frames from "./frames.json";
import { hero, story } from "./site";

export type ChapterId = "ch0" | "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6" | "ch7";

export type Chapter = {
  id: ChapterId;
  /** folder name under /public/seq/{desktop|mobile}/ — null for the static hero */
  seq: string | null;
  rail: string;
  hud: { temp: number | null; label: string } | null;
  /** desktop scroll length in vh; mobile uses STORY_MOBILE_SCALE of this */
  scrollVh: number;
  /** --warmth at chapter start / end (0 cold … 1 warm) */
  warmth: [number, number];
  /** keyframe still used by the reduced-motion / no-JS layout */
  still: string;
  stillAlt: string;
  /** frames play over [0, playUntil] of the chapter, then hold the last frame */
  playUntil?: number;
  /** override the overlay text window [in, out] (chapter progress) */
  textWindow?: [number, number];
};

export const STORY_MOBILE_SCALE = 0.7;

export const chapters: Chapter[] = [
  {
    id: "ch0",
    seq: null,
    rail: "Outside",
    hud: null,
    scrollVh: 100,
    warmth: [0, 0],
    still: "/img/keys/K01-hero",
    stillAlt: hero.posterAlt,
  },
  {
    id: "ch1",
    seq: "ch01",
    rail: "Cold room",
    hud: { temp: 61, label: "LIVING ROOM" },
    scrollVh: 220,
    warmth: [0, 0.04],
    still: "/img/keys/K02-cold-room",
    stillAlt: "A cold living room at dawn with frost on the inside of the windows",
  },
  {
    id: "ch2",
    seq: "ch02",
    rail: "Inside the vent",
    hud: { temp: 62, label: "SUPPLY REGISTER" },
    scrollVh: 170,
    warmth: [0.06, 0.12],
    still: "/img/keys/K03-register",
    stillAlt: "Close-up of a steel floor heating register in an oak floor",
  },
  {
    id: "ch3",
    seq: "ch03",
    rail: "Down the duct",
    hud: { temp: 64, label: "SUPPLY DUCT" },
    scrollVh: 260,
    warmth: [0.15, 0.45],
    still: "/img/keys/K04-duct",
    stillAlt: "Inside a galvanized metal supply duct with an orange glow at the end",
  },
  {
    id: "ch4",
    seq: "ch04",
    rail: "At the burner",
    hud: { temp: 68, label: "FURNACE" },
    scrollVh: 200,
    warmth: [0.55, 0.85],
    still: "/img/keys/K05-furnace",
    stillAlt: "A row of steady blue gas burner flames inside a furnace",
  },
  {
    id: "ch5",
    seq: "ch05",
    rail: "Warm again",
    hud: { temp: 70, label: "LIVING ROOM" },
    scrollVh: 220,
    warmth: [0.9, 1],
    still: "/img/keys/K06-warm-room",
    stillAlt: "The same living room in warm late-afternoon sunlight",
  },
  {
    id: "ch6",
    seq: "ch06",
    rail: "Outdoor unit",
    hud: { temp: null, label: "OUTDOOR UNIT" },
    scrollVh: 200,
    warmth: [1, 0.9],
    still: "/img/keys/K07-outdoor-unit",
    stillAlt: "An outdoor heat pump unit on a concrete pad among autumn leaves",
  },
  {
    id: "ch7",
    seq: "ch07",
    rail: "X-ray",
    hud: { temp: null, label: "OUTDOOR UNIT" },
    scrollVh: 360,
    warmth: [0.9, 0.85],
    playUntil: 0.58,
    textWindow: [0.06, 0.4],
    still: "/img/keys/K08-xray",
    stillAlt: "The outdoor unit shown as a cyan x-ray, exploded into its parts",
  },
];

export const storyCopy = story;

/** frame counts per chapter, per set */
export const frameCounts = frames as unknown as {
  placeholder: boolean;
  desktop: Record<string, number>;
  mobile: Record<string, number>;
  focal: Record<string, [number, number]>;
  mobileAspect: number;
};

export const MOBILE_BREAKPOINT = 768;

export const frameUrl = (set: "desktop" | "mobile", seq: string, i: number) =>
  `/seq/${set}/${seq}/${String(i + 1).padStart(4, "0")}.webp`;

/**
 * X-ray callout anchors, in % of the full 16:9 frame (x, y). `side` puts the tag
 * left or right of the anchor. `at` is the chapter progress (0–1) where it appears.
 * Tuned by eye against the final ch07 frames.
 */
export const xrayAnchors: Record<string, { x: number; y: number; side: "left" | "right"; at: number }> = {
  fan: { x: 51, y: 25, side: "right", at: 0.6 },
  coil: { x: 57.4, y: 36.5, side: "right", at: 0.66 },
  board: { x: 45.2, y: 49, side: "left", at: 0.72 },
  compressor: { x: 49.6, y: 66, side: "right", at: 0.78 },
  cap: { x: 53.4, y: 57, side: "right", at: 0.84 },
};

/** chapter 7 checklist: visible window and tick range (chapter progress) */
export const CHECKLIST = { show: [0.42, 0.94] as [number, number], tick: [0.46, 0.9] as [number, number] };

/** chapter progress window where the overlay text is shown */
export const TEXT_IN = 0.12;
export const TEXT_OUT = 0.86;

export const totalScrollVh = chapters.reduce((s, c) => s + c.scrollVh, 0);
