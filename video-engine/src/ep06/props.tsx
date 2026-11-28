import React from 'react';
import {random} from 'remotion';
import {clamp, lerp} from '../lib/anim';

/** Ripeness colours 1 (green) → 7 (yellow, lots of brown spots) — the industry colour chart. */
const RIPE: [string, string, string][] = [
  ['#3f8f34', '#2a6a22', '#6cbf55'],
  ['#7fb53a', '#5a8a24', '#a8d660'],
  ['#c2cf3a', '#8f9a22', '#e2ea6a'],
  ['#f0d23a', '#bf9c1c', '#fff07a'],
  ['#f6d22e', '#c79a14', '#fff27a'],
  ['#f4c826', '#c08e10', '#ffe56a'],
  ['#e9b828', '#b0800e', '#ffd86a'],
];
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(',')})`;
};
export const ripeTone = (r: number) => {
  const x = clamp(r, 1, 7) - 1;
  const i = Math.min(5, Math.floor(x));
  const t = x - i;
  return RIPE[i].map((c, k) => mix(c, RIPE[i + 1][k], t)) as [string, string, string];
};

const BODY = 'M -108,-22 C -80,58 74,62 112,-26 L 122,-40 L 116,-48 C 74,4 -62,12 -100,-34 Z';

/**
 * Banana centred at (x, y), ~240 px long at s=1. `ripe` 1..7 (spots appear from 5),
 * `glow` 0..1 = Mateus' power (yellow aura + energy streaks), `rot` degrees.
 */
export const Banana: React.FC<{x: number; y: number; s?: number; rot?: number; ripe?: number; glow?: number; t?: number; seed?: string; squash?: number}> = ({
  x,
  y,
  s = 1,
  rot = 0,
  ripe = 4,
  glow = 0,
  t = 0,
  seed = 'bn',
  squash = 0,
}) => {
  const [base, shade, light] = ripeTone(ripe);
  const spots = ripe > 4.6 ? Math.round((ripe - 4.6) * 9) : 0;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s * (1 + squash * 0.25)},${s * (1 - squash * 0.3)})`}>
      {glow > 0.01 && (
        <g opacity={glow}>
          <ellipse rx={170} ry={95} fill="#ffe14a" opacity={0.22} style={{filter: 'blur(18px)'}} />
          {Array.from({length: 8}).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + t * 3;
            const r0 = 120 + 10 * Math.sin(t * 9 + i);
            return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0 * 0.6} x2={Math.cos(a) * (r0 + 40)} y2={Math.sin(a) * (r0 + 40) * 0.6} stroke="#ffe14a" strokeWidth={8} strokeLinecap="round" />;
          })}
        </g>
      )}
      <path d={BODY} fill={base} stroke="#3a2a0a" strokeWidth={5} strokeLinejoin="round" />
      <path d="M -100,-30 C -60,8 70,2 114,-44 C 70,20 -60,26 -100,-30 Z" fill={shade} opacity={0.55} />
      <path d="M -86,-4 C -40,40 50,40 92,-12" stroke={light} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
      <path d="M -70,20 C -20,46 40,44 80,16" stroke={shade} strokeWidth={4} fill="none" opacity={0.5} />
      {Array.from({length: spots}).map((_, i) => {
        const q = (k: string) => random(`${seed}${i}${k}`);
        const u = -0.8 + q('u') * 1.6;
        const px = u * 95;
        const py = 18 * (1 - u * u) + (q('v') - 0.5) * 30;
        return <ellipse key={i} cx={px} cy={py} rx={4 + q('r') * 6} ry={3 + q('r') * 4} fill="#5a3a12" opacity={0.85} />;
      })}
      {/* stem + tip */}
      <path d="M 112,-36 L 140,-62 L 150,-54 L 122,-28 Z" fill={ripe < 3 ? '#3a6a22' : '#7a5a24'} stroke="#3a2a0a" strokeWidth={4} />
      <ellipse cx={-106} cy={-28} rx={8} ry={6} fill="#3a2a12" />
    </g>
  );
};

/** Banana peel lying on the floor (4 floppy petals). Centre (x,y), `s` scale, `rot`. */
export const Peel: React.FC<{x: number; y: number; s?: number; rot?: number; ripe?: number; flat?: number}> = ({x, y, s = 1, rot = 0, ripe = 5, flat = 0.55}) => {
  const [base, shade] = ripeTone(ripe);
  const petals = [-150, -100, -40, 20];
  return (
    <g transform={`translate(${x},${y}) scale(${s},${s * flat}) rotate(${rot})`}>
      <ellipse cx={0} cy={18} rx={110} ry={40} fill="#000" opacity={0.18} />
      {petals.map((a, i) => (
        <g key={i} transform={`rotate(${a + 60})`}>
          <path d="M 0,0 C 30,-14 80,-12 104,6 C 80,22 30,20 0,10 Z" fill={i % 2 ? base : shade} stroke="#3a2a0a" strokeWidth={4} />
          <path d="M 10,4 C 40,-2 70,0 96,6" stroke="#fff6c4" strokeWidth={5} fill="none" opacity={0.6} />
        </g>
      ))}
      <path d="M -10,-6 L 6,-40 L 16,-36 L 4,-2 Z" fill="#7a5a24" stroke="#3a2a0a" strokeWidth={3} />
    </g>
  );
};

/** Fireball (flickering) centred at x,y, radius r. */
export const FireBall: React.FC<{x: number; y: number; r: number; t: number; k?: number}> = ({x, y, r, t, k = 1}) => {
  if (k <= 0.01) return null;
  const rr = r * k;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={rr * 1.9} fill="#ff6a1a" opacity={0.18} style={{filter: 'blur(20px)'}} />
      {Array.from({length: 10}).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const fl = 1 + 0.25 * Math.sin(t * 22 + i * 1.7);
        return <ellipse key={i} cx={Math.cos(a) * rr * 0.5} cy={Math.sin(a) * rr * 0.5 - rr * 0.2} rx={rr * 0.45} ry={rr * 0.75 * fl} fill="#ff7a1a" opacity={0.75} transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * rr * 0.5} ${Math.sin(a) * rr * 0.5})`} />;
      })}
      <circle r={rr} fill="#ff9a2a" />
      <circle r={rr * 0.72} fill="#ffd04a" />
      <circle r={rr * 0.42} fill="#fff6c8" />
    </g>
  );
};

/** Flame jet from (x0,y0) toward angle `ang` (deg, 0 = right), length L. */
export const FlameJet: React.FC<{x0: number; y0: number; ang: number; L: number; t: number; w?: number}> = ({x0, y0, ang, L, t, w = 90}) => (
  <g transform={`translate(${x0},${y0}) rotate(${ang})`}>
    <path d={`M 0,${-w * 0.2} Q ${L * 0.5},${-w * (0.9 + 0.2 * Math.sin(t * 30))} ${L},0 Q ${L * 0.5},${w * (0.9 + 0.2 * Math.cos(t * 27))} 0,${w * 0.2} Z`} fill="#ff6a1a" opacity={0.85} style={{filter: 'drop-shadow(0 0 30px #ff6a1a)'}} />
    <path d={`M 0,${-w * 0.12} Q ${L * 0.45},${-w * 0.45} ${L * 0.85},0 Q ${L * 0.45},${w * 0.45} 0,${w * 0.12} Z`} fill="#ffd04a" />
    <path d={`M 0,-6 Q ${L * 0.35},${-w * 0.18} ${L * 0.6},0 Q ${L * 0.35},${w * 0.18} 0,6 Z`} fill="#fff6c8" />
  </g>
);

/** Splat of banana purée (radial blobs) — `age` frames since impact. */
export const Puree: React.FC<{x: number; y: number; age: number; n?: number; power?: number; seed?: string}> = ({x, y, age, n = 26, power = 1, seed = 'pu'}) => {
  if (age < 0) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const q = (k: string) => random(`${seed}${i}${k}`);
        const a = q('a') * Math.PI * 2;
        const v = (18 + q('v') * 34) * power;
        const d = v * Math.pow(age, 0.8);
        const px = x + Math.cos(a) * d;
        const py = y + Math.sin(a) * d * 0.8 + age * age * 0.25;
        const r = (16 + q('r') * 30) * power * clamp(1.4 - age / 40, 0.4, 1.4);
        return <ellipse key={i} cx={px} cy={py} rx={r} ry={r * 0.8} fill={i % 3 ? '#f6e08a' : '#fff2b8'} stroke="#d8b24a" strokeWidth={3} />;
      })}
    </g>
  );
};

/** Purée stains stuck on someone (blobs around a point). */
export const Gunk: React.FC<{x: number; y: number; s?: number; seed?: string; n?: number}> = ({x, y, s = 1, seed = 'gk', n = 9}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {Array.from({length: n}).map((_, i) => {
      const q = (k: string) => random(`${seed}${i}${k}`);
      return <ellipse key={i} cx={(q('x') - 0.5) * 220} cy={(q('y') - 0.5) * 420} rx={20 + q('r') * 30} ry={16 + q('r') * 22} fill="#f6e08a" stroke="#d8b24a" strokeWidth={3} />;
    })}
  </g>
);

/** Red TNT stick bundle (centre x,y). */
export const TNT: React.FC<{x: number; y: number; s?: number; rot?: number; spark?: number; t?: number}> = ({x, y, s = 1, rot = 0, spark = 0, t = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    {[-46, 0, 46].map((dx) => (
      <g key={dx}>
        <rect x={dx - 24} y={-110} width={48} height={220} rx={10} fill="#d6342c" stroke="#5a1210" strokeWidth={5} />
        <rect x={dx - 18} y={-104} width={12} height={208} rx={5} fill="#ff6a5a" opacity={0.6} />
      </g>
    ))}
    <rect x={-80} y={-30} width={160} height={50} fill="#2a2a2a" />
    <text x={0} y={8} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill="#fff">TNT</text>
    <path d="M 0,-110 q 20,-40 40,-50" stroke="#3a2a22" strokeWidth={6} fill="none" />
    {spark > 0 && (
      <g transform="translate(40,-160)">
        {Array.from({length: 7}).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 + t * 10;
          return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 26} y2={Math.sin(a) * 26} stroke="#ffd04a" strokeWidth={5} strokeLinecap="round" opacity={spark} />;
        })}
        <circle r={10} fill="#fff6c8" opacity={spark} />
      </g>
    )}
  </g>
);

/** Little cartoon fly. */
export const Fly: React.FC<{x: number; y: number; t: number; s?: number; dead?: boolean}> = ({x, y, t, s = 1, dead}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${dead ? 180 : 0})`}>
    {!dead &&
      [-1, 1].map((d) => (
        <ellipse key={d} cx={d * 14} cy={-16} rx={16} ry={9 + 5 * Math.sin(t * 60)} fill="#dff4ff" stroke="#6a8aa0" strokeWidth={2} opacity={0.8} transform={`rotate(${d * 30} ${d * 14} -16)`} />
      ))}
    <ellipse rx={16} ry={12} fill="#2a2d38" />
    <circle cx={12} cy={-4} r={8} fill="#c8352a" />
    {dead && (
      <g stroke="#2a2d38" strokeWidth={3}>
        <path d="M -6,-6 l 6,6 M 0,-6 l -6,6" />
      </g>
    )}
  </g>
);

/** Radiation trefoil (☢) centred at x,y radius r. */
export const Trefoil: React.FC<{x: number; y: number; r: number; color?: string; bg?: string; spin?: number}> = ({x, y, r, color = '#141414', bg = '#ffd23a', spin = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${spin})`}>
    <circle r={r} fill={bg} stroke={color} strokeWidth={r * 0.08} />
    {[0, 120, 240].map((a) => (
      <path key={a} transform={`rotate(${a})`} d={`M ${r * 0.2},${-r * 0.1} L ${r * 0.8 * Math.cos(-1.05)},${r * 0.8 * Math.sin(-1.05)} A ${r * 0.8},${r * 0.8} 0 0 0 ${r * 0.8 * Math.cos(-2.1)},${r * 0.8 * Math.sin(-2.1)} L ${-r * 0.2},${-r * 0.1} Z`} fill={color} />
    ))}
    <circle r={r * 0.15} fill={color} />
  </g>
);

/** Trophy shaped like a banana on a base. */
export const BananaTrophy: React.FC<{x: number; y: number; s?: number; t?: number}> = ({x, y, s = 1, t = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-70} y={40} width={140} height={60} rx={8} fill="#5a3a24" />
    <rect x={-40} y={-10} width={80} height={56} fill="#e8b84a" stroke="#a87a1c" strokeWidth={5} />
    <g transform="rotate(-70)">
      <Banana x={80} y={0} s={0.85} ripe={4} glow={0.6} t={t} />
    </g>
    <text x={0} y={84} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={28} fill="#ffe08f">CAMPEÃO</text>
  </g>
);
