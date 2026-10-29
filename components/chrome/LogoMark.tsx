/** Original mark: a six-armed snowflake whose bottom arm becomes a flame. */
export default function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const arms = [-90, -30, 30, 150, 210]; // the 90° (bottom) arm is the flame
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none">
        {arms.map((a) => (
          <g key={a} transform={`rotate(${a} 24 22)`}>
            <line x1="24" y1="22" x2="39" y2="22" />
            <polyline points="31.5,17.5 34.5,22 31.5,26.5" />
          </g>
        ))}
      </g>
      <circle cx="24" cy="22" r="2.6" fill="currentColor" />
      <path
        d="M24 27.5c1.6 3 6.4 6.6 6.4 11.4a6.4 6.4 0 0 1-12.8 0c0-2.7 1.5-4.4 2.9-6 .2 1.6 1 2.8 2.1 3.3-.3-3 .4-6.1 1.4-8.7z"
        fill="var(--ember)"
      />
      <path d="M24 37.2c.9 1 1.9 1.9 1.9 3.1a1.9 1.9 0 0 1-3.8 0c0-1.2 1-2.1 1.9-3.1z" fill="var(--ember-hi)" />
    </svg>
  );
}
