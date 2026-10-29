/**
 * Renders a heading as masked words so lines can reveal one by one.
 * The text stays real, selectable HTML (words separated by normal spaces).
 */
import { createElement, Fragment, type JSX } from "react";

type Props = {
  as?: keyof JSX.IntrinsicElements;
  text: string;
  accent?: string;
  className?: string;
  id?: string;
};

export default function SplitHeading({ as = "h2", text, accent, className, id }: Props) {
  const words = text.split(" ");
  let accentUsed = false;
  return createElement(
    as,
    { className: `split ${className ?? ""}`, id },
    words.map((w, i) => {
      const isAccent = !accentUsed && accent && w.replace(/[.,!?]$/, "") === accent.replace(/[.,!?]$/, "");
      if (isAccent) accentUsed = true;
      return (
        <Fragment key={i}>
          <span className="w">
            <span className={`wi${isAccent ? " accent" : ""}`}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      );
    })
  );
}
