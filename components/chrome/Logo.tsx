import { config } from "@/content/site";
import LogoMark from "./LogoMark";

export default function Logo({ href = "#top" }: { href?: string }) {
  return (
    <a href={href} className="logo" aria-label={`${config.businessName}, back to top`}>
      <LogoMark size={34} className="logo__mark" />
      <span className="logo__word">
        <span className="logo__name">{config.shortName}</span>
        <span className="logo__sub">{config.wordmarkSub}</span>
      </span>
    </a>
  );
}
