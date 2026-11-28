import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../../lib/constants';
import {clamp, lerp} from '../../lib/anim';
import {useUid} from '../../lib/useUid';
import {HUD_FONT, CAPTION_FONT} from '../../lib/fonts';
import type {Lighting, Outfit, Tone} from '../../characters/types';

/* ------------------------------------------------------------------ lights */
export const GALA_LIGHT: Lighting = {side: 1, rim: '#ffc27a', rimStrength: 0.85, shadeStrength: 0.6};
export const WARM_LIGHT: Lighting = {side: -1, rim: '#ffcf8f', rimStrength: 0.9, shadeStrength: 0.5};
export const MARBLE_LIGHT: Lighting = {side: -1, rim: '#fff0d8', rimStrength: 0.6, shadeStrength: 0.55};
export const BLUE_LIGHT: Lighting = {side: 1, rim: '#7fd8ff', rimStrength: 0.9, shadeStrength: 0.7};

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/* ------------------------------------------------------------------ gala people */
const SKINS: Tone[] = [
  {base: '#e2b08c', shade: '#b07e5c', light: '#f5cfb0'},
  {base: '#8a5536', shade: '#5f361f', light: '#ad7451'},
  {base: '#c99068', shade: '#9a6343', light: '#e0b08a'},
  {base: '#f0c9a8', shade: '#c4987a', light: '#fde2cb'},
  {base: '#5e3a28', shade: '#3e2418', light: '#7d5039'},
];
const BLACK_LEGS: Tone = {base: '#15161a', shade: '#060607', light: '#34363e'};
const TUXEDO: Tone = {base: '#191a20', shade: '#09090c', light: '#3d3f48'};
const MIDNIGHT: Tone = {base: '#1d2747', shade: '#0f1529', light: '#3c4b7e'};
const PATENT: Tone = {base: '#0c0c0f', shade: '#000', light: '#8a8d96'};
const GOLD: Tone = {base: '#e2b04a', shade: '#a77a22', light: '#ffe08f'};
const SILVER: Tone = {base: '#c9ccd4', shade: '#8a8e98', light: '#fff'};

const man = (i: number, top: Tone, hair: 'quiff' | 'buzz' | 'bald', hairColor: string, beard = false): Outfit => ({
  skin: SKINS[i % SKINS.length],
  torso: 'suit',
  top,
  legs: BLACK_LEGS,
  shoes: 'dress',
  shoeColor: PATENT,
  gloves: false,
  head: {hair, hairColor, beard},
  neckwear: 'bow',
});
const woman = (i: number, dress: Tone, hairColor: string, shoe: Tone = GOLD): Outfit => ({
  skin: SKINS[i % SKINS.length],
  torso: 'dress',
  top: dress,
  legs: SKINS[i % SKINS.length],
  shoes: 'heels',
  shoeColor: shoe,
  gloves: false,
  head: {hair: 'curlyBun', hairColor, earrings: '#e6e9ef', lashes: true, lipstick: '#9b2c3c', browWidth: 12},
  armW: 50,
  legW: 54,
});

export const GUESTS: Outfit[] = [
  man(0, TUXEDO, 'quiff', '#5b3a22'),
  woman(1, {base: '#8e1f3a', shade: '#5e1025', light: '#c4456a'}, '#20130c'),
  man(2, MIDNIGHT, 'buzz', '#2a1d16', true),
  woman(3, {base: '#c9a24a', shade: '#8f6d24', light: '#f1d58a'}, '#c49a5c', SILVER),
  man(4, TUXEDO, 'bald', '#1a120e', true),
  woman(0, {base: '#20263f', shade: '#11152a', light: '#4a5590'}, '#5a3418'),
  man(3, TUXEDO, 'quiff', '#d4b06a'),
  woman(4, {base: '#f2ede4', shade: '#c7bfb0', light: '#fff'}, '#120b08'),
];

export const WAITER: Outfit = {
  skin: SKINS[2],
  torso: 'suit',
  top: {base: '#f1eee6', shade: '#c8c2b4', light: '#ffffff'},
  legs: BLACK_LEGS,
  shoes: 'dress',
  shoeColor: PATENT,
  gloves: false,
  head: {hair: 'buzz', hairColor: '#2b1d14'},
  neckwear: 'bow',
};

/* ------------------------------------------------------------------ props */

/** Champagne flute (local, ~110 px tall at scale 1, origin at the base). */
export const Flute: React.FC<{x: number; y: number; s?: number; fill?: number}> = ({x, y, s = 1, fill = 0.7}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={18} ry={5} fill="rgba(255,255,255,0.55)" />
    <rect x={-2} y={-46} width={4} height={46} fill="rgba(255,255,255,0.6)" />
    <path d="M -13,-112 L 13,-112 L 9,-50 Q 0,-42 -9,-50 Z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.75)" strokeWidth={2.5} />
    <path d={`M ${-13 + (1 - fill) * 4},${-50 - fill * 60} L ${13 - (1 - fill) * 4},${-50 - fill * 60} L 9,-50 Q 0,-42 -9,-50 Z`} fill="#f6d77a" opacity={0.85} />
    <circle cx={-3} cy={-70} r={2} fill="#fff" opacity={0.8} />
    <circle cx={3} cy={-85} r={1.6} fill="#fff" opacity={0.8} />
  </g>
);

/** Round table with a white tablecloth, candle + flutes. (x, y) = floor point, s = scale (1 ≈ 300 px wide). */
export const GalaTable: React.FC<{x: number; y: number; s: number; t: number; candle?: boolean; seed?: number}> = ({x, y, s, t, candle = true, seed = 0}) => {
  const fl = 0.85 + 0.15 * Math.sin(t * 17 + seed * 3);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={170} ry={26} fill="rgba(0,0,0,0.35)" />
      <path d="M -150,-230 L 150,-230 Q 172,-120 166,0 Q 0,22 -166,0 Q -172,-120 -150,-230 Z" fill="#f4f1ea" />
      <path d="M 70,-226 Q 110,-120 104,2" stroke="#d8d2c4" strokeWidth={10} fill="none" />
      <path d="M -60,-226 Q -84,-120 -80,6" stroke="#ddd6c9" strokeWidth={8} fill="none" />
      <path d="M 120,-226 Q 160,-120 158,0" stroke="#c9c1b0" strokeWidth={14} fill="none" opacity={0.7} />
      <ellipse cx={0} cy={-230} rx={150} ry={34} fill="#fbf9f4" />
      {candle && (
        <g>
          <rect x={-10} y={-300} width={20} height={70} rx={4} fill="#efe6cf" />
          <circle cx={0} cy={-312} r={46} fill="rgba(255,190,90,0.25)" />
          <path d={`M 0,${-300 - 26 * fl} Q 8,-306 0,-300 Q -8,-306 0,${-300 - 26 * fl} Z`} fill="#ffd37a" />
        </g>
      )}
      <Flute x={-70} y={-236} s={0.8} />
      <Flute x={58} y={-232} s={0.8} fill={0.4} />
    </g>
  );
};

/** Catenary string of warm bulbs from (x1,y1) to (x2,y2). `off` 0..1 = fraction of bulbs switched off (from the right). */
export const StringLights: React.FC<{x1: number; y1: number; x2: number; y2: number; sag: number; t: number; n?: number; off?: number; size?: number; seed?: string}> = ({
  x1,
  y1,
  x2,
  y2,
  sag,
  t,
  n = 14,
  off = 0,
  size = 1,
  seed = 'sl',
}) => {
  const pts = Array.from({length: n}).map((_, i) => {
    const u = (i + 0.5) / n;
    return [lerp(x1, x2, u), lerp(y1, y2, u) + Math.sin(u * Math.PI) * sag] as [number, number];
  });
  return (
    <g>
      <path d={`M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + sag * 2} ${x2},${y2}`} stroke="#1a1410" strokeWidth={3 * size} fill="none" />
      {pts.map(([x, y], i) => {
        const on = i / n < 1 - off ? 1 : 0;
        const tw = 0.85 + 0.15 * Math.sin(t * 5 + random(`${seed}${i}`) * 20);
        return (
          <g key={i}>
            {on > 0 && <circle cx={x} cy={y + 8 * size} r={34 * size} fill={`rgba(255,196,110,${0.18 * tw})`} />}
            <ellipse cx={x} cy={y + 8 * size} rx={7 * size} ry={10 * size} fill={on ? '#ffe2a0' : '#3a3026'} />
            {on > 0 && <circle cx={x - 2 * size} cy={y + 5 * size} r={3 * size} fill="#fff" />}
          </g>
        );
      })}
    </g>
  );
};

/** Restroom door with a gold WC plaque. (x, y) = bottom-left, w x h px. `open` 0..1 swings it inward (narrows). `glow` = blue rastro light from inside. */
export const WcDoor: React.FC<{x: number; y: number; w: number; h: number; open?: number; glow?: number; wood?: string; plaque?: string; frame?: string}> = ({
  x,
  y,
  w,
  h,
  open = 0,
  glow = 0,
  wood = '#4a2c1e',
  plaque = '#e2b04a',
  frame = '#d8cbb4',
}) => {
  const gid = useUid('wcglow');
  const dw = w * Math.cos(open * 1.25);
  return (
    <g>
      <defs>
        <radialGradient id={gid} cx="0.5" cy="1" r="0.9">
          <stop offset="0" stopColor="#bff0ff" stopOpacity={0.95} />
          <stop offset="0.35" stopColor="#4cc6ff" stopOpacity={0.6} />
          <stop offset="1" stopColor="#1a5cff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={x - 18} y={y - h - 18} width={w + 36} height={h + 18} fill={frame} />
      <rect x={x} y={y - h} width={w} height={h} fill={open > 0.01 ? '#0d1a2a' : wood} />
      {open > 0.01 && glow > 0 && <rect x={x} y={y - h} width={w} height={h} fill={`url(#${gid})`} opacity={glow} />}
      <g>
        <path d={`M${x},${y - h} L${x + dw},${y - h + open * 26} L${x + dw},${y - open * 12} L${x},${y} Z`} fill={wood} />
        <rect x={x + dw * 0.12} y={y - h * 0.9} width={dw * 0.76} height={h * 0.34} rx={6} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={6} />
        <rect x={x + dw * 0.12} y={y - h * 0.48} width={dw * 0.76} height={h * 0.38} rx={6} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={6} />
        <circle cx={x + dw * 0.86} cy={y - h * 0.5} r={Math.max(2, 9 * (dw / w))} fill={plaque} />
        {dw > w * 0.4 && (
          <g>
            <rect x={x + dw / 2 - 44 * (dw / w)} y={y - h * 0.82} width={88 * (dw / w)} height={44} rx={8} fill={plaque} />
            <text x={x + dw / 2} y={y - h * 0.82 + 33} fontFamily={HUD_FONT} fontWeight={700} fontSize={30} fill="#3a2410" textAnchor="middle" transform={`scale(1,1)`}>
              WC
            </text>
          </g>
        )}
      </g>
      {/* glow spilling under / around the door */}
      {glow > 0 && open < 0.02 && (
        <g>
          <rect x={x + 6} y={y - 8} width={w - 12} height={10} fill="#bff0ff" opacity={glow} />
          <ellipse cx={x + w / 2} cy={y + 6} rx={w * 0.8} ry={40} fill={`url(#${gid})`} opacity={glow} />
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ Monaco terrace */

/**
 * Monaco rooftop terrace at dusk/night: sky, lit hills, sea with yachts, stone balustrade, terracotta floor,
 * string lights. `px` = camera pan in px (layers parallax), `night` 0 dusk .. 1 night. Characters/tables go on top.
 */
export const Terrace: React.FC<{t: number; px?: number; night?: number; lightsOff?: number; horizon?: number; children?: React.ReactNode; blurBg?: number}> = ({
  t,
  px = 0,
  night = 0,
  lightsOff = 0,
  horizon = 900,
  children,
  blurBg = 0,
}) => {
  const id = useUid('ter');
  const hz = horizon;
  const rail = hz + 190;
  const skyTop = `hsl(${lerp(232, 230, night)},${lerp(45, 50, night)}%,${lerp(20, 9, night)}%)`;
  const skyMid = `hsl(${lerp(290, 250, night)},${lerp(35, 35, night)}%,${lerp(38, 18, night)}%)`;
  const skyLow = `hsl(${lerp(22, 260, night)},${lerp(85, 35, night)}%,${lerp(62, 26, night)}%)`;
  const yachts = [
    {x: 140, s: 0.9, y: 40},
    {x: 520, s: 0.6, y: 18},
    {x: 820, s: 1.1, y: 58},
    {x: 1260, s: 0.7, y: 26},
    {x: -200, s: 0.75, y: 30},
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: blurBg ? `blur(${blurBg}px)` : undefined}}>
        <Svg>
          <defs>
            <linearGradient id={id + 's'} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={skyTop} />
              <stop offset={0.62} stopColor={skyMid} />
              <stop offset={1} stopColor={skyLow} />
            </linearGradient>
            <linearGradient id={id + 'w'} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={`hsl(${lerp(320, 230, night)},30%,${lerp(40, 20, night)}%)`} />
              <stop offset="1" stopColor={`hsl(225,45%,${lerp(16, 9, night)}%)`} />
            </linearGradient>
            <linearGradient id={id + 'f'} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#6b3a2a" />
              <stop offset="1" stopColor="#2e1712" />
            </linearGradient>
          </defs>
          <rect x={-600} y={0} width={W + 1200} height={hz + 4} fill={`url(#${id}s)`} />
          {/* stars */}
          {Array.from({length: 40}).map((_, i) => (
            <circle key={i} cx={random(`st${i}`) * 2200 - 560 + px * 0.05} cy={random(`sy${i}`) * hz * 0.75} r={1 + random(`sr${i}`) * 1.6} fill="#fff" opacity={night * (0.4 + 0.5 * Math.sin(t * 3 + i))} />
          ))}
          {/* sunset glow */}
          <ellipse cx={760 + px * 0.08} cy={hz} rx={700} ry={140} fill="#ffb070" opacity={0.35 * (1 - night)} />
          {/* hills with lights */}
          <g transform={`translate(${px * 0.15},0)`}>
            <path d={`M -700,${hz} L -700,${hz - 210} Q -400,${hz - 330} -120,${hz - 240} Q 160,${hz - 150} 340,${hz - 90} L 560,${hz - 40} L 560,${hz} Z`} fill={`hsl(250,25%,${lerp(20, 10, night)}%)`} />
            <path d={`M 400,${hz} Q 700,${hz - 120} 1000,${hz - 170} Q 1300,${hz - 220} 1800,${hz - 150} L 1800,${hz} Z`} fill={`hsl(255,22%,${lerp(24, 12, night)}%)`} />
            {Array.from({length: 90}).map((_, i) => {
              const xx = random(`hl${i}`) * 2400 - 700;
              const top = xx < 480 ? hz - 220 + (xx + 700) * 0.12 : hz - 160 + Math.abs(xx - 1100) * 0.05;
              const yy = lerp(top + 20, hz - 6, random(`hy${i}`));
              return <rect key={i} x={xx} y={yy} width={4} height={3} fill={random(`hc${i}`) > 0.3 ? '#ffd890' : '#fff4dc'} opacity={0.45 + 0.5 * night} />;
            })}
          </g>
          {/* sea */}
          <rect x={-600} y={hz} width={W + 1200} height={rail - hz + 40} fill={`url(#${id}w)`} />
          <g transform={`translate(${px * 0.3},0)`}>
            {Array.from({length: 26}).map((_, i) => {
              const yy = hz + 8 + random(`wy${i}`) * (rail - hz - 20);
              const xx = random(`wx${i}`) * 2000 - 500 + Math.sin(t * 1.2 + i) * 14;
              return <rect key={i} x={xx} y={yy} width={30 + random(`ww${i}`) * 90} height={3} rx={2} fill="#ffcf9a" opacity={0.18 + 0.2 * Math.sin(t * 2 + i * 1.7)} />;
            })}
            {yachts.map((y, i) => (
              <g key={i} transform={`translate(${y.x + Math.sin(t * 0.5 + i) * 6},${hz + y.y}) scale(${y.s})`}>
                <path d="M -90,0 L 100,0 L 80,22 L -70,22 Z" fill="#eef0f4" />
                <path d="M -50,-22 L 50,-22 L 66,0 L -60,0 Z" fill="#dfe3ea" />
                <path d="M -26,-38 L 24,-38 L 34,-22 L -32,-22 Z" fill="#cfd4dc" />
                {[-40, -20, 0, 20, 40].map((k) => (
                  <rect key={k} x={k - 6} y={-14} width={12} height={6} fill="#ffd27a" />
                ))}
                <line x1={0} y1={-38} x2={0} y2={-90} stroke="#cfd4dc" strokeWidth={3} />
                <circle cx={0} cy={-90} r={4} fill="#ff6a5a" opacity={0.6 + 0.4 * Math.sin(t * 4 + i)} />
                <rect x={-80} y={26} width={170} height={4} fill="#ffd27a" opacity={0.35} />
                <rect x={-60} y={36} width={120} height={3} fill="#ffd27a" opacity={0.2} />
              </g>
            ))}
          </g>
        </Svg>
      </AbsoluteFill>
      <Svg>
        {/* balustrade */}
        <g transform={`translate(${px * 0.6},0)`}>
          <rect x={-800} y={rail - 6} width={W + 1600} height={26} fill="#e9dcc6" />
          {Array.from({length: 46}).map((_, i) => {
            const bx = -800 + i * 60;
            return <path key={i} d={`M${bx + 18},${rail + 20} q -10,40 4,70 q 14,30 -4,70 L ${bx + 42},${rail + 160} q -18,-40 -4,-70 q 14,-30 4,-70 Z`} fill="#d9c9ae" />;
          })}
          <rect x={-800} y={rail + 160} width={W + 1600} height={22} fill="#cdbb9c" />
        </g>
        {/* floor */}
        <rect x={-600} y={rail + 182} width={W + 1200} height={H - rail} fill={`url(#${id}f)`} />
        <g transform={`translate(${px},0)`} opacity={0.35}>
          {Array.from({length: 30}).map((_, i) => {
            const xx = -1200 + i * 120;
            return <line key={i} x1={xx * 0.4 + 540 * 0.6} y1={rail + 182} x2={xx * 1.8 - 540 * 0.8} y2={H} stroke="#2a130e" strokeWidth={3} />;
          })}
          {Array.from({length: 9}).map((_, i) => {
            const yy = rail + 182 + Math.pow(i / 8, 1.8) * (H - rail - 182);
            return <line key={i} x1={-1000} y1={yy} x2={2200} y2={yy} stroke="#2a130e" strokeWidth={3} />;
          })}
        </g>
        {/* warm floor pools */}
        <ellipse cx={540 + px * 0.8} cy={rail + 420} rx={700} ry={200} fill="rgba(255,170,90,0.12)" />
        {/* string lights */}
        <g transform={`translate(${px * 0.85},0)`}>
          <StringLights x1={-500} y1={hz - 520} x2={700} y2={hz - 600} sag={150} t={t} off={lightsOff} seed="a" />
          <StringLights x1={600} y1={hz - 620} x2={1700} y2={hz - 500} sag={140} t={t} off={lightsOff} seed="b" />
          <StringLights x1={-300} y1={hz - 330} x2={1400} y2={hz - 380} sag={120} t={t} off={lightsOff} n={18} seed="c" size={1.2} />
        </g>
      </Svg>
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ bar counter */

/** Backlit bar: bottle shelves + counter front (counter top at `top`). `px` parallax pan. */
export const BarBack: React.FC<{t: number; px?: number; off?: number}> = ({t, px = 0, off = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#1b0f12 0%,#3a1d16 40%,#6b3a1e 70%,#2a1410 100%)'}}>
    <Svg>
      <g transform={`translate(${px * 0.5},0)`}>
        {[700, 900, 1100].map((sy, r) => (
          <g key={sy}>
            <rect x={-500} y={sy} width={2200} height={16} fill="#c99a5a" opacity={0.85} />
            <rect x={-500} y={sy - 180} width={2200} height={180} fill="rgba(255,170,80,0.10)" />
            {Array.from({length: 24}).map((_, i) => {
              const bx = -480 + i * 92 + (r % 2) * 40;
              const hh = 110 + random(`bh${r}${i}`) * 60;
              const hue = random(`bc${r}${i}`);
              const col = hue < 0.3 ? '#3d6b3a' : hue < 0.55 ? '#7a3a1c' : hue < 0.8 ? '#b9822f' : '#d9d2c2';
              return (
                <g key={i} opacity={1 - off * 0.6}>
                  <path d={`M${bx},${sy} L${bx},${sy - hh * 0.62} Q${bx},${sy - hh * 0.72} ${bx + 12},${sy - hh * 0.78} L${bx + 12},${sy - hh} L${bx + 24},${sy - hh} L${bx + 24},${sy - hh * 0.78} Q${bx + 36},${sy - hh * 0.72} ${bx + 36},${sy - hh * 0.62} L${bx + 36},${sy} Z`} fill={col} opacity={0.9} />
                  <rect x={bx + 4} y={sy - hh * 0.5} width={28} height={hh * 0.22} fill="#f2e6cc" opacity={0.7} />
                  <rect x={bx + 6} y={sy - hh * 0.6} width={5} height={hh * 0.5} fill="#fff" opacity={0.35} />
                </g>
              );
            })}
          </g>
        ))}
        {/* warm sconces */}
        {[-200, 260, 720, 1180].map((x, i) => (
          <circle key={x} cx={x} cy={560} r={120} fill={`rgba(255,190,110,${(0.16 + 0.03 * Math.sin(t * 3 + i)) * (1 - off)})`} />
        ))}
      </g>
    </Svg>
  </AbsoluteFill>
);

export const BarCounter: React.FC<{top: number; px?: number}> = ({top, px = 0}) => (
  <Svg>
    <g transform={`translate(${px},0)`}>
      <rect x={-600} y={top} width={2400} height={34} rx={8} fill="#2a1710" />
      <rect x={-600} y={top} width={2400} height={8} fill="#d8a960" opacity={0.8} />
      <rect x={-600} y={top + 34} width={2400} height={H - top} fill="#3b2116" />
      {Array.from({length: 30}).map((_, i) => (
        <rect key={i} x={-600 + i * 90} y={top + 50} width={70} height={H} fill="#4a2a1c" />
      ))}
      <rect x={-600} y={top + 34} width={2400} height={30} fill="rgba(0,0,0,0.4)" />
      <rect x={-600} y={top + 300} width={2400} height={14} fill="#c99a5a" opacity={0.7} />
    </g>
  </Svg>
);

/* ------------------------------------------------------------------ stall / public restroom */

/** Public restroom wall of stall doors (tiles + partitions). `doorOpen` per door index 0..1, `glow` for the door at `glowIdx`. */
export const StallRow: React.FC<{t: number; px?: number; doors?: number; doorW?: number; floorY?: number; doorOpen?: number[]; glowIdx?: number; glow?: number; tint?: string}> = ({
  t,
  px = 0,
  doors = 4,
  doorW = 300,
  floorY = 1600,
  doorOpen = [],
  glowIdx = 1,
  glow = 0,
  tint = '#2b3b45',
}) => {
  const gid = useUid('stg');
  const x0 = 540 - (doors * (doorW + 26)) / 2 + px;
  const dh = 980;
  return (
    <AbsoluteFill style={{background: '#cfd8d6'}}>
      <Svg>
        <defs>
          <radialGradient id={gid} cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#c8f4ff" stopOpacity={1} />
            <stop offset="0.3" stopColor="#4cc6ff" stopOpacity={0.6} />
            <stop offset="1" stopColor="#1a5cff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* subway tiles */}
        <g transform={`translate(${px * 0.7},0)`} opacity={0.5}>
          {Array.from({length: 40}).map((_, r) => (
            <line key={r} x1={-600} y1={r * 48} x2={1800} y2={r * 48} stroke="#9fb0ae" strokeWidth={3} />
          ))}
          {Array.from({length: 40}).map((_, r) =>
            Array.from({length: 26}).map((__, c) => <line key={`${r}-${c}`} x1={-600 + c * 96 + (r % 2) * 48} y1={r * 48} x2={-600 + c * 96 + (r % 2) * 48} y2={r * 48 + 48} stroke="#9fb0ae" strokeWidth={3} />),
          )}
        </g>
        {/* floor */}
        <rect x={-600} y={floorY} width={2400} height={H - floorY} fill="#55606a" />
        {Array.from({length: 18}).map((_, i) => (
          <line key={i} x1={-600 + i * 140 + px} y1={floorY} x2={-1200 + i * 280 + px * 1.6} y2={H} stroke="#3e464e" strokeWidth={4} />
        ))}
        {Array.from({length: doors}).map((_, i) => {
          const dx = x0 + i * (doorW + 26);
          const o = doorOpen[i] ?? 0;
          const g = i === glowIdx ? glow : 0;
          const w = doorW * Math.cos(o * 1.2);
          return (
            <g key={i}>
              {/* partition */}
              <rect x={dx - 26} y={floorY - dh - 40} width={26} height={dh - 30} fill="#47596a" />
              <rect x={dx - 26} y={floorY - dh - 40} width={8} height={dh - 30} fill="#6a7f94" />
              {/* stall dark inside */}
              <rect x={dx} y={floorY - dh} width={doorW} height={dh - 120} fill="#1a2128" />
              {g > 0 && <rect x={dx} y={floorY - dh} width={doorW} height={dh - 120} fill="#4cc6ff" opacity={g * 0.35 * clamp(o * 4)} />}
              {/* door */}
              <rect x={dx} y={floorY - dh} width={w} height={dh - 120} rx={4} fill={tint} />
              <rect x={dx} y={floorY - dh} width={Math.max(0, w)} height={10} fill="#6a7f94" opacity={0.6} />
              <rect x={dx + w - 50 * (w / doorW)} y={floorY - dh * 0.55} width={26 * (w / doorW)} height={60} rx={6} fill="#b8c2cc" />
              <rect x={dx + w - 46 * (w / doorW)} y={floorY - dh * 0.55 + 22} width={18 * (w / doorW)} height={16} rx={3} fill={g > 0.2 ? '#e0473f' : '#3fbf6a'} />
              {/* gap under the door + glow */}
              {g > 0 && (
                <g>
                  <rect x={dx + 4} y={floorY - 120} width={doorW - 8} height={120} fill={`url(#${gid})`} opacity={g} />
                  <ellipse cx={dx + doorW / 2} cy={floorY + 30} rx={doorW * 0.9} ry={60} fill="#4cc6ff" opacity={g * 0.45} />
                  <rect x={dx + 10} y={floorY - 8} width={doorW - 20} height={8} fill="#e8fbff" opacity={g * (0.7 + 0.3 * Math.sin(t * 40))} />
                </g>
              )}
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ marble restroom */

/** Luxury marble restroom wall: veined marble, gold-framed mirror area (mx,my,mw,mh), black counter with sinks. */
export const MarbleRoom: React.FC<{t: number; px?: number; counterY?: number; mirror?: [number, number, number, number]; reflection?: React.ReactNode; crack?: number}> = ({
  t,
  px = 0,
  counterY = 1280,
  mirror = [90, 300, 900, 900],
  reflection,
  crack = 0,
}) => {
  const id = useUid('mr');
  const [mx, my, mw, mh] = mirror;
  return (
    <AbsoluteFill style={{background: '#efe9e1'}}>
      <Svg>
        <defs>
          <linearGradient id={id + 'm'} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#f6f1ea" />
            <stop offset="1" stopColor="#d9d0c4" />
          </linearGradient>
          <clipPath id={id + 'c'}>
            <rect x={mx} y={my} width={mw} height={mh} rx={12} />
          </clipPath>
        </defs>
        <g transform={`translate(${px * 0.5},0)`}>
          <rect x={-600} y={0} width={2400} height={H} fill={`url(#${id}m)`} />
          {Array.from({length: 14}).map((_, i) => {
            const x = random(`mv${i}`) * 2200 - 600;
            const y = random(`mvy${i}`) * 1800;
            return (
              <path
                key={i}
                d={`M${x},${y} q ${60 + random(`a${i}`) * 80},${40} ${110},${130} t ${140},${120} t ${90},${160}`}
                stroke="#b3a898"
                strokeWidth={2 + random(`w${i}`) * 3}
                fill="none"
                opacity={0.5}
              />
            );
          })}
          {/* slab seams */}
          {[-300, 300, 900, 1500].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={H} stroke="#cfc4b5" strokeWidth={3} />
          ))}
          {/* sconces */}
          {[mx - 30, mx + mw + 30].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={my + 160} r={150} fill="rgba(255,214,150,0.22)" />
              <rect x={x - 10} y={my + 120} width={20} height={90} rx={8} fill="#c99a3a" />
              <ellipse cx={x} cy={my + 112} rx={30} ry={42} fill="#fff1d0" />
            </g>
          ))}
        </g>
        {/* mirror */}
        <g transform={`translate(${px * 0.7},0)`}>
          <rect x={mx - 22} y={my - 22} width={mw + 44} height={mh + 44} rx={22} fill="#c9962e" />
          <rect x={mx - 10} y={my - 10} width={mw + 20} height={mh + 20} rx={16} fill="#8a6214" />
          <rect x={mx} y={my} width={mw} height={mh} rx={12} fill="#b9c6c9" />
        </g>
      </Svg>
      {reflection && (
        <AbsoluteFill style={{clipPath: `inset(${my}px ${W - mx - mw - px * 0.7}px ${H - my - mh}px ${mx + px * 0.7}px round 12px)`}}>
          {reflection}
          <AbsoluteFill style={{background: 'linear-gradient(125deg, rgba(220,240,255,0.18) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.12) 55%, rgba(255,255,255,0) 70%)'}} />
        </AbsoluteFill>
      )}
      <Svg>
        <g transform={`translate(${px * 0.7},0)`}>
          {crack > 0 && (
            <g stroke="#fff" strokeWidth={4} fill="none" opacity={crack} clipPath={`url(#${id}c)`}>
              {Array.from({length: 9}).map((_, i) => {
                const a = (i / 9) * Math.PI * 2 + 0.3;
                const cx = mx + mw * 0.5;
                const cy = my + mh * 0.4;
                const L = 600 * crack;
                return <path key={i} d={`M${cx},${cy} L${cx + Math.cos(a) * L * 0.4},${cy + Math.sin(a) * L * 0.4 + 20} L${cx + Math.cos(a + 0.1) * L},${cy + Math.sin(a + 0.1) * L}`} />;
              })}
            </g>
          )}
        </g>
        {/* counter */}
        <g transform={`translate(${px},0)`}>
          <rect x={-600} y={counterY} width={2400} height={60} fill="#17171b" />
          <rect x={-600} y={counterY} width={2400} height={10} fill="#5a5a66" />
          {Array.from({length: 6}).map((_, i) => (
            <path key={i} d={`M${-500 + i * 420},${counterY + 20} q 80,10 160,30`} stroke="#3a3a44" strokeWidth={3} fill="none" />
          ))}
          <rect x={-600} y={counterY + 60} width={2400} height={H - counterY} fill="#2b2a2f" />
          <rect x={-600} y={counterY + 60} width={2400} height={30} fill="rgba(0,0,0,0.45)" />
          {/* sinks + faucets */}
          {[-160, 540, 1240].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={counterY + 4} rx={150} ry={22} fill="#e9e6e0" />
              <ellipse cx={x} cy={counterY + 4} rx={130} ry={14} fill="#c4bfb6" />
              <path d={`M${x - 10},${counterY - 6} L${x - 10},${counterY - 120} Q${x - 10},${counterY - 150} ${x + 30},${counterY - 150} L${x + 70},${counterY - 150} L${x + 70},${counterY - 128} L${x + 30},${counterY - 128} Q${x + 12},${counterY - 128} ${x + 12},${counterY - 110} L${x + 12},${counterY - 6} Z`} fill="#d9a943" />
              <path d={`M${x - 6},${counterY - 130} L${x - 6},${counterY - 20}`} stroke="#ffe7a8" strokeWidth={4} opacity={0.8} />
            </g>
          ))}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ city vibes */

/** Lisbon vibe: azulejo wall, steep street, yellow tram. `tram` 0..1 drives the tram across. */
export const Lisbon: React.FC<{t: number; px?: number; tram?: number}> = ({t, px = 0, tram = 0.5}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#f5b77c 0%,#f7d9a8 45%,#9ad0e6 100%)'}}>
    <Svg>
      <g transform={`translate(${px * 0.4},0)`}>
        {/* azulejo buildings */}
        {[
          [-300, 380, '#2f6db3'],
          [180, 300, '#f2e8d8'],
          [520, 420, '#2a5f9e'],
          [900, 340, '#e7c35a'],
          [1240, 380, '#2f6db3'],
        ].map(([x, top, c], i) => (
          <g key={i}>
            <rect x={x as number} y={top as number} width={360} height={1400} fill={c as string} />
            {c !== '#f2e8d8' && c !== '#e7c35a' &&
              Array.from({length: 22}).map((_, r) =>
                Array.from({length: 7}).map((__, k) => (
                  <g key={`${r}-${k}`}>
                    <rect x={(x as number) + k * 52 + 4} y={(top as number) + r * 52 + 4} width={44} height={44} fill="#e9f0f8" opacity={0.9} />
                    <circle cx={(x as number) + k * 52 + 26} cy={(top as number) + r * 52 + 26} r={12} fill="none" stroke={c as string} strokeWidth={5} />
                    <path d={`M${(x as number) + k * 52 + 8},${(top as number) + r * 52 + 26} L${(x as number) + k * 52 + 44},${(top as number) + r * 52 + 26}`} stroke={c as string} strokeWidth={3} />
                  </g>
                )),
              )}
            {Array.from({length: 6}).map((_, r) => (
              <g key={'w' + r}>
                <rect x={(x as number) + 60} y={(top as number) + 80 + r * 200} width={90} height={130} fill="#3b2a22" />
                <rect x={(x as number) + 210} y={(top as number) + 80 + r * 200} width={90} height={130} fill="#3b2a22" />
                <rect x={(x as number) + 52} y={(top as number) + 206 + r * 200} width={106} height={12} fill="#1d1d22" />
                <rect x={(x as number) + 202} y={(top as number) + 206 + r * 200} width={106} height={12} fill="#1d1d22" />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* street + rails */}
      <path d="M -400,1500 L 1500,1300 L 1500,1920 L -400,1920 Z" fill="#8c8478" />
      <path d="M -400,1640 L 1500,1440" stroke="#5a5550" strokeWidth={8} />
      <path d="M -400,1720 L 1500,1520" stroke="#5a5550" strokeWidth={8} />
      {/* tram */}
      <g transform={`translate(${lerp(1300, -500, tram) + px},${1700 - ((lerp(1300, -500, tram) + 400) * 200) / 1900}) rotate(-6)`}>
        <rect x={0} y={-330} width={560} height={300} rx={26} fill="#f4c21b" />
        <rect x={0} y={-90} width={560} height={60} fill="#c7262b" />
        <rect x={-6} y={-350} width={572} height={30} rx={12} fill="#f7f1e2" />
        {Array.from({length: 5}).map((_, i) => (
          <rect key={i} x={30 + i * 104} y={-300} width={84} height={120} rx={8} fill="#2a3b4a" />
        ))}
        <text x={280} y={-345} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={22} fill="#333">
          28 · PRAZERES
        </text>
        <line x1={280} y1={-350} x2={320} y2={-470} stroke="#222" strokeWidth={6} />
        <circle cx={80} cy={-20} r={30} fill="#222" />
        <circle cx={480} cy={-20} r={30} fill="#222" />
      </g>
    </Svg>
  </AbsoluteFill>
);

/** Buenos Aires (Caminito) vibe: colourful corrugated houses, balconies. */
export const BuenosAires: React.FC<{t: number; px?: number}> = ({t, px = 0}) => {
  const cols = ['#e2483d', '#2f7fd1', '#f2c230', '#3aa66b', '#e77fb0', '#f08a2a', '#4bb3c7'];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#7fc6f2 0%,#cfe9f7 60%,#f3e7c8 100%)'}}>
      <Svg>
        <g transform={`translate(${px * 0.5},0)`}>
          {Array.from({length: 9}).map((_, i) => {
            const x = -500 + i * 260;
            const top = 420 + (i % 3) * 90;
            const c = cols[i % cols.length];
            const c2 = cols[(i + 3) % cols.length];
            return (
              <g key={i}>
                <rect x={x} y={top} width={260} height={1400} fill={c} />
                {Array.from({length: 14}).map((__, k) => (
                  <line key={k} x1={x + k * 19} y1={top} x2={x + k * 19} y2={top + 1400} stroke="rgba(0,0,0,0.12)" strokeWidth={4} />
                ))}
                <rect x={x} y={top + 560} width={260} height={840} fill={c2} />
                <rect x={x + 60} y={top + 120} width={140} height={200} fill="#2d2a33" />
                <rect x={x + 40} y={top + 320} width={180} height={14} fill="#1d1d22" />
                {Array.from({length: 8}).map((__, k) => (
                  <line key={'b' + k} x1={x + 46 + k * 24} y1={top + 334} x2={x + 46 + k * 24} y2={top + 400} stroke="#1d1d22" strokeWidth={4} />
                ))}
                <rect x={x + 40} y={top + 396} width={180} height={8} fill="#1d1d22" />
                <rect x={x + 70} y={top + 700} width={120} height={260} fill="#3a2a22" />
                <path d={`M${x - 10},${top} L${x + 270},${top} L${x + 260},${top - 30} L${x},${top - 30} Z`} fill="#5a5560" />
              </g>
            );
          })}
        </g>
        <rect x={-600} y={1560} width={2400} height={400} fill="#a89c88" />
        {Array.from({length: 20}).map((_, i) => (
          <line key={i} x1={-600 + i * 130 + px} y1={1560} x2={-900 + i * 200 + px * 1.4} y2={1920} stroke="#8a7f6c" strokeWidth={4} />
        ))}
        {/* bunting */}
        <path d={`M -100,${360 + Math.sin(t * 2) * 6} Q 540,520 1180,${360 + Math.cos(t * 2) * 6}`} stroke="#333" strokeWidth={3} fill="none" />
        {Array.from({length: 16}).map((_, i) => {
          const u = i / 15;
          const x = lerp(-100, 1180, u);
          const y = 360 + Math.sin(u * Math.PI) * 80;
          return <path key={i} d={`M${x - 18},${y} L${x + 18},${y} L${x},${y + 40} Z`} fill={cols[i % cols.length]} />;
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ stamps / HUD bits */

/** Passport-style city stamp. `k` 0..1 slam progress. */
export const CityStamp: React.FC<{x: number; y: number; text: string; sub?: string; color?: string; k: number; rot?: number}> = ({x, y, text, sub, color = '#d23c3c', k, rot = -8}) => {
  if (k <= 0) return null;
  const s = lerp(2.4, 1, clamp(k));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: clamp(k * 3),
        border: `8px solid ${color}`,
        borderRadius: 22,
        padding: '10px 30px 6px',
        color,
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: 78,
        letterSpacing: 4,
        lineHeight: 1,
        textAlign: 'center',
        background: 'rgba(255,250,240,0.18)',
        mixBlendMode: 'multiply',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      {sub && <div style={{fontFamily: HUD_FONT, fontSize: 30, letterSpacing: 6, marginTop: 4}}>{sub}</div>}
    </div>
  );
};

/** Big HUD tag in the series style: tiny label + big value (no leader). */
export const HudTag: React.FC<{x: number; y: number; label: string; value: string; k: number; align?: 'left' | 'right' | 'center'; color?: string; size?: number}> = ({
  x,
  y,
  label,
  value,
  k,
  align = 'left',
  color = '#fff',
  size = 96,
}) => {
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'left' ? 0 : align === 'right' ? -100 : -50}%,0) translateY(${(1 - clamp(k)) * 30}px)`,
        opacity: clamp(k),
        color,
        fontFamily: HUD_FONT,
        textAlign: align,
        textShadow: '0 3px 10px rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{fontSize: size * 0.3, letterSpacing: 6, fontWeight: 700, opacity: 0.85}}>{label}</div>
      <div style={{fontSize: size, fontWeight: 700, lineHeight: 1}}>{value}</div>
    </div>
  );
};
