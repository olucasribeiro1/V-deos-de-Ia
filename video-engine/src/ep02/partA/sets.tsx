import React from 'react';
import {random} from 'remotion';
import {H, W} from '../../lib/constants';
import {useUid} from '../../lib/useUid';
import {PhotoThumb} from './kit';

/* ------------------------------------------------------------------ iron tower (generic) */

const towerHW = (y: number) => {
  if (y < 0.08) return 0.014 * (y / 0.08);
  if (y < 0.3) return 0.014 + (0.035 - 0.014) * ((y - 0.08) / 0.22);
  if (y < 0.6) return 0.035 + (0.08 - 0.035) * ((y - 0.3) / 0.3);
  return 0.08 + (0.31 - 0.08) * Math.pow((y - 0.6) / 0.4, 1.6);
};

/** Generic wrought-iron lattice tower. Base centre at (x, y), height h px. */
export const IronTower: React.FC<{x: number; y: number; h: number; color?: string; lit?: string; lights?: number}> = ({x, y, h, color = '#5b4636', lit = '#c99a6a', lights = 0}) => {
  const id = useUid('tw');
  const N = 60;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= N; i++) {
    const yy = i / N;
    left.push(`${-towerHW(yy)},${yy}`);
    right.push(`${towerHW(yy)},${yy}`);
  }
  const outline = `M${left.join(' L')} L-0.19,1 C-0.15,0.9 -0.08,0.84 0,0.84 C0.08,0.84 0.15,0.9 0.19,1 L${right.reverse().join(' L')} Z`;
  const lattice: React.ReactNode[] = [];
  for (let yy = 0.1; yy < 1; yy += 0.035) {
    const y2 = yy + 0.035;
    lattice.push(<line key={`a${yy}`} x1={-towerHW(yy)} y1={yy} x2={towerHW(y2)} y2={y2} />);
    lattice.push(<line key={`b${yy}`} x1={towerHW(yy)} y1={yy} x2={-towerHW(y2)} y2={y2} />);
    lattice.push(<line key={`c${yy}`} x1={-towerHW(yy)} y1={yy} x2={towerHW(yy)} y2={yy} />);
  }
  return (
    <g transform={`translate(${x},${y - h}) scale(${h})`}>
      <defs>
        <clipPath id={id}>
          <path d={outline} />
        </clipPath>
        <linearGradient id={id + 'g'} x1="0" x2="1">
          <stop offset="0" stopColor={lit} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <path d={outline} fill={`url(#${id}g)`} opacity={0.35} />
      <g clipPath={`url(#${id})`} stroke={color} strokeWidth={0.006} fill="none">
        {lattice}
      </g>
      <path d={outline} fill="none" stroke={color} strokeWidth={0.008} />
      {/* legs edges */}
      <path d={`M${-towerHW(0.6)},0.6 C-0.12,0.75 -0.2,0.88 -0.31,1 M${towerHW(0.6)},0.6 C0.12,0.75 0.2,0.88 0.31,1`} stroke={color} strokeWidth={0.02} fill="none" />
      <path d="M-0.19,1 C-0.15,0.9 -0.08,0.84 0,0.84 C0.08,0.84 0.15,0.9 0.19,1" stroke={color} strokeWidth={0.014} fill="none" />
      {/* platforms */}
      <rect x={-0.05} y={0.295} width={0.1} height={0.014} fill={color} />
      <rect x={-0.115} y={0.59} width={0.23} height={0.022} fill={color} />
      <rect x={-0.165} y={0.755} width={0.33} height={0.026} fill={color} />
      <rect x={-0.004} y={-0.04} width={0.008} height={0.05} fill={color} />
      {lights > 0 &&
        Array.from({length: 40}).map((_, i) => {
          const yy = 0.05 + random(`twl-${i}`) * 0.9;
          const xx = (random(`twx-${i}`) * 2 - 1) * towerHW(yy) * 0.9;
          return <circle key={i} cx={xx} cy={yy} r={0.006} fill="#fff4c8" opacity={lights * (0.4 + 0.6 * random(`two-${i}`))} />;
        })}
    </g>
  );
};

/** Cream façades with grey mansard roofs (generic Parisian block), baseline at y. */
export const ParisBlock: React.FC<{y: number; seed?: string; tone?: number; offset?: number}> = ({y, seed = 'pb', tone = 0, offset = 0}) => (
  <g>
    {Array.from({length: 9}).map((_, i) => {
      const r = (k: string) => random(`${seed}-${i}-${k}`);
      const w = 150 + r('w') * 90;
      const x = i * 150 - 140 + offset;
      const h = 220 + r('h') * 120;
      const fac = tone ? '#d9c3a4' : '#ecd9bb';
      return (
        <g key={i}>
          <rect x={x} y={y - h} width={w} height={h} fill={fac} stroke="#bba383" strokeWidth={3} />
          <path d={`M${x - 6},${y - h} L${x + 18},${y - h - 60} L${x + w - 18},${y - h - 60} L${x + w + 6},${y - h} Z`} fill="#7b8696" />
          {Array.from({length: 3}).map((__, j) => (
            <rect key={j} x={x + 22 + j * ((w - 50) / 3)} y={y - h - 44} width={16} height={26} rx={6} fill="#c9d3e0" />
          ))}
          {Array.from({length: 3}).map((__, row) =>
            Array.from({length: 3}).map((___, j) => (
              <g key={`${row}-${j}`}>
                <rect x={x + 18 + j * ((w - 36) / 3)} y={y - h + 26 + row * 72} width={(w - 36) / 3 - 16} height={46} fill="#6d7f99" />
                <rect x={x + 14 + j * ((w - 36) / 3)} y={y - h + 70 + row * 72} width={(w - 36) / 3 - 8} height={6} fill="#3e3a3a" />
              </g>
            )),
          )}
        </g>
      );
    })}
  </g>
);

/** Round bistro table top with coffee + croissant (screen px, centre x,y; scale s). */
export const BistroTable: React.FC<{x: number; y: number; s?: number; steam?: number}> = ({x, y, s = 1, steam = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-14} y={0} width={28} height={420} fill="#2a2420" />
    <ellipse cx={0} cy={0} rx={300} ry={70} fill="#f2ede4" />
    <ellipse cx={0} cy={10} rx={300} ry={70} fill="none" stroke="#c9bfae" strokeWidth={10} />
    {/* cup + saucer */}
    <ellipse cx={-90} cy={-6} rx={90} ry={22} fill="#fff" stroke="#d6d0c4" strokeWidth={4} />
    <path d="M-140,-74 L-40,-74 Q-44,-14 -90,-10 Q-136,-14 -140,-74 Z" fill="#fff" stroke="#d6d0c4" strokeWidth={4} />
    <ellipse cx={-90} cy={-74} rx={50} ry={12} fill="#5a3420" />
    <path d="M-40,-62 q36,4 22,30 q-8,12 -26,6" stroke="#fff" strokeWidth={10} fill="none" />
    {[0, 1].map((i) => (
      <path key={i} d={`M${-100 + i * 22},-90 q-18,-40 6,-70 q18,-28 0,-60`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.45 * steam} transform={`translate(0,${-(steam * 20) % 20})`} />
    ))}
    {/* croissant */}
    <g transform="translate(110,-26) rotate(-8)">
      <ellipse cx={0} cy={18} rx={110} ry={14} fill="#000" opacity={0.12} />
      <path d="M-100,10 Q-80,-50 0,-56 Q80,-50 100,10 Q60,-6 0,-8 Q-60,-6 -100,10 Z" fill="#d98a2b" />
      {[-60, -25, 10, 45].map((cx, i) => (
        <path key={i} d={`M${cx},-50 Q${cx + 14},-26 ${cx + 6},-6`} stroke="#9a5514" strokeWidth={6} fill="none" opacity={0.7} />
      ))}
      <path d="M-70,-30 Q-20,-52 40,-44" stroke="#ffd18a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  </g>
);

/** Ramen bowl (puppet units, centred). */
export const RamenBowl: React.FC<{t: number}> = ({t}) => (
  <g>
    <path d="M-150,-10 Q-140,110 0,120 Q140,110 150,-10 Z" fill="#c8302c" />
    <path d="M-150,-10 Q-140,110 0,120 Q140,110 150,-10" fill="none" stroke="#7a1512" strokeWidth={6} />
    <path d="M-120,30 Q0,60 120,30" stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} strokeDasharray="14 12" />
    <ellipse cx={0} cy={-10} rx={150} ry={34} fill="#e8b46a" />
    <ellipse cx={0} cy={-10} rx={150} ry={34} fill="none" stroke="#7a1512" strokeWidth={6} />
    {/* noodles + toppings */}
    {Array.from({length: 7}).map((_, i) => (
      <path key={i} d={`M${-110 + i * 30},-6 q14,-18 26,0 q14,18 26,0`} stroke="#ffe6a0" strokeWidth={5} fill="none" />
    ))}
    <ellipse cx={-60} cy={-18} rx={30} ry={14} fill="#fff" />
    <ellipse cx={-60} cy={-18} rx={13} ry={7} fill="#ff9d1f" />
    <path d="M30,-34 L80,-30 L76,-6 L26,-10 Z" fill="#2c4a2a" />
    <ellipse cx={100} cy={-14} rx={22} ry={10} fill="#f4d6c9" />
    {/* chopsticks */}
    <line x1={20} y1={-30} x2={190} y2={-230} stroke="#e8c9a0" strokeWidth={9} strokeLinecap="round" />
    <line x1={40} y1={-24} x2={220} y2={-210} stroke="#d9b98a" strokeWidth={9} strokeLinecap="round" />
    {/* steam */}
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.8 + i / 3) % 1;
      return <path key={i} d={`M${-70 + i * 60},${-40 - ph * 120} q-20,-40 0,-80 q20,-40 0,-80`} stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={(1 - ph) * 0.4} />;
    })}
  </g>
);

/** Pizza slice (local units, tip at 0,0 pointing -x). */
export const PizzaSlice: React.FC<{bite?: number}> = ({bite = 0}) => (
  <g>
    <path d="M0,0 L170,-62 Q186,0 170,62 Z" fill="#f2c14e" />
    <path d="M160,-66 Q196,0 160,66 L178,66 Q214,0 178,-66 Z" fill="#c9852f" />
    <path d="M14,-4 L160,-56 Q172,0 160,56 Z" fill="#f6d773" />
    {[[60, -6], [100, 22], [120, -26], [140, 10]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={12} fill="#c4382c" />
    ))}
    <path d="M40,6 q10,30 -4,50" stroke="#f6d773" strokeWidth={8} fill="none" strokeLinecap="round" />
    {bite > 0 && <circle cx={0} cy={0} r={34 * bite} fill="#000" opacity={0} />}
  </g>
);

/** Generic night skyline with lit windows and one stepped spire. Baseline at y. */
export const Skyline: React.FC<{y: number; seed?: string; far?: boolean; t?: number}> = ({y, seed = 'ny', far, t = 0}) => {
  const n = far ? 14 : 10;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const w = far ? 70 + r('w') * 60 : 110 + r('w') * 90;
        const x = (i / n) * (W + 200) - 100 + r('x') * 30;
        const h = far ? 300 + r('h') * 500 : 380 + r('h') * 640;
        const spire = !far && i === 4;
        const body = far ? '#2b3264' : '#161a35';
        return (
          <g key={i}>
            {spire && (
              <>
                <rect x={x + w * 0.2} y={y - h - 120} width={w * 0.6} height={130} fill={body} />
                <rect x={x + w * 0.32} y={y - h - 220} width={w * 0.36} height={110} fill={body} />
                <path d={`M${x + w * 0.42},${y - h - 220} L${x + w * 0.5},${y - h - 420} L${x + w * 0.58},${y - h - 220} Z`} fill={body} />
                <circle cx={x + w * 0.5} cy={y - h - 420} r={6} fill="#ff4b4b" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
              </>
            )}
            <rect x={x} y={y - h} width={w} height={h} fill={body} />
            {!far &&
              Array.from({length: Math.floor(h / 46)}).map((__, row) =>
                Array.from({length: Math.floor(w / 34)}).map((___, col) =>
                  random(`${seed}-${i}-${row}-${col}`) > 0.55 ? (
                    <rect key={`${row}-${col}`} x={x + 12 + col * 34} y={y - h + 20 + row * 46} width={16} height={24} fill="#ffcf73" opacity={0.55 + 0.45 * random(`${seed}-o-${i}-${row}-${col}`)} />
                  ) : null,
                ),
              )}
            {far &&
              Array.from({length: 10}).map((__, j) => (
                <rect key={j} x={x + random(`${seed}-fx-${i}-${j}`) * (w - 10)} y={y - h + random(`${seed}-fy-${i}-${j}`) * h} width={6} height={9} fill="#ffd690" opacity={0.6} />
              ))}
          </g>
        );
      })}
    </g>
  );
};

/** Postcard cliff town over a deep-blue sea (generic Mediterranean). */
export const PostcardTown: React.FC<{t: number}> = ({t}) => {
  const id = useUid('pc');
  const houses: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const r = (k: string) => random(`pch-${i}-${k}`);
    const row = Math.floor(i / 6);
    const x = 560 + (i % 6) * 95 + row * 40 + r('x') * 30 - 40;
    const y = 760 + row * 110 + r('y') * 30;
    const w = 90 + r('w') * 40;
    const h = 70 + r('h') * 40;
    houses.push(
      <g key={i}>
        <rect x={x} y={y - h} width={w} height={h + 200} fill={r('c') > 0.5 ? '#ffffff' : '#f1ece4'} />
        <rect x={x + w * 0.6} y={y - h} width={w * 0.4} height={h + 200} fill="#d9dde6" opacity={0.6} />
        <rect x={x + 16} y={y - h + 24} width={16} height={24} rx={4} fill="#3a7fd6" />
        {r('d') > 0.72 && <path d={`M${x + w * 0.15},${y - h} A${w * 0.35},${w * 0.35} 0 0 1 ${x + w * 0.85},${y - h} Z`} fill="#2a6fd0" />}
        {r('d') > 0.72 && <path d={`M${x + w * 0.2},${y - h - 6} A${w * 0.3},${w * 0.3} 0 0 1 ${x + w * 0.45},${y - h - w * 0.25}`} stroke="#7fb6ff" strokeWidth={6} fill="none" />}
        {r('f') > 0.6 && <circle cx={x + w * 0.2} cy={y - h + 10} r={18} fill="#e8408f" opacity={0.85} />}
      </g>,
    );
  }
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1f6fc7" />
          <stop offset="1" stopColor="#0b3b7d" />
        </linearGradient>
        <linearGradient id={id + 'c'} x1="0" x2="1">
          <stop offset="0" stopColor="#b48a62" />
          <stop offset="1" stopColor="#7a5838" />
        </linearGradient>
      </defs>
      <rect y={620} width={W} height={H - 620} fill={`url(#${id})`} />
      {Array.from({length: 22}).map((_, i) => (
        <rect key={i} x={((random(`pcs-${i}`) * W + t * 30) % (W + 100)) - 100} y={660 + i * 50} width={60 + i * 6} height={4} fill="#9fd0ff" opacity={0.35} />
      ))}
      {/* small island */}
      <path d="M40,640 Q140,560 260,610 Q320,600 380,640 Z" fill="#6b5a6e" opacity={0.7} />
      {/* cliff */}
      <path d="M500,700 Q560,640 700,660 L1120,640 L1120,1920 L420,1920 Q460,1400 430,1100 Q420,900 500,700 Z" fill={`url(#${id}c)`} />
      {houses}
    </svg>
  );
};

/** Turquoise lagoon with overwater bungalows on a pier. */
export const Lagoon: React.FC<{t: number; horizon?: number}> = ({t, horizon = 700}) => {
  const id = useUid('lg');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1d8fb8" />
          <stop offset="0.35" stopColor="#2fc6d0" />
          <stop offset="1" stopColor="#7ff0dd" />
        </linearGradient>
      </defs>
      <rect y={horizon} width={W} height={H - horizon} fill={`url(#${id})`} />
      {Array.from({length: 26}).map((_, i) => {
        const yy = horizon + 10 + Math.pow(i / 26, 1.6) * (H - horizon);
        return <rect key={i} x={((random(`lgw-${i}`) * W + t * 25 * (1 + i / 10)) % (W + 200)) - 200} y={yy} width={80 + i * 10} height={3 + i * 0.4} fill="#e9fffb" opacity={0.35} />;
      })}
      {/* pier + bungalows receding to the right */}
      {Array.from({length: 6}).map((_, i) => {
        const k = 1 - i * 0.14;
        const x = 120 + i * 150 + i * i * 6;
        const y = horizon + 160 * k;
        const s = 0.9 * k;
        return (
          <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
            {[-70, -20, 30, 80].map((px) => (
              <rect key={px} x={px} y={0} width={10} height={90} fill="#6b4a2c" />
            ))}
            <rect x={-90} y={-14} width={190} height={18} fill="#a07448" />
            <rect x={-80} y={-110} width={170} height={100} fill="#e8d2ad" />
            <rect x={-60} y={-86} width={40} height={60} fill="#5a4a3a" />
            <path d="M-110,-100 L5,-190 L120,-100 Z" fill="#c69a55" />
            <path d="M-110,-100 L5,-190 L5,-100 Z" fill="#a8783a" opacity={0.6} />
          </g>
        );
      })}
      <rect x={0} y={horizon + 150} width={W} height={8} fill="#a07448" opacity={0.8} />
    </svg>
  );
};

/** Coconut palm (local units, base 0,0, ~ 600 tall). */
export const Palm: React.FC<{sway?: number; s?: number; x: number; y: number; flip?: boolean}> = ({sway = 0, s = 1, x, y, flip}) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    <path d="M0,0 Q30,-300 110,-560" stroke="#7a5432" strokeWidth={30} fill="none" strokeLinecap="round" />
    {Array.from({length: 10}).map((_, i) => (
      <line key={i} x1={i * 9} y1={-i * 56} x2={i * 9 + 30} y2={-i * 56 - 8} stroke="#5a3c22" strokeWidth={6} />
    ))}
    <g transform={`translate(110,-560) rotate(${sway})`}>
      {[-150, -100, -40, 20, 80, 140, 200].map((a, i) => (
        <path key={i} d={`M0,0 Q${Math.cos((a * Math.PI) / 180) * 160},${Math.sin((a * Math.PI) / 180) * 160 - 60} ${Math.cos((a * Math.PI) / 180) * 300},${Math.sin((a * Math.PI) / 180) * 300 + 40}`} stroke={i % 2 ? '#1f8a4c' : '#2fae5f'} strokeWidth={34} fill="none" strokeLinecap="round" />
      ))}
      <circle cx={-10} cy={20} r={18} fill="#6b4a1e" />
      <circle cx={16} cy={24} r={18} fill="#7a5426" />
    </g>
  </g>
);

/* ------------------------------------------------------------------ mountains */

type Peak = {x: number; h: number; w: number};
/** Snow-capped peak range. Baseline y, shading toward `sun` side. */
export const Range: React.FC<{y: number; peaks: Peak[]; rock: string; snow: string; shade: string; snowLine?: number; haze?: number}> = ({y, peaks, rock, snow, shade, snowLine = 0.45, haze = 0}) => (
  <g>
    {peaks.map((p, i) => {
      const top = y - p.h;
      const L = p.x - p.w;
      const R = p.x + p.w;
      const sl = top + p.h * snowLine;
      const jag = (k: number) => (random(`pk-${i}-${k}`) - 0.5) * p.w * 0.12;
      const capL = p.x - p.w * snowLine;
      const capR = p.x + p.w * snowLine;
      return (
        <g key={i}>
          <path d={`M${L},${y} L${p.x},${top} L${R},${y} Z`} fill={rock} />
          <path d={`M${p.x},${top} L${R},${y} L${p.x + p.w * 0.1},${y} Z`} fill={shade} opacity={0.55} />
          <path d={`M${p.x},${top} L${capR},${sl} L${p.x + p.w * 0.25 + jag(1)},${sl - p.h * 0.06} L${p.x + jag(2)},${sl + p.h * 0.05} L${p.x - p.w * 0.2 + jag(3)},${sl - p.h * 0.07} L${capL},${sl} Z`} fill={snow} />
          <path d={`M${p.x},${top} L${capR},${sl} L${p.x + p.w * 0.25 + jag(1)},${sl - p.h * 0.06} L${p.x + jag(2)},${sl + p.h * 0.05} Z`} fill={shade} opacity={0.35} />
        </g>
      );
    })}
    {haze > 0 && <rect x={0} y={y - 200} width={W} height={200} fill="#dfefff" opacity={haze} />}
  </g>
);

export const HIMALAYA_FAR: Peak[] = [
  {x: 80, h: 520, w: 300},
  {x: 420, h: 760, w: 360},
  {x: 760, h: 600, w: 300},
  {x: 1040, h: 700, w: 320},
];
export const HIMALAYA_MID: Peak[] = [
  {x: 220, h: 480, w: 330},
  {x: 640, h: 560, w: 360},
  {x: 1000, h: 420, w: 280},
];

/** Snowy foreground slope (top edge curve at y). */
export const SnowGround: React.FC<{y: number; tilt?: number}> = ({y, tilt = 0}) => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <path d={`M-100,${y + tilt} Q300,${y - 60} 600,${y + 10} Q850,${y + 60} 1180,${y - tilt} L1180,1960 L-100,1960 Z`} fill="#f4f9ff" />
    <path d={`M-100,${y + tilt + 30} Q300,${y - 30} 600,${y + 40} Q850,${y + 90} 1180,${y - tilt + 30} L1180,1960 L-100,1960 Z`} fill="#dbe9f7" opacity={0.6} />
    {Array.from({length: 18}).map((_, i) => (
      <ellipse key={i} cx={random(`sg-${i}`) * W} cy={y + 120 + random(`sgy-${i}`) * 700} rx={60 + random(`sgr-${i}`) * 120} ry={10} fill="#c7d9ee" opacity={0.5} />
    ))}
  </svg>
);

/** Colourful prayer-flag string between two points (generic). */
export const Flags: React.FC<{x1: number; y1: number; x2: number; y2: number; t: number; sag?: number}> = ({x1, y1, x2, y2, t, sag = 80}) => {
  const cols = ['#3a7bd5', '#f5f5f5', '#e23b3b', '#2fae5f', '#f2c230'];
  const n = 12;
  return (
    <g>
      <path d={`M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + sag * 2} ${x2},${y2}`} stroke="#5a4a3a" strokeWidth={3} fill="none" />
      {Array.from({length: n}).map((_, i) => {
        const u = (i + 0.5) / n;
        const x = (1 - u) * (1 - u) * x1 + 2 * u * (1 - u) * ((x1 + x2) / 2) + u * u * x2;
        const y = (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * ((y1 + y2) / 2 + sag * 2) + u * u * y2;
        const flap = Math.sin(t * 9 + i) * 8;
        return <path key={i} d={`M${x - 18},${y} L${x + 18},${y} L${x + 18 + flap},${y + 46} L${x - 18 + flap},${y + 46} Z`} fill={cols[i % cols.length]} opacity={0.92} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ dark office */

/** Gallery grid (cols × rows of photo thumbs) inside w × h at 0,0. `n` = number of tiles visible. */
export const Gallery: React.FC<{w: number; h: number; cols: number; rows: number; n?: number; gap?: number; seed?: number; scroll?: number}> = ({w, h, cols, rows, n = 9999, gap = 6, seed = 0, scroll = 0}) => {
  const id = useUid('gal');
  const tw = (w - gap * (cols + 1)) / cols;
  const th = tw;
  const out: React.ReactNode[] = [];
  const startRow = Math.floor(scroll / (th + gap));
  for (let r = startRow; r < startRow + rows + 2; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= n || i < 0) continue;
      const y = gap + r * (th + gap) - scroll;
      if (y > h || y + th < 0) continue;
      out.push(
        <g key={i} transform={`translate(${gap + c * (tw + gap)},${y})`}>
          <PhotoThumb w={tw} h={th} i={i + seed} />
        </g>,
      );
    }
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{out}</g>
    </g>
  );
};

/** Dark office: wall, big glowing screen (children = screen content in screen px), desk. */
export const Office: React.FC<{sx: number; sy: number; sw: number; sh: number; glow?: number; children?: React.ReactNode}> = ({sx, sy, sw, sh, glow = 1, children}) => {
  const id = useUid('of');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id={id} cx={(sx + sw / 2) / W} cy={(sy + sh / 2) / H} r={0.7}>
          <stop offset="0" stopColor="#1d3a66" stopOpacity={0.9 * glow} />
          <stop offset="1" stopColor="#05070d" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={id + 'f'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0d1424" />
          <stop offset="1" stopColor="#04060b" />
        </linearGradient>
        <clipPath id={id + 'c'}>
          <rect x={sx} y={sy} width={sw} height={sh} rx={10} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill="#070a12" />
      {/* wall panels */}
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x={i * 140} y={0} width={4} height={H * 0.72} fill="#0f1524" />
      ))}
      <rect width={W} height={H} fill={`url(#${id})`} />
      {/* floor */}
      <rect y={H * 0.72} width={W} height={H * 0.28} fill={`url(#${id}f)`} />
      <path d={`M${sx},${H * 0.72} L${sx - 300},${H} L${sx + sw + 300},${H} L${sx + sw},${H * 0.72} Z`} fill="#4aa8ff" opacity={0.07 * glow} />
      {/* screen */}
      <rect x={sx - 18} y={sy - 18} width={sw + 36} height={sh + 36} rx={18} fill="#0b0d14" stroke="#1e2638" strokeWidth={4} />
      <rect x={sx} y={sy} width={sw} height={sh} rx={10} fill="#0a1a33" />
      <g clipPath={`url(#${id}c)`} opacity={glow}>
        {children}
      </g>
      <rect x={sx} y={sy} width={sw} height={sh} rx={10} fill="none" stroke="#6fc8ff" strokeWidth={3} opacity={0.5 * glow} />
      {/* desk */}
      <path d={`M60,${H * 0.75} L1020,${H * 0.75} L1080,${H * 0.8} L0,${H * 0.8} Z`} fill="#141a28" />
      <rect x={0} y={H * 0.8} width={W} height={30} fill="#0b0f18" />
      <path d={`M60,${H * 0.75} L1020,${H * 0.75}`} stroke="#3c6ea8" strokeWidth={3} opacity={0.5 * glow} />
    </svg>
  );
};

/** Phone-screen UI for the mirrored gallery (inside w × h at 0,0). */
export const PhoneUI: React.FC<{w: number; h: number; n?: number; scroll?: number; mirror?: number; title?: string}> = ({w, h, n, scroll = 0, mirror = 0, title = 'FOTOS'}) => (
  <g>
    <rect width={w} height={h} fill="#0c1020" />
    <text x={w * 0.06} y={h * 0.07} fontFamily="Roboto Condensed" fontWeight={700} fontSize={w * 0.075} fill="#fff">
      {title}
    </text>
    <g transform={`translate(0,${h * 0.1})`}>
      <Gallery w={w} h={h * 0.9} cols={3} rows={5} n={n} scroll={scroll} gap={w * 0.012} />
    </g>
    {mirror > 0 && (
      <g transform={`translate(${w * 0.86},${h * 0.05})`} opacity={mirror}>
        <circle r={w * 0.035} fill="#ff3b3b" />
        <circle r={w * 0.035 + mirror * w * 0.03} fill="none" stroke="#ff3b3b" strokeWidth={3} opacity={0.6} />
      </g>
    )}
  </g>
);

/* ------------------------------------------------------------------ bedroom (copy of EP01 look) */

export const Bedroom: React.FC<{t: number}> = ({t}) => {
  const id = useUid('room');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1b2448" />
          <stop offset="1" stopColor="#0f1430" />
        </linearGradient>
        <linearGradient id={id + 'n'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0d1638" />
          <stop offset="1" stopColor="#3b3a6e" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
      <g transform="translate(600,330)">
        <rect x={-20} y={-20} width={420} height={560} fill="#0e1430" />
        <rect x={0} y={0} width={380} height={520} fill={`url(#${id + 'n'})`} />
        <path d="M0,330 Q90,180 170,250 Q230,150 300,120 L312,100 Q330,90 345,130 L380,190 L380,520 L0,520 Z" fill="#141a33" />
        {Array.from({length: 46}).map((_, i) => (
          <circle key={i} cx={random(`rw-${i}`) * 380} cy={360 + random(`rh-${i}`) * 150} r={2 + random(`rr-${i}`) * 2} fill="#ffd38a" opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />
        ))}
        <rect x={185} y={0} width={10} height={520} fill="#0e1430" />
        <rect x={0} y={255} width={380} height={10} fill="#0e1430" />
      </g>
      <g transform="translate(110,420) rotate(-4)">
        <rect width={250} height={330} fill="#e2554a" />
        <circle cx={125} cy={140} r={70} fill="#ffd36b" opacity={0.9} />
        <rect x={30} y={250} width={190} height={22} fill="#fff" opacity={0.8} />
      </g>
      <rect x={60} y={980} width={960} height={240} rx={30} fill="#2e2228" />
    </svg>
  );
};

export const BedFront: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute'}}>
    <rect x={-40} y={1390} width={W + 80} height={560} rx={40} fill="#c9c5d6" />
    <path d="M-40,1420 Q300,1360 560,1430 Q820,1500 1120,1410 L1120,1960 L-40,1960 Z" fill="#3a5a96" />
    <path d="M-40,1420 Q300,1360 560,1430 Q820,1500 1120,1410" stroke="#6f8fc8" strokeWidth={10} fill="none" />
  </svg>
);
