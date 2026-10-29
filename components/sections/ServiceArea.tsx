import { config, serviceArea as A } from "@/content/site";
import SectionHead from "./SectionHead";

/** Stylized dot map (not a real map embed): towns projected from lat/lng onto an SVG. */
export default function ServiceArea() {
  const pts = config.serviceArea;
  const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const W = 560, H = 420, pad = 70;
  const k = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const sx = (W - pad * 2) / ((maxLng - minLng) * k), sy = (H - pad * 2) / (maxLat - minLat);
  const s = Math.min(sx, sy);
  const ox = (W - (maxLng - minLng) * k * s) / 2, oy = (H - (maxLat - minLat) * s) / 2;
  const proj = (p: { lat: number; lng: number }) => [ox + (p.lng - minLng) * k * s, oy + (maxLat - p.lat) * s];
  const hq = pts.find((p) => "hq" in p && p.hq) ?? pts[0];
  const [hx, hy] = proj(hq);

  return (
    <section id="service-area" className="section area" aria-labelledby="area-h">
      <div className="area__grid">
        <div>
          <SectionHead eyebrow={A.eyebrow} heading={A.heading} id="area-h" />
          <p className="body">{A.body}</p>
          <ul className="area__towns">
            {pts.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </div>
        <figure className="area__map card">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={A.mapLabel}>
            <defs>
              <radialGradient id="area-glow">
                <stop offset="0" stopColor="var(--ember)" stopOpacity=".35" />
                <stop offset="1" stopColor="var(--ember)" stopOpacity="0" />
              </radialGradient>
              <pattern id="area-dots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="7" cy="7" r="1" fill="var(--cream)" opacity=".09" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#area-dots)" />
            <circle cx={hx} cy={hy} r="190" fill="url(#area-glow)" />
            {[70, 130, 190].map((r) => (
              <circle key={r} cx={hx} cy={hy} r={r} fill="none" stroke="var(--line)" strokeDasharray="2 6" />
            ))}
            {pts.map((p) => {
              const [x, y] = proj(p);
              return <line key={`l-${p.name}`} x1={hx} y1={hy} x2={x} y2={y} stroke="var(--ember)" strokeOpacity=".25" />;
            })}
            {pts.map((p) => {
              const [x, y] = proj(p);
              const isHq = p === hq;
              const right = x < W * 0.7;
              return (
                <g key={p.name} className={`area__pt${isHq ? " is-hq" : ""}`}>
                  {isHq && <circle cx={x} cy={y} r="14" className="area__pulse" />}
                  <circle cx={x} cy={y} r={isHq ? 7 : 4.5} />
                  <text x={x + (right ? 12 : -12)} y={y + 4} textAnchor={right ? "start" : "end"}>
                    {p.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>
      </div>
    </section>
  );
}
