/**
 * Decorative, always-animating split-AC illustration for hero backgrounds.
 * Pure CSS keyframes (no JS) — the swing flap hinges open/closed like a real
 * AC's discharge louvre, and layered cool-air streams flow and fade beneath.
 */
export function AcUnit({ className }: { className?: string }) {
  const streamPaths = [
    { d: "M 150 156 C 128 200, 150 230, 118 270", width: 6, delay: 0 },
    { d: "M 195 156 C 195 205, 195 235, 195 278", width: 7, delay: 0.45 },
    { d: "M 240 156 C 262 200, 240 230, 272 270", width: 6, delay: 0.9 },
    { d: "M 170 158 C 155 195, 175 220, 150 255", width: 4, delay: 1.3 },
    { d: "M 222 158 C 238 195, 218 220, 244 255", width: 4, delay: 1.7 },
  ];
  const flakes = [
    { cx: 130, cy: 210, r: 3, delay: 0.2 },
    { cx: 262, cy: 230, r: 2.5, delay: 1.1 },
    { cx: 195, cy: 250, r: 3, delay: 1.9 },
  ];

  return (
    <svg viewBox="0 0 420 300" aria-hidden className={className}>
      <defs>
        <linearGradient id="ac-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-300)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-brand-800)" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="ac-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-300)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="ac-mist" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="var(--color-brand-300)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-brand-300)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ac-stream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-300)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--color-brand-300)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Cool-air mist cloud beneath the vent, breathing in and out */}
      <ellipse
        cx="195"
        cy="150"
        rx="150"
        ry="90"
        fill="url(#ac-mist)"
        className="animate-breeze"
        style={{ animationDuration: "3.6s" }}
      />

      <g className="animate-hover-unit">
        {/* Body shell */}
        <rect
          x="26"
          y="18"
          width="368"
          height="98"
          rx="22"
          fill="url(#ac-body)"
          stroke="var(--color-brand-400)"
          strokeOpacity="0.32"
          strokeWidth="2"
        />
        {/* Glossy top highlight */}
        <rect x="42" y="26" width="336" height="4" rx="2" fill="white" opacity="0.35" />
        {/* Status LED */}
        <circle cx="362" cy="42" r="4.5" fill="#2dd4bf" fillOpacity="0.7" />
        {/* Intake grille */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={110 + i * 32}
            y1="52"
            x2={110 + i * 32}
            y2="82"
            stroke="var(--color-brand-400)"
            strokeOpacity="0.22"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        {/* Face seam above the vent housing */}
        <line
          x1="48"
          y1="98"
          x2="372"
          y2="98"
          stroke="var(--color-brand-400)"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        {/* Vent housing */}
        <rect x="66" y="104" width="288" height="14" rx="7" fill="var(--color-brand-500)" fillOpacity="0.18" />

        {/* Single wide swing flap, hinged at the top — opens/closes like a real discharge louvre */}
        <rect
          x="74"
          y="120"
          width="272"
          height="12"
          rx="6"
          fill="url(#ac-flap)"
          className="animate-swing"
          style={{ transformBox: "fill-box", transformOrigin: "top center" }}
        />
      </g>

      {/* Layered breeze streams — continuous, staggered downward cool-air flow */}
      {streamPaths.map((s) => (
        <path
          key={s.d}
          d={s.d}
          stroke="url(#ac-stream)"
          strokeWidth={s.width}
          strokeLinecap="round"
          fill="none"
          className="animate-breeze"
          style={{ animationDelay: `${s.delay}s`, animationDuration: "3s" }}
        />
      ))}

      {/* Drifting chill particles, echoing the brand's snowflake mark */}
      {flakes.map((f) => (
        <circle
          key={`${f.cx}-${f.cy}`}
          cx={f.cx}
          cy={f.cy}
          r={f.r}
          fill="var(--color-brand-300)"
          className="animate-breeze"
          style={{ animationDelay: `${f.delay}s`, animationDuration: "3.4s" }}
        />
      ))}
    </svg>
  );
}
