import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import type {Lighting} from '../../characters/types';

/** Warm string-light key for the Monaco terrace. */
export const TERRACE_LIGHT: Lighting = {side: -1, rim: '#ffc27a', rimStrength: 0.85, shadeStrength: 0.6};
/** Soft warm-white key for the marble restroom. */
export const MARBLE_LIGHT: Lighting = {side: 1, rim: '#fff0d2', rimStrength: 0.7, shadeStrength: 0.45};
/** Cold phone glow on a dark beach. */
export const PHONE_LIGHT: Lighting = {side: 1, rim: '#8fd0ff', rimStrength: 1, shadeStrength: 0.85};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

/* ------------------------------------------------------------------ string lights */

/** Catenary rows of warm bulbs. Rows are given as [x1,y1,x2,y2,sag]. */
export const StringLights: React.FC<{rows: [number, number, number, number, number][]; t: number; bulb?: number; seed?: string}> = ({rows, t, bulb = 9, seed = 'sl'}) => (
  <Svg>
    {rows.map(([x1, y1, x2, y2, sag], r) => {
      const n = Math.max(6, Math.round(Math.abs(x2 - x1) / 70));
      const sw = Math.sin(t * 1.3 + r) * sag * 0.04;
      const pt = (u: number) => [x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + Math.sin(u * Math.PI) * (sag + sw)];
      const d = 'M' + Array.from({length: 25}).map((_, i) => pt(i / 24).join(',')).join('L');
      return (
        <g key={r}>
          <path d={d} stroke="#1b1410" strokeWidth={2.5} fill="none" opacity={0.8} />
          {Array.from({length: n}).map((_, i) => {
            const [x, y] = pt((i + 0.5) / n);
            const fl = 0.8 + 0.2 * Math.sin(t * 7 + random(`${seed}${r}-${i}`) * 9);
            return (
              <g key={i}>
                <circle cx={x} cy={y + bulb} r={bulb * 3.2} fill="#ffb85c" opacity={0.22 * fl} />
                <circle cx={x} cy={y + bulb} r={bulb} fill="#fff1c4" opacity={fl} />
              </g>
            );
          })}
        </g>
      );
    })}
  </Svg>
);

/* ------------------------------------------------------------------ terrace */

/**
 * Night rooftop terrace in Monaco, 2D layered: sky, coastline with lit windows, sea with moon
 * glitter and yachts, white balustrade, warm stone floor. `px` shifts layers for parallax.
 */
export const TerraceBG: React.FC<{t: number; horizon?: number; balY?: number; px?: number; lights?: boolean}> = ({t, horizon = 720, balY = 980, px = 0, lights = true}) => {
  const moon = {x: 790 - px * 0.1, y: horizon - 420};
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="tr-sky" x1="0" x2="0" y1="0" y2={horizon} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#070a22" />
            <stop offset="0.6" stopColor="#1d1d4a" />
            <stop offset="1" stopColor="#4b3462" />
          </linearGradient>
          <linearGradient id="tr-sea" x1="0" x2="0" y1={horizon} y2={balY} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2b2a55" />
            <stop offset="1" stopColor="#0b1430" />
          </linearGradient>
          <linearGradient id="tr-floor" x1="0" x2="0" y1={balY} y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6b4a3a" />
            <stop offset="0.5" stopColor="#8a5f45" />
            <stop offset="1" stopColor="#4a2f24" />
          </linearGradient>
          <radialGradient id="tr-moon" cx={moon.x} cy={moon.y} r={260} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff6dc" stopOpacity={0.5} />
            <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-200} y={-200} width={W + 400} height={horizon + 200} fill="url(#tr-sky)" />
        {Array.from({length: 60}).map((_, i) => (
          <circle key={i} cx={random(`ts${i}`) * W} cy={random(`ty${i}`) * horizon * 0.8} r={0.8 + random(`tr${i}`) * 1.8} fill="#fff" opacity={0.3 + 0.4 * Math.sin(t * 2 + i)} />
        ))}
        <circle cx={moon.x} cy={moon.y} r={260} fill="url(#tr-moon)" />
        <circle cx={moon.x} cy={moon.y} r={46} fill="#fff6dc" />
        {/* coastline hills with lit windows */}
        <g transform={`translate(${-px * 0.25},0)`}>
          <path d={`M-300,${horizon} L-300,${horizon - 150} Q-100,${horizon - 260} 120,${horizon - 170} Q260,${horizon - 120} 380,${horizon - 60} L520,${horizon - 30} L520,${horizon} Z`} fill="#1a1530" />
          <path d={`M900,${horizon} L960,${horizon - 90} Q1120,${horizon - 230} 1400,${horizon - 140} L1400,${horizon} Z`} fill="#1a1530" />
          {Array.from({length: 90}).map((_, i) => {
            const left = i < 60;
            const x = left ? -260 + random(`wx${i}`) * 760 : 940 + random(`wx${i}`) * 440;
            const top = left ? horizon - 150 + Math.max(0, (x - 120) * 0.25) : horizon - 120 + Math.abs(x - 1120) * 0.2;
            const y = top + random(`wy${i}`) * (horizon - top);
            return <rect key={i} x={x} y={y} width={5} height={4} fill={random(`wc${i}`) > 0.3 ? '#ffd38a' : '#fff4dc'} opacity={0.5 + 0.5 * random(`wo${i}`)} />;
          })}
        </g>
        {/* sea */}
        <rect x={-200} y={horizon} width={W + 400} height={balY - horizon + 10} fill="url(#tr-sea)" />
        {Array.from({length: 26}).map((_, i) => {
          const y = horizon + 6 + i * i * 0.5;
          if (y > balY) return null;
          const w = 20 + i * 4 + 20 * Math.sin(t * 3 + i * 1.7);
          return <rect key={i} x={moon.x - w / 2 + Math.sin(t * 2 + i) * 10} y={y} width={w} height={2 + i * 0.12} rx={2} fill="#fff1c9" opacity={0.55 - i * 0.012} />;
        })}
        {/* yachts */}
        {[
          [180, 22, 0],
          [520, 14, 1],
          [980, 18, 2],
        ].map(([x, y, i]) => {
          const xx = x - px * 0.4 + Math.sin(t * 0.5 + i) * 6;
          const yy = horizon + y + Math.sin(t * 1.5 + i) * 1.5;
          return (
            <g key={i}>
              <path d={`M${xx - 60},${yy} L${xx + 60},${yy} L${xx + 44},${yy + 12} L${xx - 50},${yy + 12} Z`} fill="#e9ecf3" />
              <rect x={xx - 34} y={yy - 14} width={58} height={14} rx={4} fill="#d6dae4" />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={xx - 30 + k * 14} y={yy - 10} width={8} height={5} fill="#ffd38a" />
              ))}
              <rect x={xx - 40} y={yy + 14} width={80} height={3} fill="#ffd38a" opacity={0.35} />
            </g>
          );
        })}
        {/* floor */}
        <rect x={-200} y={balY} width={W + 400} height={H - balY + 200} fill="url(#tr-floor)" />
        {Array.from({length: 14}).map((_, i) => {
          const y = balY + Math.pow(i / 13, 1.8) * (H - balY);
          return <line key={i} x1={-200} y1={y} x2={W + 200} y2={y} stroke="#3b261c" strokeWidth={2 + i * 0.3} opacity={0.5} />;
        })}
        {Array.from({length: 17}).map((_, i) => {
          const x0 = 540 + (i - 8) * 70 - px * 0.6;
          const x1 = 540 + (i - 8) * 340 - px;
          return <line key={i} x1={x0} y1={balY} x2={x1} y2={H} stroke="#3b261c" strokeWidth={3} opacity={0.45} />;
        })}
        {/* warm pools of light on the floor */}
        {[0.2, 0.55, 0.85].map((u, i) => (
          <ellipse key={i} cx={u * W - px * 0.7} cy={balY + 300 + i * 90} rx={360} ry={90} fill="#ffb862" opacity={0.12} />
        ))}
        {/* balustrade */}
        <g transform={`translate(${-px * 0.7},0)`}>
          <rect x={-400} y={balY - 120} width={W + 800} height={22} fill="#efe7da" />
          <rect x={-400} y={balY - 98} width={W + 800} height={6} fill="#b9ab96" />
          {Array.from({length: 40}).map((_, i) => {
            const x = -380 + i * 48;
            return <path key={i} d={`M${x},${balY - 92} q 14,10 0,26 q -12,18 4,34 q 14,12 -2,32 L ${x + 20},${balY} L ${x + 22},${balY - 92} Z`} fill="#e3d9c8" stroke="#b9ab96" strokeWidth={2} />;
          })}
          <rect x={-400} y={balY - 6} width={W + 800} height={14} fill="#cfc3b0" />
        </g>
      </Svg>
      {lights && (
        <StringLights
          t={t}
          rows={[
            [-100 - px * 0.5, 180, 620 - px * 0.5, 120, 110],
            [520 - px * 0.5, 120, 1200 - px * 0.5, 200, 120],
            [-100 - px * 0.8, 520, 1200 - px * 0.8, 470, 90],
          ]}
        />
      )}
    </AbsoluteFill>
  );
};

/** Restaurant table front view, white tablecloth to the floor. (x, y) = centre of the table top front edge; s = scale (1 ≈ 520 px wide). */
export const DinnerTable: React.FC<{x: number; y: number; s?: number; t: number; plates?: number; floor?: number; phone?: boolean; candle?: boolean}> = ({x, y, s = 1, t, plates = 2, floor, phone = false, candle = true}) => {
  const w = 260 * s;
  const d = 70 * s;
  const fy = floor ?? y + 330 * s;
  const fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return (
    <Svg>
      <ellipse cx={x} cy={fy} rx={w * 1.15} ry={22 * s} fill="#000" opacity={0.3} />
      {/* skirt */}
      <path d={`M${x - w},${y} L${x - w - 12 * s},${fy} Q${x},${fy + 18 * s} ${x + w + 12 * s},${fy} L${x + w},${y} Z`} fill="#eeeae4" />
      {[-0.6, -0.2, 0.2, 0.6].map((k) => (
        <path key={k} d={`M${x + k * w},${y + 6} Q${x + k * w * 1.04},${(y + fy) / 2} ${x + k * w * 1.06},${fy}`} stroke="#c9c3ba" strokeWidth={5 * s} fill="none" opacity={0.6} />
      ))}
      <path d={`M${x - w},${y} L${x - w - 12 * s},${fy} L${x - w + 30 * s},${fy} L${x - w + 20 * s},${y} Z`} fill="#c9c3ba" opacity={0.5} />
      {/* top */}
      <ellipse cx={x} cy={y - d * 0.5} rx={w} ry={d * 0.62} fill="#fbf8f3" />
      <ellipse cx={x} cy={y - d * 0.5} rx={w} ry={d * 0.62} fill="none" stroke="#e2dcd2" strokeWidth={3 * s} />
      {/* plates */}
      {[-1, 1].slice(0, plates).map((k) => (
        <g key={k}>
          <ellipse cx={x + k * w * 0.48} cy={y - d * 0.42} rx={70 * s} ry={20 * s} fill="#ffffff" stroke="#d8d2c8" strokeWidth={3 * s} />
          <ellipse cx={x + k * w * 0.48} cy={y - d * 0.44} rx={44 * s} ry={12 * s} fill="#f1ede6" />
          <ellipse cx={x + k * w * 0.48 - 8 * s} cy={y - d * 0.46} rx={18 * s} ry={6 * s} fill={k < 0 ? '#c8803e' : '#7aa35a'} />
          <rect x={x + k * w * 0.48 + 80 * s} y={y - d * 0.5} width={6 * s} height={22 * s} rx={2} fill="#c9c9cf" />
          {/* wine glass */}
          <g transform={`translate(${x + k * w * 0.2},${y - d * 0.7})`}>
            <path d={`M${-14 * s},${-70 * s} Q${-16 * s},${-36 * s} 0,${-30 * s} Q${16 * s},${-36 * s} ${14 * s},${-70 * s} Z`} fill="#ffffff" opacity={0.35} stroke="#ffffff" strokeWidth={2} />
            <path d={`M${-12 * s},${-50 * s} Q0,${-32 * s} ${12 * s},${-50 * s} Z`} fill="#8e1f3a" opacity={0.85} />
            <line x1={0} y1={-30 * s} x2={0} y2={0} stroke="#fff" strokeWidth={2.5 * s} opacity={0.6} />
            <ellipse cx={0} cy={0} rx={12 * s} ry={4 * s} fill="#fff" opacity={0.5} />
          </g>
        </g>
      ))}
      {phone && (
        <g transform={`translate(${x - w * 0.12},${y - d * 0.28}) rotate(-8)`}>
          <rect x={-26 * s} y={-10 * s} width={52 * s} height={22 * s} rx={5 * s} fill="#e4b8a6" />
          <rect x={-22 * s} y={-7 * s} width={44 * s} height={16 * s} rx={4 * s} fill="#111" />
        </g>
      )}
      {candle && (
        <g transform={`translate(${x},${y - d * 0.55})`}>
          <circle cx={0} cy={-52 * s} r={70 * s} fill="#ffb862" opacity={0.18 * fl} />
          <rect x={-14 * s} y={-30 * s} width={28 * s} height={30 * s} rx={4 * s} fill="#fff" opacity={0.35} stroke="#fff" strokeWidth={2} />
          <rect x={-6 * s} y={-24 * s} width={12 * s} height={20 * s} fill="#f7efe0" />
          <path d={`M0,${-48 * s * fl} Q${6 * s},${-34 * s} 0,${-26 * s} Q${-6 * s},${-34 * s} 0,${-48 * s * fl} Z`} fill="#ffd27a" />
        </g>
      )}
    </Svg>
  );
};

/** Bistro chair back (gold frame, cream cushion). (x, y) = seat front centre; s = scale. */
export const ChairBack: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <Svg>
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-110} y={-420} width={220} height={300} rx={60} fill="#c9962e" />
      <rect x={-92} y={-404} width={184} height={268} rx={50} fill="#efe3c8" />
      <rect x={-104} y={-130} width={14} height={180} fill="#a77a22" />
      <rect x={90} y={-130} width={14} height={180} fill="#a77a22" />
    </g>
  </Svg>
);

/* ------------------------------------------------------------------ marble restroom */

const Veins: React.FC<{x: number; y: number; w: number; h: number; seed: string; n?: number; color?: string}> = ({x, y, w, h, seed, n = 14, color = '#9a958d'}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const r = (k: string) => random(`${seed}-${i}-${k}`);
      const x0 = x + r('x') * w;
      const y0 = y + r('y') * h;
      const pts = Array.from({length: 6}).map((__, k) => [x0 + k * (40 + r('dx') * 60), y0 + k * (r('dy') - 0.3) * 50 + Math.sin(k * 1.7 + i) * 18]);
      return <path key={i} d={'M' + pts.map((p) => p.join(',')).join('L')} stroke={color} strokeWidth={1 + r('w') * 3} fill="none" opacity={0.25 + r('o') * 0.35} strokeLinejoin="round" />;
    })}
  </g>
);

/**
 * White marble restroom wall seen straight on: marble slabs, big gold-framed mirror,
 * marble counter with sink and gold faucet, brass sconces. `mirror` renders inside the glass.
 */
export const RestroomWall: React.FC<{t: number; mirror?: React.ReactNode; counterY?: number; mx?: number; my?: number; mw?: number; mh?: number; dark?: number}> = ({
  t,
  mirror,
  counterY = 1380,
  mx = 140,
  my = 360,
  mw = 800,
  mh = 900,
  dark = 0,
}) => {
  const fl = 0.9 + 0.1 * Math.sin(t * 9);
  return (
    <AbsoluteFill style={{background: '#e9e4dc'}}>
      <Svg>
        <defs>
          <linearGradient id="rr-wall" x1="0" x2="1">
            <stop offset="0" stopColor="#dcd6cc" />
            <stop offset="0.5" stopColor="#f4f0e9" />
            <stop offset="1" stopColor="#d5cfc4" />
          </linearGradient>
          <linearGradient id="rr-gold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#f6dc8c" />
            <stop offset="0.5" stopColor="#c9962e" />
            <stop offset="1" stopColor="#8a6418" />
          </linearGradient>
          <linearGradient id="rr-glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#c9d3d6" />
            <stop offset="1" stopColor="#9eabb0" />
          </linearGradient>
          <clipPath id="rr-mclip">
            <rect x={mx} y={my} width={mw} height={mh} rx={18} />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#rr-wall)" />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={i * 360 + 360} y1={0} x2={i * 360 + 360} y2={H} stroke="#c8c1b5" strokeWidth={3} />
        ))}
        <line x1={0} y1={960} x2={W} y2={960} stroke="#c8c1b5" strokeWidth={3} />
        <Veins x={-100} y={0} w={W + 100} h={H} seed="rrw" n={26} />
        {/* sconces */}
        {[mx - 60, mx + mw + 60].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={my + 200} r={160} fill="#ffe2a6" opacity={0.25 * fl} />
            <rect x={x - 10} y={my + 230} width={20} height={70} fill="url(#rr-gold)" />
            <path d={`M${x - 34},${my + 140} L${x + 34},${my + 140} L${x + 26},${my + 236} L${x - 26},${my + 236} Z`} fill="#fff6e0" />
          </g>
        ))}
        {/* mirror frame */}
        <rect x={mx - 26} y={my - 26} width={mw + 52} height={mh + 52} rx={34} fill="url(#rr-gold)" />
        <rect x={mx - 10} y={my - 10} width={mw + 20} height={mh + 20} rx={24} fill="#7a5a16" />
        <rect x={mx} y={my} width={mw} height={mh} rx={18} fill="url(#rr-glass)" />
      </Svg>
      <AbsoluteFill style={{clipPath: `inset(${my}px ${W - mx - mw}px ${H - my - mh}px ${mx}px round 18px)`}}>{mirror}</AbsoluteFill>
      <Svg>
        <path d={`M${mx},${my + mh * 0.25} L${mx + mw * 0.35},${my} L${mx + mw * 0.47},${my} L${mx},${my + mh * 0.42} Z`} fill="#fff" opacity={0.12} />
        <path d={`M${mx + mw * 0.55},${my + mh} L${mx + mw},${my + mh * 0.55} L${mx + mw},${my + mh * 0.62} L${mx + mw * 0.62},${my + mh} Z`} fill="#fff" opacity={0.08} />
        {/* counter */}
        <rect x={-20} y={counterY} width={W + 40} height={60} fill="#f7f4ef" />
        <rect x={-20} y={counterY + 60} width={W + 40} height={H - counterY} fill="#d9d2c6" />
        <Veins x={-100} y={counterY} w={W + 200} h={H - counterY} seed="rrc" n={12} color="#8b857b" />
        <rect x={-20} y={counterY + 56} width={W + 40} height={8} fill="#b8b0a2" />
        {/* sink */}
        <ellipse cx={540} cy={counterY + 8} rx={230} ry={30} fill="#e4ddd2" />
        <ellipse cx={540} cy={counterY + 12} rx={200} ry={22} fill="#cfc7ba" />
        {/* gold faucet */}
        <rect x={528} y={counterY - 120} width={24} height={124} rx={8} fill="url(#rr-gold)" />
        <path d={`M528,${counterY - 112} Q540,${counterY - 190} 640,${counterY - 150} L640,${counterY - 126} Q560,${counterY - 160} 552,${counterY - 112} Z`} fill="url(#rr-gold)" />
        <rect x={496} y={counterY - 40} width={88} height={18} rx={9} fill="url(#rr-gold)" />
        <circle cx={430} cy={counterY - 20} r={20} fill="url(#rr-gold)" />
        <circle cx={650} cy={counterY - 20} r={20} fill="url(#rr-gold)" />
        {/* towels */}
        <rect x={830} y={counterY - 70} width={140} height={70} rx={10} fill="#fffaf2" stroke="#e1d8c8" strokeWidth={3} />
        <rect x={840} y={counterY - 110} width={120} height={44} rx={10} fill="#fffaf2" stroke="#e1d8c8" strokeWidth={3} />
      </Svg>
      {dark > 0 && <AbsoluteFill style={{background: `rgba(20,14,10,${dark})`}} />}
    </AbsoluteFill>
  );
};

/** What the restroom mirror reflects: the opposite wall (darker marble + stall doors). */
export const MirrorRoom: React.FC = () => (
  <AbsoluteFill style={{background: '#cfc8bc'}}>
    <Svg>
      <Veins x={-100} y={0} w={W + 100} h={H} seed="rrm" n={20} color="#8f897f" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={60 + i * 330} y={380} width={290} height={1100} rx={10} fill="#5a3b26" />
          <rect x={80 + i * 330} y={400} width={250} height={1060} rx={8} fill="#6e4a30" />
          <circle cx={300 + i * 330} cy={950} r={12} fill="#c9962e" />
        </g>
      ))}
      <rect x={0} y={1480} width={W} height={440} fill="#bdb5a8" />
    </Svg>
    <AbsoluteFill style={{background: 'rgba(60,80,90,0.18)'}} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ Monaco map */

export const MAP_PINS: [number, number][] = [
  [300, 700], [420, 860], [560, 780], [690, 930], [380, 1040], [520, 1120], [760, 1060], [610, 1260], [300, 1220], [820, 820], [460, 640], [700, 690], [240, 940], [880, 980], [640, 560], [350, 1360], [520, 960], [780, 1340],
];

/** Stylised top-down map of Monaco: land, harbour, sea on the right/bottom, street grid. */
export const MonacoMap: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#16335a'}}>
    <Svg>
      <defs>
        <pattern id="mm-water" width={60} height={60} patternUnits="userSpaceOnUse">
          <path d="M0,30 q15,-8 30,0 t30,0" stroke="#2a5488" strokeWidth={3} fill="none" />
        </pattern>
      </defs>
      <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#1d4677" />
      <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#mm-water)" opacity={0.6} transform={`translate(${(t * 12) % 60},0)`} />
      {/* land mass (France/Monaco hills on the top-left, coast curving down-right) */}
      <path d="M-300,-300 L1400,-300 L1400,300 Q1180,420 1040,560 Q960,700 990,860 Q1010,1000 900,1120 Q820,1180 860,1300 Q900,1440 760,1520 Q600,1600 420,1560 Q300,1530 200,1640 Q60,1780 -300,1760 Z" fill="#efe6d2" />
      <path d="M-300,-300 L1400,-300 L1400,300 Q1180,420 1040,560 Q960,700 990,860 Q1010,1000 900,1120 Q820,1180 860,1300 Q900,1440 760,1520 Q600,1600 420,1560 Q300,1530 200,1640 Q60,1780 -300,1760 Z" fill="none" stroke="#9fd0ff" strokeWidth={10} opacity={0.5} />
      {/* harbour */}
      <path d="M720,1180 Q780,1100 880,1140 L860,1300 Q800,1260 740,1300 Z" fill="#1d4677" />
      <path d="M700,1300 L880,1290" stroke="#c9bfa8" strokeWidth={12} />
      {Array.from({length: 7}).map((_, i) => (
        <rect key={i} x={752 + (i % 4) * 26} y={1170 + Math.floor(i / 4) * 50} width={14} height={34} rx={6} fill="#ffffff" />
      ))}
      {/* parks */}
      {[
        [200, 500, 120, 80],
        [600, 400, 160, 90],
        [430, 1440, 140, 60],
        [850, 650, 90, 140],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={30} fill="#b7d79a" />
      ))}
      {/* streets */}
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        {Array.from({length: 9}).map((_, i) => (
          <path key={'a' + i} d={`M-100,${300 + i * 150} Q400,${260 + i * 150 + Math.sin(i) * 60} ${1000 - i * 20},${380 + i * 140}`} strokeWidth={i % 3 === 0 ? 16 : 9} />
        ))}
        {Array.from({length: 8}).map((_, i) => (
          <path key={'b' + i} d={`M${80 + i * 120},-100 Q${120 + i * 110},800 ${40 + i * 100},1700`} strokeWidth={i % 3 === 1 ? 14 : 8} />
        ))}
      </g>
      {/* blocks shading */}
      {Array.from({length: 60}).map((_, i) => (
        <rect key={i} x={random(`bx${i}`) * 900 - 40} y={200 + random(`by${i}`) * 1300} width={30 + random(`bw${i}`) * 40} height={20 + random(`bh${i}`) * 30} fill="#d8ccb2" opacity={0.6} />
      ))}
      <text x={180} y={600} fontFamily={HUD_FONT} fontWeight={700} fontSize={64} letterSpacing={14} fill="#0c2340" opacity={0.55}>
        MÔNACO
      </text>
      <text x={960} y={1500} textAnchor="end" fontFamily={HUD_FONT} fontWeight={700} fontSize={34} letterSpacing={6} fill="#bfe0ff" opacity={0.6}>
        MAR MEDITERRÂNEO
      </text>
    </Svg>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ night beach */

/** Dark, empty beach at night: moonless sky, faint horizon, foam lines, wet sand. */
export const NightBeach: React.FC<{t: number; horizon?: number; px?: number}> = ({t, horizon = 860, px = 0}) => (
  <AbsoluteFill style={{background: '#03050b'}}>
    <Svg>
      <defs>
        <linearGradient id="nb-sky" x1="0" x2="0" y1="0" y2={horizon} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#010208" />
          <stop offset="1" stopColor="#0f1a33" />
        </linearGradient>
        <linearGradient id="nb-sea" x1="0" x2="0" y1={horizon} y2={horizon + 420} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0d1830" />
          <stop offset="1" stopColor="#050a16" />
        </linearGradient>
        <linearGradient id="nb-sand" x1="0" x2="0" y1={horizon + 400} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14161e" />
          <stop offset="1" stopColor="#07080c" />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={W + 400} height={horizon + 200} fill="url(#nb-sky)" />
      {Array.from({length: 110}).map((_, i) => (
        <circle key={i} cx={((random(`nbs${i}`) * (W + 200) - px * 0.1) % (W + 200)) - 100} cy={random(`nby${i}`) * horizon} r={0.7 + random(`nbr${i}`) * 1.6} fill="#dfe8ff" opacity={(0.25 + 0.5 * random(`nbo${i}`)) * (0.75 + 0.25 * Math.sin(t * 3 + i))} />
      ))}
      {/* distant lighthouse blink */}
      <circle cx={140 - px * 0.2} cy={horizon - 8} r={4} fill="#ffe6a8" opacity={Math.sin(t * 2.4) > 0.6 ? 1 : 0.15} />
      <rect x={-200} y={horizon} width={W + 400} height={430} fill="url(#nb-sea)" />
      {Array.from({length: 7}).map((_, i) => {
        const y = horizon + 30 + i * i * 9 + Math.sin(t * 1.2 + i) * 4;
        return <path key={i} d={`M-100,${y} Q${300 - px * 0.3},${y - 8} 540,${y + 2} T 1200,${y}`} stroke="#5f7aa8" strokeWidth={1.5 + i * 0.6} fill="none" opacity={0.3 + i * 0.05} />;
      })}
      {/* foam edge */}
      <path d={`M-100,${horizon + 420 + Math.sin(t * 1.4) * 14} Q300,${horizon + 395} 600,${horizon + 430 + Math.sin(t * 1.4) * 12} T 1200,${horizon + 410}`} stroke="#c9d6ee" strokeWidth={5} fill="none" opacity={0.45} />
      <rect x={-200} y={horizon + 420} width={W + 400} height={H} fill="url(#nb-sand)" />
    </Svg>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ phone hardware */

/** Phone body (front) with a screen slot; children are drawn in a 1080x1920 screen space scaled to fit. */
export const PhoneFrame: React.FC<{w: number; children: React.ReactNode; glow?: number}> = ({w, children, glow = 0.6}) => {
  const h = w * 2.05;
  const sw = w - 28;
  const sh = h - 28;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.14, background: '#111217', boxShadow: `0 0 ${80 * glow}px rgba(120,190,255,${0.45 * glow}), 0 30px 60px rgba(0,0,0,0.6)`, border: '4px solid #4c505c'}}>
      <div style={{position: 'absolute', left: 14, top: 14, width: sw, height: sh, borderRadius: w * 0.11, overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1080 * (sh / sw), transform: `scale(${sw / 1080})`, transformOrigin: '0 0'}}>{children}</div>
      </div>
      <div style={{position: 'absolute', left: w / 2 - w * 0.12, top: 26, width: w * 0.24, height: w * 0.05, borderRadius: 20, background: '#050608'}} />
    </div>
  );
};
