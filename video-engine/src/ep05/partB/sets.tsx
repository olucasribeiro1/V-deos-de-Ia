import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Svg} from './kit';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import type {Lighting, Outfit} from '../../characters/types';

/* ------------------------------------------------------------------ lights */

export const KITCHEN_LIGHT: Lighting = {side: 1, rim: '#bfe6ff', rimStrength: 0.7, shadeStrength: 0.5};
export const MOON_LIGHT: Lighting = {side: 1, rim: '#bcd6ff', rimStrength: 0.95, shadeStrength: 0.7};
export const ROOF_LIGHT: Lighting = {side: -1, rim: '#9ec4ff', rimStrength: 0.9, shadeStrength: 0.7};

/* ------------------------------------------------------------------ outfits (side characters) */

export const CHEF: Outfit = {
  skin: {base: '#e0a986', shade: '#b07a5a', light: '#f3c7a6'},
  torso: 'suit',
  top: {base: '#f6f4ef', shade: '#cfcac0', light: '#ffffff'},
  legs: {base: '#2b2d33', shade: '#15161a', light: '#4a4d56'},
  shoes: 'dress',
  shoeColor: {base: '#16161a', shade: '#050506', light: '#5d5f66'},
  gloves: false,
  head: {hair: 'bald', hairColor: '#3a2a22', beard: true},
  neckwear: 'bow',
};

export const CAPTAIN: Outfit = {
  skin: {base: '#d9a07c', shade: '#a8704f', light: '#f0c29f'},
  torso: 'suit',
  top: {base: '#f4f5f8', shade: '#c9ccd6', light: '#ffffff'},
  legs: {base: '#1d2747', shade: '#10162b', light: '#3a4a7a'},
  shoes: 'dress',
  shoeColor: {base: '#16161a', shade: '#050506', light: '#5d5f66'},
  gloves: false,
  head: {hair: 'buzz', hairColor: '#d8d8d8', beard: true},
  neckwear: 'tie',
};

/** Captain's peaked cap, centred on (0,0) = bottom centre of the crown; ~220 units wide. */
export const CaptainHat: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-100,0 Q-118,-70 -60,-92 Q0,-110 60,-92 Q118,-70 100,0 Z" fill="#ffffff" stroke="#c9ccd6" strokeWidth={5} />
    <rect x={-100} y={-26} width={200} height={30} rx={8} fill="#141a33" />
    <path d="M-92,2 Q0,48 112,6 Q60,28 -92,2 Z" fill="#0b0f20" />
    <path d="M-60,-14 L60,-14" stroke="#e8b84a" strokeWidth={6} />
    <circle cx={0} cy={-46} r={20} fill="#e8b84a" />
    <path d="M-10,-46 L10,-46 M0,-56 L0,-36" stroke="#141a33" strokeWidth={5} />
  </g>
);

/** Chef toque (bottom centre at 0,0). */
export const ChefHat: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-70} y={-40} width={140} height={44} rx={6} fill="#f4f2ec" stroke="#d4cfc4" strokeWidth={4} />
    <path d="M-70,-36 Q-120,-80 -80,-130 Q-60,-190 0,-170 Q60,-200 86,-130 Q124,-84 70,-36 Z" fill="#ffffff" stroke="#d4cfc4" strokeWidth={4} />
  </g>
);

/* ------------------------------------------------------------------ kitchen */

export const Kitchen: React.FC<{t: number; px?: number; flame?: number}> = ({t, px = 0, flame = 1}) => (
  <Svg>
    <defs>
      <linearGradient id="kb-wall" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#24343d" />
        <stop offset="1" stopColor="#3d5560" />
      </linearGradient>
      <pattern id="kb-tile" width={80} height={80} patternUnits="userSpaceOnUse">
        <rect width={80} height={80} fill="#dfe8e6" />
        <rect width={80} height={80} fill="none" stroke="#9fb3b2" strokeWidth={4} />
      </pattern>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#kb-wall)" />
    <g transform={`translate(${-px * 0.5},0)`}>
      <rect x={-200} y={420} width={W + 400} height={700} fill="url(#kb-tile)" opacity={0.85} />
      {/* hood */}
      <path d="M120,200 L960,200 L1040,470 L40,470 Z" fill="#9aa7ae" />
      <path d="M120,200 L960,200 L980,250 L100,250 Z" fill="#c8d1d6" />
      <rect x={40} y={460} width={1000} height={24} fill="#6f7c83" />
      {/* hanging pans + ladles */}
      {[160, 300, 780, 900].map((x, i) => (
        <g key={i} transform={`rotate(${Math.sin(t * 3 + i) * 4} ${x} 500)`}>
          <line x1={x} y1={490} x2={x} y2={560} stroke="#333" strokeWidth={4} />
          {i % 2 ? <ellipse cx={x} cy={600} rx={44} ry={44} fill="#2a2a2e" stroke="#555" strokeWidth={6} /> : <path d={`M${x},560 L${x},680 Q${x - 26},700 ${x},720 Q${x + 26},700 ${x},680`} stroke="#b9c2c7" strokeWidth={10} fill="#b9c2c7" />}
        </g>
      ))}
    </g>
    {/* counter + stove */}
    <rect x={-200} y={1120} width={W + 400} height={60} fill="#cfd6da" />
    <rect x={-200} y={1180} width={W + 400} height={800} fill="#8a969c" />
    {Array.from({length: 6}).map((_, i) => (
      <rect key={i} x={-80 + i * 220 - px * 0.2} y={1240} width={190} height={560} rx={10} fill="#7a868c" stroke="#5f696e" strokeWidth={5} />
    ))}
    {[330, 720].map((x, i) => {
      const fl = flame * (0.8 + 0.2 * Math.sin(t * 25 + i * 3));
      return (
        <g key={i}>
          <ellipse cx={x} cy={1110} rx={120 * fl} ry={30 * fl} fill="#4fa8ff" opacity={0.5} />
          {Array.from({length: 7}).map((__, k) => (
            <path key={k} d={`M${x - 90 + k * 30},1112 q 8,${-40 * fl - random(`fl${i}${k}${Math.floor(t * 20)}`) * 30} 16,0 Z`} fill={k % 2 ? '#ffb43c' : '#ff6a28'} opacity={0.9} />
          ))}
          <ellipse cx={x} cy={1080} rx={150} ry={30} fill="#1d1e22" />
          <rect x={x - 150} y={1040} width={300} height={40} fill="#2a2b30" />
          <ellipse cx={x} cy={1040} rx={150} ry={30} fill="#3a3b42" />
          <rect x={x + 140} y={1030} width={200} height={18} rx={8} fill="#1d1e22" transform={`rotate(-8 ${x + 140} 1040)`} />
        </g>
      );
    })}
    {/* steam */}
    {Array.from({length: 10}).map((_, i) => {
      const a = ((t * 0.6 + i / 10) % 1);
      return <circle key={i} cx={330 + (i % 2) * 390 + Math.sin(t * 2 + i) * 40} cy={1000 - a * 500} r={40 + a * 80} fill="#fff" opacity={0.18 * (1 - a)} />;
    })}
    <text x={880} y={380} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#2b3a42" letterSpacing={4}>
      CUISINE
    </text>
  </Svg>
);

/* ------------------------------------------------------------------ rooftop */

export const Rooftop: React.FC<{t: number; px?: number}> = ({t, px = 0}) => (
  <Svg>
    <defs>
      <linearGradient id="rf-sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#060a24" />
        <stop offset="0.7" stopColor="#25204f" />
        <stop offset="1" stopColor="#5c3a66" />
      </linearGradient>
      <pattern id="rf-tile" width={70} height={46} patternUnits="userSpaceOnUse">
        <rect width={70} height={46} fill="#a64a2e" />
        <path d="M0,46 Q35,20 70,46" fill="#c35e3a" />
        <path d="M0,46 Q35,20 70,46" fill="none" stroke="#6e2c1a" strokeWidth={4} />
      </pattern>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#rf-sky)" />
    {Array.from({length: 70}).map((_, i) => (
      <circle key={i} cx={random(`rs${i}`) * W} cy={random(`ry${i}`) * 900} r={1 + random(`rr${i}`) * 2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
    ))}
    <circle cx={260 - px * 0.1} cy={330} r={70} fill="#fff6dc" />
    <circle cx={260 - px * 0.1} cy={330} r={220} fill="#fff6dc" opacity={0.12} />
    {/* city below */}
    <g transform={`translate(${-px * 0.3},0)`}>
      {Array.from({length: 18}).map((_, i) => {
        const x = -200 + i * 90;
        const h = 160 + random(`bh${i}`) * 260;
        return (
          <g key={i}>
            <rect x={x} y={1100 - h} width={84} height={h + 300} fill={i % 2 ? '#1b1838' : '#221d44'} />
            {Array.from({length: 12}).map((__, k) => (
              <rect key={k} x={x + 10 + (k % 3) * 24} y={1100 - h + 20 + Math.floor(k / 3) * 40} width={12} height={16} fill="#ffd38a" opacity={random(`bw${i}-${k}`) > 0.45 ? 0.85 : 0.1} />
            ))}
          </g>
        );
      })}
    </g>
    {/* roof slope (foreground) */}
    <path d={`M-200,1280 L${W + 200},1060 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill="url(#rf-tile)" />
    <path d={`M-200,1280 L${W + 200},1060`} stroke="#5a2414" strokeWidth={26} />
    {/* chimney + antenna */}
    <rect x={760} y={820} width={120} height={300} fill="#8c4a32" />
    <rect x={745} y={800} width={150} height={36} fill="#6e3424" />
    <line x1={280} y1={1240} x2={280} y2={880} stroke="#3a3f52" strokeWidth={8} />
    {[0, 1, 2].map((k) => (
      <line key={k} x1={200 + k * 20} y1={920 + k * 50} x2={360 - k * 20} y2={920 + k * 50} stroke="#3a3f52" strokeWidth={6} />
    ))}
  </Svg>
);

/* ------------------------------------------------------------------ top-down terrace plan (mic map) */

export const ROOMS: {id: string; label: string; x: number; y: number; w: number; h: number}[] = [
  {id: 'cozinha', label: 'COZINHA', x: 120, y: 560, w: 360, h: 300},
  {id: 'banheiro', label: 'BANHEIRO', x: 500, y: 560, w: 220, h: 300},
  {id: 'telhado', label: 'TELHADO', x: 740, y: 560, w: 240, h: 300},
  {id: 'terraco', label: 'TERRAÇO', x: 120, y: 880, w: 860, h: 520},
  {id: 'varanda', label: 'VARANDA', x: 120, y: 1420, w: 860, h: 160},
];
export const MICS: [number, number][] = [
  [150, 590],
  [950, 590],
  [540, 1550],
];

export const TerracePlan: React.FC<{t: number}> = ({t}) => (
  <Svg>
    <defs>
      <pattern id="tp-grid" width={40} height={40} patternUnits="userSpaceOnUse">
        <path d="M40,0 L0,0 0,40" fill="none" stroke="#1f3f6e" strokeWidth={2} />
      </pattern>
    </defs>
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0a1a36" />
    <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tp-grid)" />
    {/* sea at the bottom */}
    <rect x={-300} y={1640} width={W + 600} height={600} fill="#0d2b55" />
    {Array.from({length: 8}).map((_, i) => (
      <path key={i} d={`M${-100 + ((t * 30 + i * 160) % 1300)},${1700 + (i % 3) * 60} q20,-10 40,0 t40,0`} stroke="#2f6fb5" strokeWidth={4} fill="none" />
    ))}
    {ROOMS.map((r) => (
      <g key={r.id}>
        <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#12305c" stroke="#7fc4ff" strokeWidth={5} />
        <text x={r.x + 18} y={r.y + 44} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} letterSpacing={4} fill="#9fd5ff">
          {r.label}
        </text>
      </g>
    ))}
    {/* tables on the terrace */}
    {[
      [260, 1060],
      [480, 1020],
      [720, 1060],
      [880, 1220],
      [330, 1270],
      [600, 1240],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={46} fill="none" stroke="#7fc4ff" strokeWidth={4} opacity={0.8} />
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={x + Math.cos((k * Math.PI) / 2) * 68} cy={y + Math.sin((k * Math.PI) / 2) * 68} r={12} fill="#7fc4ff" opacity={0.6} />
        ))}
      </g>
    ))}
  </Svg>
);

/** Microphone icon (copy of CityMap MicMarker, recoloured). */
export const Mic: React.FC<{x: number; y: number; s?: number; red?: number}> = ({x, y, s = 1, red = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={52} fill={red > 0.5 ? '#ff4a4a' : '#5fd4ff'} opacity={0.3} />
    <circle r={36} fill="#0f1d3c" stroke={red > 0.5 ? '#ff4a4a' : '#5fd4ff'} strokeWidth={5} />
    <rect x={-9} y={-22} width={18} height={28} rx={9} fill="#e9f7ff" />
    <path d="M -15,0 Q -15,16 0,16 Q 15,16 15,0" stroke="#e9f7ff" strokeWidth={4} fill="none" />
    <line x1={0} y1={16} x2={0} y2={24} stroke="#e9f7ff" strokeWidth={4} />
  </g>
);

/* ------------------------------------------------------------------ yacht deck at night */

export const DECK_Y = 1180;

export const YachtDeck: React.FC<{t: number; px?: number; horizon?: number; rock?: number}> = ({t, px = 0, horizon = 860, rock = 1}) => {
  const roll = Math.sin(t * 1.1) * 1.2 * rock;
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="yd-sky" x1="0" x2="0" y1="0" y2={horizon} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#050824" />
            <stop offset="0.7" stopColor="#151a46" />
            <stop offset="1" stopColor="#30285a" />
          </linearGradient>
          <linearGradient id="yd-sea" x1="0" x2="0" y1={horizon} y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1c2350" />
            <stop offset="1" stopColor="#060b22" />
          </linearGradient>
          <linearGradient id="yd-teak" x1="0" x2="0" y1={DECK_Y} y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8a5a36" />
            <stop offset="1" stopColor="#5a3820" />
          </linearGradient>
        </defs>
        <rect x={-300} y={-300} width={W + 600} height={horizon + 300} fill="url(#yd-sky)" />
        {Array.from({length: 80}).map((_, i) => (
          <circle key={i} cx={random(`ys${i}`) * W} cy={random(`yy${i}`) * horizon * 0.85} r={0.8 + random(`yr${i}`) * 2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))} />
        ))}
        {/* moon */}
        <circle cx={780 - px * 0.05} cy={300} r={260} fill="#fff6dc" opacity={0.1} />
        <circle cx={780 - px * 0.05} cy={300} r={64} fill="#fff6dc" />
        <circle cx={760 - px * 0.05} cy={284} r={12} fill="#e8dfc4" />
        {/* far coast with Monaco lights */}
        <g transform={`translate(${-px * 0.15},0)`}>
          <path d={`M-300,${horizon} L-300,${horizon - 90} Q0,${horizon - 200} 300,${horizon - 110} Q480,${horizon - 60} 620,${horizon - 30} L620,${horizon} Z`} fill="#141133" />
          {Array.from({length: 70}).map((_, i) => {
            const x = -280 + random(`cx${i}`) * 880;
            const top = horizon - 140 + Math.abs(x - 50) * 0.14;
            return <rect key={i} x={x} y={top + random(`cy${i}`) * (horizon - top)} width={5} height={4} fill="#ffd38a" opacity={0.5 + 0.5 * random(`co${i}`)} />;
          })}
        </g>
        {/* sea */}
        <rect x={-300} y={horizon} width={W + 600} height={H - horizon + 300} fill="url(#yd-sea)" />
        {Array.from({length: 30}).map((_, i) => {
          const y = horizon + 4 + i * i * 0.7;
          const wdt = 16 + i * 5 + 18 * Math.sin(t * 3 + i * 1.7);
          return <rect key={i} x={780 - px * 0.05 - wdt / 2 + Math.sin(t * 2 + i) * 12} y={y} width={wdt} height={2 + i * 0.15} rx={2} fill="#fff1c9" opacity={0.6 - i * 0.015} />;
        })}
      </Svg>
      {/* the boat rolls a little */}
      <AbsoluteFill style={{transform: `rotate(${roll}deg)`, transformOrigin: '540px 1500px'}}>
        <Svg>
          {/* cabin (left) */}
          <g transform={`translate(${-px * 0.6},0)`}>
            <path d={`M-200,${DECK_Y - 360} L260,${DECK_Y - 360} Q330,${DECK_Y - 340} 350,${DECK_Y - 230} L370,${DECK_Y} L-200,${DECK_Y} Z`} fill="#eef1f6" />
            <path d={`M-200,${DECK_Y - 360} L260,${DECK_Y - 360} Q330,${DECK_Y - 340} 350,${DECK_Y - 230} L-200,${DECK_Y - 230} Z`} fill="#dfe4ee" />
            <rect x={-160} y={DECK_Y - 320} width={470} height={70} rx={14} fill="#1b2446" />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-140 + k * 110} y={DECK_Y - 310} width={90} height={50} rx={8} fill="#ffd38a" opacity={0.85} />
            ))}
            <rect x={-200} y={DECK_Y - 200} width={540} height={14} fill="#c9cfdb" />
            {/* lifebuoy */}
            <circle cx={240} cy={DECK_Y - 120} r={52} fill="none" stroke="#ff6a3c" strokeWidth={26} />
            {[0, 1, 2, 3].map((k) => (
              <path key={k} d={`M${240 + Math.cos((k * Math.PI) / 2 + 0.4) * 39},${DECK_Y - 120 + Math.sin((k * Math.PI) / 2 + 0.4) * 39} A39,39 0 0 1 ${240 + Math.cos((k * Math.PI) / 2 + 0.75) * 39},${DECK_Y - 120 + Math.sin((k * Math.PI) / 2 + 0.75) * 39}`} stroke="#fff" strokeWidth={26} fill="none" />
            ))}
            {/* flag pole */}
            <line x1={330} y1={DECK_Y - 360} x2={330} y2={DECK_Y - 620} stroke="#c9cfdb" strokeWidth={8} />
          </g>
          {/* deck floor (teak) */}
          <path d={`M-300,${DECK_Y} L${W + 300},${DECK_Y} L${W + 300},${H + 300} L-300,${H + 300} Z`} fill="url(#yd-teak)" />
          {Array.from({length: 26}).map((_, i) => {
            const x0 = 540 + (i - 13) * 60 - px * 0.6;
            const x1 = 540 + (i - 13) * 260 - px;
            return <line key={i} x1={x0} y1={DECK_Y} x2={x1} y2={H + 300} stroke="#3e2614" strokeWidth={4} opacity={0.6} />;
          })}
          <ellipse cx={780 - px * 0.3} cy={DECK_Y + 260} rx={320} ry={60} fill="#cfe0ff" opacity={0.08} />
          {/* rail (right, to the sea) */}
          <g transform={`translate(${-px * 0.7},0)`}>
            <line x1={420} y1={DECK_Y - 170} x2={W + 400} y2={DECK_Y - 230} stroke="#e8edf5" strokeWidth={10} />
            <line x1={420} y1={DECK_Y - 90} x2={W + 400} y2={DECK_Y - 120} stroke="#c9cfdb" strokeWidth={6} />
            {Array.from({length: 8}).map((_, k) => (
              <line key={k} x1={430 + k * 110} y1={DECK_Y - 170 - k * 8} x2={430 + k * 110} y2={DECK_Y + 4} stroke="#e8edf5" strokeWidth={7} />
            ))}
          </g>
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Flag on the pole (top at x,y), `wind` 0..1 gust strength. */
export const Flag: React.FC<{x: number; y: number; t: number; wind?: number}> = ({x, y, t, wind = 0}) => {
  const L = 150 + wind * 40;
  const pts = Array.from({length: 9}).map((_, i) => {
    const u = i / 8;
    return [x + u * L, y + Math.sin(t * (6 + wind * 18) - u * 5) * (8 + wind * 18) * u];
  });
  const top = pts.map((p) => p.join(',')).join(' L');
  const bot = pts
    .slice()
    .reverse()
    .map(([px, py]) => `${px},${py + 90 - wind * 10}`)
    .join(' L');
  return (
    <Svg>
      <path d={`M${top} L${bot} Z`} fill="#e23b3b" stroke="#a51f1f" strokeWidth={3} />
      <path d={`M${x},${y + 45 - wind * 5} L${x + L},${y + 45 - wind * 5}`} stroke="#fff" strokeWidth={10} opacity={0.8} />
    </Svg>
  );
};

/* ------------------------------------------------------------------ props */

/** Wine glass (base at 0,0, ~180 units tall). */
export const WineGlass: React.FC<{x: number; y: number; s?: number; wine?: number; wobble?: number}> = ({x, y, s = 1, wine = 0.5, wobble = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${wobble}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={34} ry={9} fill="rgba(255,255,255,0.6)" />
    <rect x={-3} y={-80} width={6} height={80} fill="rgba(255,255,255,0.7)" />
    <path d="M-40,-190 Q-46,-100 0,-80 Q46,-100 40,-190 Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
    {wine > 0 && <path d={`M${-40 + 4},${-190 + (1 - wine) * 80 + 20} Q0,${-190 + (1 - wine) * 80 + 30} ${40 - 4},${-190 + (1 - wine) * 80 + 20} Q40,-104 0,-84 Q-40,-104 -36,${-190 + (1 - wine) * 80 + 20} Z`} fill="#8e1f3a" opacity={0.9} />}
    <path d="M-28,-176 Q-32,-130 -16,-104" stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);

/** Shattering wine glass: `k` 0 intact .. 1 fully burst; shards fly out, wine splashes. */
export const BurstGlass: React.FC<{x: number; y: number; s?: number; k: number; seed: string; wine?: number}> = ({x, y, s = 1, k, seed, wine = 0.5}) => {
  if (k <= 0) return <WineGlass x={x} y={y} s={s} wine={wine} wobble={0} />;
  const N = 14;
  const cy = -140;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={34} ry={9} fill="rgba(255,255,255,0.6)" />
      <rect x={-3} y={-80} width={6} height={80} fill="rgba(255,255,255,0.7)" />
      {k < 0.15 && <path d="M-40,-190 Q-46,-100 0,-80 Q46,-100 40,-190 Z" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth={4} />}
      {Array.from({length: N}).map((_, i) => {
        const r = (n: string) => random(`${seed}-${i}-${n}`);
        const a = r('a') * Math.PI * 2;
        const v = 120 + r('v') * 380;
        const dx = Math.cos(a) * v * k;
        const dy = Math.sin(a) * v * k * 0.8 + 500 * k * k;
        const sz = 12 + r('s') * 26;
        return (
          <path
            key={i}
            d={`M0,${-sz} L${sz * 0.7},${sz * 0.3} L${-sz * 0.5},${sz * 0.6} Z`}
            transform={`translate(${dx},${cy + dy}) rotate(${(r('r') - 0.5) * 720 * k})`}
            fill="rgba(220,240,255,0.45)"
            stroke="#ffffff"
            strokeWidth={3}
          />
        );
      })}
      {wine > 0 &&
        Array.from({length: 9}).map((_, i) => {
          const r = (n: string) => random(`${seed}-w-${i}-${n}`);
          const a = -Math.PI / 2 + (r('a') - 0.5) * 2.4;
          const v = 100 + r('v') * 260;
          return <circle key={i} cx={Math.cos(a) * v * k} cy={cy + 40 + Math.sin(a) * v * k + 600 * k * k} r={(10 + r('s') * 18) * (1 - k * 0.4)} fill="#8e1f3a" opacity={0.9} />;
        })}
      {k < 0.35 && <circle cx={0} cy={cy} r={60 + k * 300} fill="#fff" opacity={(0.35 - k) * 2} />}
    </g>
  );
};

/** Little leather bill folder with a paper slip. Origin = centre. */
export const BillFolder: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-110} y={-160} width={220} height={320} rx={14} fill="#3b2216" />
    <rect x={-92} y={-180} width={184} height={250} rx={4} fill="#fbf8f1" />
    <text x={0} y={-130} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#222" letterSpacing={3}>
      CONTA
    </text>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={-72} y={-100 + i * 24} width={70} height={8} fill="#bbb" />
        <rect x={34} y={-100 + i * 24} width={38} height={8} fill="#bbb" />
      </g>
    ))}
    <text x={0} y={50} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={34} fill="#c0262d">
      € 30 TAÇAS
    </text>
  </g>
);

/** Rocha's tablet (origin centre, landscape). `alarm` 0..1 shows the red ERRO screen. */
export const Tablet: React.FC<{x: number; y: number; s?: number; rot?: number; t: number; alarm?: number}> = ({x, y, s = 1, rot = 0, t, alarm = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-115} width={340} height={230} rx={22} fill="#15161b" />
    <rect x={-150} y={-96} width={300} height={192} rx={8} fill={alarm > 0.5 ? '#3a0c12' : '#0a1a36'} />
    {Array.from({length: 22}).map((_, i) => (
      <circle key={i} cx={-130 + random(`tb${i}`) * 260} cy={-80 + random(`tby${i}`) * 160} r={6} fill="#ff4a4a" opacity={0.5 + 0.5 * Math.sin(t * 20 + i)} />
    ))}
    {alarm > 0.5 && (
      <text x={0} y={18} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={58} fill="#ff5a5a" opacity={0.6 + 0.4 * Math.sin(t * 18)}>
        ERRO
      </text>
    )}
  </g>
);

/** Cartoon shoe print (heel + sole), pointing up. */
export const Footprint: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; flip?: boolean}> = ({x, y, s = 1, rot = 0, color = '#ffd23f', flip}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`}>
    <path d="M-26,-40 Q-34,-110 0,-118 Q34,-114 30,-50 Q26,-20 6,-14 Q-22,-14 -26,-40 Z" fill={color} />
    <ellipse cx={-2} cy={14} rx={24} ry={28} fill={color} />
  </g>
);

/** Small cartoon yacht (side view), origin at the waterline centre; ~320 units long. */
export const YachtIcon: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-30} rx={230} ry={110} fill="#ffd23f" opacity={0.25 * glow} />}
    <path d="M-160,0 L160,0 L120,36 L-140,36 Z" fill="#eef1f6" />
    <path d="M-160,0 L160,0 L152,10 L-156,10 Z" fill="#1b2446" />
    <path d="M-100,-56 L70,-56 Q110,-50 120,0 L-110,0 Z" fill="#dfe4ee" />
    <path d="M-60,-100 L30,-100 Q56,-96 64,-56 L-70,-56 Z" fill="#eef1f6" />
    {[0, 1, 2, 3, 4].map((k) => (
      <rect key={k} x={-88 + k * 36} y={-44} width={24} height={16} rx={3} fill="#ffd38a" />
    ))}
    <line x1={-20} y1={-100} x2={-20} y2={-160} stroke="#c9cfdb" strokeWidth={5} />
    <rect x={-140} y={40} width={280} height={6} fill="#ffd38a" opacity={0.35} />
  </g>
);
