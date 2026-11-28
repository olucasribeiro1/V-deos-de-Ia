import React from 'react';
import {HUD_FONT} from '../../lib/fonts';

/**
 * Generic red soda can (no brand), centred at 0,0, height h (svg units).
 * `spin` (degrees) slides the label stripe to fake rotation around its own axis.
 */
export const Can: React.FC<{h: number; spin?: number; id: string}> = ({h, spin = 0, id}) => {
  const w = h * 0.52;
  const top = -h / 2;
  const bot = h / 2;
  const ry = w * 0.16;
  const ph = (((spin % 360) + 360) % 360) / 360;
  const sx = -w / 2 + ph * w * 2 - w * 0.5;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#7d0f14" />
          <stop offset="0.18" stopColor="#d8262c" />
          <stop offset="0.32" stopColor="#ff6b5e" />
          <stop offset="0.42" stopColor="#e3302f" />
          <stop offset="0.85" stopColor="#a5151b" />
          <stop offset="1" stopColor="#5e0a0f" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d9299" />
          <stop offset="0.3" stopColor="#f2f4f7" />
          <stop offset="0.6" stopColor="#b8bcc3" />
          <stop offset="1" stopColor="#6c7178" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={-w / 2} y={top + ry} width={w} height={h - ry * 2} />
        </clipPath>
      </defs>
      {/* bottom rim */}
      <ellipse cx={0} cy={bot - ry} rx={w / 2 - w * 0.04} ry={ry} fill={`url(#${id}-metal)`} />
      <rect x={-w / 2} y={top + ry} width={w} height={h - ry * 2} fill={`url(#${id}-body)`} />
      {/* label wave (moves with spin) */}
      <g clipPath={`url(#${id}-clip)`}>
        {[-2, -1, 0, 1].map((k) => (
          <path
            key={k}
            d={`M${sx + k * w * 2},${h * 0.1} q ${w * 0.5},${-h * 0.16} ${w},0 t ${w},0 l 0,${h * 0.07} q ${-w * 0.5},${h * 0.16} ${-w},0 t ${-w},0 Z`}
            fill="#fff4ea"
            opacity={0.95}
          />
        ))}
        {[-1, 0, 1].map((k) => (
          <circle key={k} cx={sx + w * 0.6 + k * w * 2} cy={-h * 0.14} r={w * 0.16} fill="#ffd6d0" opacity={0.85} />
        ))}
        <rect x={-w / 2} y={top} width={w} height={h} fill={`url(#${id}-body)`} opacity={0.35} style={{mixBlendMode: 'multiply'}} />
        <rect x={-w * 0.27} y={top} width={w * 0.07} height={h} fill="#fff" opacity={0.35} />
      </g>
      {/* shoulders + lid */}
      <path d={`M${-w / 2},${top + ry * 1.2} Q${-w / 2},${top + ry * 0.2} ${-w * 0.4},${top + ry * 0.2} L${w * 0.4},${top + ry * 0.2} Q${w / 2},${top + ry * 0.2} ${w / 2},${top + ry * 1.2} Z`} fill={`url(#${id}-metal)`} />
      <ellipse cx={0} cy={top + ry * 0.2} rx={w * 0.4} ry={ry * 0.9} fill={`url(#${id}-metal)`} stroke="#7d828a" strokeWidth={h * 0.006} />
      <ellipse cx={w * 0.05} cy={top + ry * 0.2} rx={w * 0.12} ry={ry * 0.35} fill="#9aa0a8" />
      <rect x={-w / 2} y={bot - ry * 1.4} width={w} height={ry * 0.5} fill={`url(#${id}-metal)`} opacity={0.9} />
    </g>
  );
};

/** Plastic açaí cup with purple top + granola, centred at 0,0, height h. */
export const AcaiCup: React.FC<{h: number; bite?: number}> = ({h, bite = 0}) => {
  const w = h * 0.8;
  return (
    <g>
      <path d={`M${-w / 2},${-h / 2} L${w / 2},${-h / 2} L${w * 0.36},${h / 2} L${-w * 0.36},${h / 2} Z`} fill="#f4eef6" opacity={0.92} />
      <path d={`M${-w * 0.46},${-h * 0.3} L${w * 0.46},${-h * 0.3} L${w * 0.36},${h / 2} L${-w * 0.36},${h / 2} Z`} fill="#4b1e5a" />
      <path d={`M${-w * 0.2},${-h * 0.3} L${-w * 0.12},${h / 2}`} stroke="#7b3f8c" strokeWidth={h * 0.05} opacity={0.6} />
      <ellipse cx={0} cy={-h / 2} rx={w / 2} ry={h * 0.12} fill="#5a2470" />
      <ellipse cx={0} cy={-h / 2 - h * 0.05} rx={w * 0.42 - bite * w * 0.1} ry={h * 0.12} fill="#6c2d86" />
      {[-0.25, -0.05, 0.15, 0.3, 0.05].map((x, i) => (
        <circle key={i} cx={x * w} cy={-h / 2 - h * 0.08 + (i % 2) * h * 0.04} r={h * 0.045} fill={i % 2 ? '#e6b45a' : '#f2d27a'} />
      ))}
      <rect x={w * 0.05} y={-h * 1.05} width={h * 0.06} height={h * 0.6} rx={h * 0.03} fill="#f7f1e8" transform={`rotate(14 ${w * 0.08} ${-h * 0.5})`} />
    </g>
  );
};

/** Phone held upright, screen calling "MARINHA". Centred at 0,0, height h. `ring` 0..1 pulse phase. */
export const PhoneCall: React.FC<{h: number; ring: number; elapsed: string}> = ({h, ring, elapsed}) => {
  const w = h * 0.49;
  const r = w * 0.14;
  const u = h / 1000;
  return (
    <g>
      <defs>
        <linearGradient id="pc-screen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1b3557" />
          <stop offset="0.6" stopColor="#0f2038" />
          <stop offset="1" stopColor="#0a1424" />
        </linearGradient>
      </defs>
      <rect x={-w / 2 - 14 * u} y={-h / 2 - 14 * u} width={w + 28 * u} height={h + 28 * u} rx={r + 10 * u} fill="#15161b" />
      <rect x={-w / 2 - 14 * u} y={-h / 2 - 14 * u} width={w + 28 * u} height={h + 28 * u} rx={r + 10 * u} fill="none" stroke="#5c6070" strokeWidth={5 * u} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill="url(#pc-screen)" />
      <rect x={-w * 0.12} y={-h / 2 + 18 * u} width={w * 0.24} height={26 * u} rx={13 * u} fill="#050608" />
      {/* avatar with anchor */}
      {[0, 1, 2].map((i) => {
        const k = (ring + i / 3) % 1;
        return <circle key={i} cx={0} cy={-h * 0.2} r={w * (0.2 + k * 0.32)} fill="none" stroke="#7fd0ff" strokeWidth={6 * u} opacity={(1 - k) * 0.6} />;
      })}
      <circle cx={0} cy={-h * 0.2} r={w * 0.2} fill="#2f6fa8" />
      <g transform={`translate(0,${-h * 0.2}) scale(${u * 1.1})`} stroke="#f2f7ff" strokeWidth={12} fill="none" strokeLinecap="round">
        <circle cx={0} cy={-46} r={14} />
        <line x1={0} y1={-32} x2={0} y2={52} />
        <line x1={-30} y1={-12} x2={30} y2={-12} />
        <path d="M -52,18 Q -46,58 0,58 Q 46,58 52,18" />
      </g>
      <text x={0} y={h * 0.02} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={h * 0.085} fill="#ffffff" letterSpacing={h * 0.004}>
        MARINHA
      </text>
      <text x={0} y={h * 0.075} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={400} fontSize={h * 0.034} fill="#9fc6e8" letterSpacing={h * 0.002}>
        chamando… {elapsed}
      </text>
      {/* buttons */}
      <circle cx={-w * 0.24} cy={h * 0.34} r={w * 0.11} fill="#e2423a" />
      <path d={`M${-w * 0.24 - w * 0.06},${h * 0.345} q ${w * 0.06},${-w * 0.05} ${w * 0.12},0`} stroke="#fff" strokeWidth={8 * u} fill="none" strokeLinecap="round" />
      <circle cx={w * 0.24} cy={h * 0.34} r={w * 0.11 * (1 + 0.08 * Math.sin(ring * Math.PI * 2))} fill="#34c46a" />
      <path d={`M${w * 0.24 - w * 0.06},${h * 0.34} q ${w * 0.06},${-w * 0.05} ${w * 0.12},0`} stroke="#fff" strokeWidth={8 * u} fill="none" strokeLinecap="round" />
      {/* glass sheen */}
      <path d={`M${-w / 2},${-h * 0.1} L${w / 2},${-h * 0.42} L${w / 2},${-h * 0.32} L${-w / 2},${h * 0.0} Z`} fill="#fff" opacity={0.05} />
    </g>
  );
};
