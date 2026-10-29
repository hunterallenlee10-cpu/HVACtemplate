import Pic from "../Pic";

/** Keyframe still for the reduced-motion / no-JS story layout. */
export default function Still({ base, alt }: { base: string; alt: string }) {
  return <Pic base={base} alt={alt} className="chapter__still" />;
}
