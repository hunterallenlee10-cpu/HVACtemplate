/**
 * Tiny pub/sub shared by the StoryCanvas engine and the chrome (HUD, rail, nav).
 * It only notifies on meaningful changes (chapter switch, story enter/leave,
 * loading progress), never per frame, so React re-renders stay rare.
 */
import type { ChapterId } from "@/content/chapters";

export type StoryState = {
  chapter: ChapterId;
  chapterIndex: number;
  inStory: boolean; // story section on screen
  pastStory: boolean; // scrolled beyond the story
  pastHero: boolean;
  loaded: number; // 0..1 of the first chapter's frames (preloader)
  ready: boolean; // preloader finished
  staticMode: boolean; // reduced motion → stacked layout
};

let state: StoryState = {
  chapter: "ch0",
  chapterIndex: 0,
  inStory: true,
  pastStory: false,
  pastHero: false,
  loaded: 0,
  ready: false,
  staticMode: false,
};

const listeners = new Set<() => void>();

export const storyStore = {
  get: () => state,
  set(patch: Partial<StoryState>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof StoryState;
      if (state[key] !== patch[key]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/** scroll targets registered by the story engine (document Y of each chapter start) */
export const chapterOffsets: { current: number[] } = { current: [] };

/** Chapter overlays register handlers here; the engine calls them as chapters activate. */
export type OverlayHandlers = {
  enter?: () => void;
  leave?: () => void;
};
export const overlays = new Map<ChapterId, OverlayHandlers>();

/** Where the current frame is drawn on screen, so DOM callouts can line up with it. */
export const stageRect = {
  dx: 0, dy: 0, dw: 0, dh: 0, // drawn image rect in CSS px
  cropX0: 0, cropW: 1, // portion of the full 16:9 frame the drawn image represents (mobile crops)
  version: 0,
};

/** Per-frame progress listeners per chapter (several components can listen to one chapter). */
export const progressHandlers = new Map<ChapterId, Set<(t: number) => void>>();
export function onChapterProgress(id: ChapterId, fn: (t: number) => void) {
  if (!progressHandlers.has(id)) progressHandlers.set(id, new Set());
  progressHandlers.get(id)!.add(fn);
  return () => progressHandlers.get(id)?.delete(fn);
}
