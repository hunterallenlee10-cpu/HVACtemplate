"use client";
import { chapters } from "@/content/chapters";
import { useStory } from "@/lib/useStory";
import { chapterOffsets } from "@/lib/storyStore";
import { scrollToTarget } from "@/lib/useLenis";

export default function ProgressRail() {
  const index = useStory((s) => s.chapterIndex);
  const visible = useStory((s) => s.ready && s.inStory && !s.pastStory && !s.staticMode);
  const go = (i: number) => {
    const y = chapterOffsets.current[i];
    if (y == null) return;
    // land a little into the chapter so its text is already showing
    const len = (chapterOffsets.current[i + 1] ?? y + window.innerHeight) - y;
    scrollToTarget(y + (i === 0 ? 0 : len * 0.22));
  };
  return (
    <nav className={`rail${visible ? " is-visible" : ""}`} aria-label="Story chapters" aria-hidden={!visible}>
      <ol>
        {chapters.map((c, i) => (
          <li key={c.id} className={i === index ? "is-active" : i < index ? "is-past" : ""}>
            <button type="button" onClick={() => go(i)} tabIndex={visible ? 0 : -1} aria-current={i === index ? "step" : undefined}>
              <span className="rail__label">{c.rail}</span>
              <span className="rail__dot" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
