"use client";
import { useSyncExternalStore } from "react";
import { storyStore, type StoryState } from "./storyStore";

const serverState = storyStore.get();
export function useStory<T>(select: (s: StoryState) => T): T {
  return useSyncExternalStore(
    storyStore.subscribe,
    () => select(storyStore.get()),
    () => select(serverState)
  );
}
