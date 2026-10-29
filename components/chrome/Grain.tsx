/** Fixed film-grain overlay (SVG turbulence), opacity .06. */
export default function Grain() {
  return (
    <div className="grain" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain-f">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-f)" />
      </svg>
    </div>
  );
}
