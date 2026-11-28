import React from 'react';
import {random} from 'remotion';
import {DEFAULT_POSE, Puppet, PuppetProps} from '../characters/Puppet';
import type {Outfit, Pose, Tone} from '../characters/types';
import {H, W} from '../lib/constants';

/**
 * EP03 "Modo Vibra" cast (shared by parts A and B):
 * - Bruno, the #1 rival (big, huge arms, smirk, academy blazer with gold trim + "#1" patch)
 * - academy students (navy blazer uniform with the gold emblem patch), deterministic variety by seed
 * - mom / kid Davi reused from EP02
 * - Davi vibration helpers: `vibe()` jitter offset and <VibeLines/> (the "(( ))" phone-vibration marks)
 */
export {PlacedMom, MOM_OUTFIT, Mom, PlacedKidDavi, HeadFrame, Bust} from '../ep02qi/characters';

const HIP_Y = -480;

/* ------------------------------------------------------------------ academy palette */

export const ACADEMY = {
  navy: '#1f2f5c',
  navyDark: '#141f3f',
  navyLight: '#3a4f8a',
  gold: '#e8b84a',
  goldDark: '#a87a1c',
  crimson: '#b8323a',
  stone: '#d9cdb6',
  stoneDark: '#b3a385',
};

const NAVY: Tone = {base: ACADEMY.navy, shade: ACADEMY.navyDark, light: ACADEMY.navyLight};
const GREY_LEGS: Tone = {base: '#4a5060', shade: '#30343f', light: '#6d7486'};
const WHITE_SNEAKER: Tone = {base: '#eceae4', shade: '#b9b6ad', light: '#ffffff'};

/** Small academy emblem (shield + lightning star). Centred at 0,0, ~`s` px tall. */
export const EmblemMark: React.FC<{s?: number; fill?: string; stroke?: string; accent?: string}> = ({s = 100, fill = ACADEMY.gold, stroke = ACADEMY.goldDark, accent = ACADEMY.navy}) => {
  const k = s / 100;
  return (
    <g transform={`scale(${k})`}>
      <path d="M 0,-50 L 40,-38 Q 42,10 0,50 Q -42,10 -40,-38 Z" fill={fill} stroke={stroke} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 0,-36 L 28,-27 Q 29,6 0,36 Q -29,6 -28,-27 Z" fill={accent} />
      {/* bolt */}
      <path d="M 6,-28 L -12,4 L 0,4 L -6,28 L 14,-6 L 2,-6 Z" fill={fill} />
    </g>
  );
};

/** Draws children in the puppet's TORSO frame (follows bob + lean). Units = puppet units (feet at 0,0). */
export const TorsoFrame: React.FC<{pose?: Pose; children: React.ReactNode}> = ({pose = {}, children}) => {
  const p = {...DEFAULT_POSE, ...pose};
  return <g transform={`translate(0,${p.bob}) rotate(${p.lean} 0 ${HIP_Y})`}>{children}</g>;
};

/* ------------------------------------------------------------------ students */

const SKINS: Tone[] = [
  {base: '#f0c8a8', shade: '#c49a78', light: '#ffe2cc'},
  {base: '#d6a07a', shade: '#a6714f', light: '#f0c29e'},
  {base: '#b47a52', shade: '#835236', light: '#d29a72'},
  {base: '#8a5536', shade: '#603823', light: '#a87252'},
  {base: '#5e3a26', shade: '#3e2416', light: '#7c5440'},
];
const HAIRS = ['quiff', 'buzz', 'curlyBun', 'buzz', 'bald'] as const;
const HAIR_COLORS = ['#1e130d', '#3a2416', '#6b4a2a', '#c79a4a', '#2b1810', '#8a3b1e'];

/** Deterministic academy student (navy blazer uniform, grey trousers, white sneakers). */
export const studentOutfit = (seed: number): Outfit => {
  const r = (k: number) => {
    const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const hair = HAIRS[Math.floor(r(2) * HAIRS.length)];
  return {
    skin: SKINS[Math.floor(r(1) * SKINS.length)],
    torso: 'suit',
    top: NAVY,
    legs: GREY_LEGS,
    shoes: 'sneaker',
    shoeColor: WHITE_SNEAKER,
    gloves: false,
    head: {hair, hairColor: HAIR_COLORS[Math.floor(r(6) * HAIR_COLORS.length)], lashes: hair === 'curlyBun', earrings: hair === 'curlyBun' ? ACADEMY.gold : undefined},
  };
};

type PlaceProps = {x: number; y: number; height: number; blur?: number; flip?: boolean; children?: React.ReactNode};

/** Emblem patch on the blazer's chest pocket (puppet units). */
const ChestPatch: React.FC<{pose?: Pose; label?: string}> = ({pose, label}) => (
  <TorsoFrame pose={pose}>
    <g transform="translate(70,-640)">
      <EmblemMark s={54} />
    </g>
    {label && (
      <g transform="translate(-70,-640)">
        <circle r={30} fill={ACADEMY.gold} stroke={ACADEMY.goldDark} strokeWidth={5} />
        <text y={12} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={34} fill={ACADEMY.navyDark}>
          {label}
        </text>
      </g>
    )}
  </TorsoFrame>
);

/**
 * Generic wrapper: puppet with an optional horizontal stretch (`wide`, for Bruno's bulk), feet at (x, y).
 * Children are drawn in puppet units after the puppet.
 */
export const PlacedWide: React.FC<PuppetProps & PlaceProps & {wide?: number}> = ({x, y, height, blur, flip, wide = 1, children, ...rest}) => {
  const k = height / 1000;
  return (
    <svg
      width={900 * k}
      height={1150 * k}
      viewBox="-450 -1100 900 1150"
      style={{position: 'absolute', overflow: 'visible', left: x - 450 * k, top: y - 1100 * k, filter: blur ? `blur(${blur}px)` : undefined}}
    >
      <g transform={`scale(${(flip ? -1 : 1) * wide},1)`}>
        <Puppet {...rest} />
        {children}
      </g>
    </svg>
  );
};

export const PlacedStudent: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {seed: number}> = ({seed, children, ...props}) => (
  <PlacedWide outfit={studentOutfit(seed)} {...props}>
    <ChestPatch pose={props.pose} />
    {children}
  </PlacedWide>
);

/* ------------------------------------------------------------------ Bruno */

/** Bruno: #1 of the academy. Light skin, dark buzz cut, gold-trim blazer, HUGE arms/legs; render with wide≈1.18. */
export const BRUNO_OUTFIT: Outfit = {
  skin: {base: '#e6b48e', shade: '#b8825e', light: '#fbd3b2'},
  torso: 'suit',
  top: {base: '#22336a', shade: '#121c40', light: '#4d64a8'},
  legs: {base: '#2c3140', shade: '#1a1d27', light: '#4b5164'},
  shoes: 'sneaker',
  shoeColor: {base: '#e8b84a', shade: '#a87a1c', light: '#ffe08f'},
  gloves: false,
  head: {hair: 'buzz', hairColor: '#2a1a10', browWidth: 22},
  armW: 122,
  legW: 98,
};

/** Bruno's default smug look. */
export const BRUNO_SMIRK = {halfSmile: 1, smile: 0.15, browAsym: 0.7, browTilt: -0.35, blink: 0.25, lookX: 0, lookY: 0};
export const BRUNO_WIDE = 1.2;

/** Gold blazer trim (lapel edges) so Bruno reads as "the elite" next to plain students. */
const BrunoTrim: React.FC<{pose?: Pose}> = ({pose}) => (
  <TorsoFrame pose={pose}>
    <path d="M -48,-776 L -6,-602" stroke={ACADEMY.gold} strokeWidth={9} strokeLinecap="round" />
    <path d="M 48,-776 L 6,-602" stroke={ACADEMY.gold} strokeWidth={9} strokeLinecap="round" />
    <path d="M -142,-726 L -124,-438" stroke={ACADEMY.gold} strokeWidth={7} opacity={0.8} />
    <path d="M 142,-726 L 124,-438" stroke={ACADEMY.gold} strokeWidth={7} opacity={0.8} />
  </TorsoFrame>
);

export const Bruno: React.FC<Omit<PuppetProps, 'outfit'>> = (props) => (
  <g>
    <Puppet outfit={BRUNO_OUTFIT} expr={BRUNO_SMIRK} {...props} />
    <BrunoTrim pose={props.pose} />
    <ChestPatch pose={props.pose} label="#1" />
  </g>
);

/** Bruno with feet at (x, y). `height` ≈ on-screen height (make him ~1.15× Davi). */
export const PlacedBruno: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {wide?: number}> = ({children, wide = BRUNO_WIDE, expr, ...props}) => (
  <PlacedWide outfit={BRUNO_OUTFIT} expr={{...BRUNO_SMIRK, ...expr}} wide={wide} {...props}>
    <BrunoTrim pose={props.pose} />
    <ChestPatch pose={props.pose} label="#1" />
    {children}
  </PlacedWide>
);

/* ------------------------------------------------------------------ force-field dome */

/** Bruno's blue force-field dome centred on (cx, baseY), radius r px. `k` 0..1 opacity/raise, `wobble` 0..1 ripples. */
export const ForceDome: React.FC<{cx: number; baseY: number; r: number; k: number; t: number; wobble?: number; hex?: boolean}> = ({cx, baseY, r, k, t, wobble = 0, hex = true}) => {
  if (k <= 0.01) return null;
  const rr = r * (0.6 + 0.4 * Math.min(1, k));
  const pts = Array.from({length: 49}).map((_, i) => {
    const a = Math.PI + (i / 48) * Math.PI;
    const w = 1 + wobble * 0.06 * Math.sin(a * 9 + t * 40) + wobble * 0.03 * Math.sin(a * 5 - t * 25);
    return `${(cx + Math.cos(a) * rr * w).toFixed(1)},${(baseY + Math.sin(a) * rr * 1.05 * w).toFixed(1)}`;
  });
  const d = `M ${pts.join(' L ')} Z`;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <radialGradient id="ep03dome" cx="50%" cy="100%" r="100%">
          <stop offset="0" stopColor="#6fd6ff" stopOpacity={0.05} />
          <stop offset="0.75" stopColor="#4ab8ff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#bdf0ff" stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <g opacity={Math.min(1, k)}>
        <path d={d} fill="url(#ep03dome)" stroke="#bff2ff" strokeWidth={8} style={{filter: 'drop-shadow(0 0 18px #4ab8ff)'}} />
        {hex &&
          Array.from({length: 5}).map((_, i) => {
            const yy = baseY - rr * (0.18 + i * 0.17);
            const half = Math.sqrt(Math.max(0, 1 - Math.pow((baseY - yy) / (rr * 1.05), 2))) * rr;
            return <line key={i} x1={cx - half} y1={yy} x2={cx + half} y2={yy} stroke="#bff2ff" strokeWidth={3} opacity={0.35} />;
          })}
        <ellipse cx={cx - rr * 0.35} cy={baseY - rr * 0.7} rx={rr * 0.18} ry={rr * 0.08} fill="#ffffff" opacity={0.45} transform={`rotate(-30 ${cx - rr * 0.35} ${baseY - rr * 0.7})`} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ vibration helpers (Davi's power) */

/** Per-frame jitter offset for something vibrating. amp in px. */
export const vibe = (frame: number, amp = 6, seed = 'v') => ({
  x: (random(`${seed}x${frame}`) - 0.5) * 2 * amp,
  y: (random(`${seed}y${frame}`) - 0.5) * 2 * amp * 0.6,
  r: (random(`${seed}r${frame}`) - 0.5) * amp * 0.25,
});

/**
 * Phone-style vibration marks: 2–3 nested arcs on each side of a box (cx, cy, w, h), flickering.
 * `k` 0..1 strength. Render inside an <svg> (screen px).
 */
export const VibeLines: React.FC<{cx: number; cy: number; w: number; h: number; k: number; frame: number; color?: string; n?: number; width?: number}> = ({
  cx,
  cy,
  w,
  h,
  k,
  frame,
  color = '#ffd23a',
  n = 3,
  width = 10,
}) => {
  if (k <= 0.01) return null;
  const on = Math.floor(frame / 2) % 2;
  return (
    <g opacity={k} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${color})`}}>
      {[-1, 1].map((side) =>
        Array.from({length: n}).map((_, i) => {
          const gap = 26 + i * 34 + (on ? 6 : 0);
          const x = cx + side * (w / 2 + gap);
          const hh = h * (0.5 - i * 0.09);
          return <path key={`${side}${i}`} d={`M ${x - side * 14},${cy - hh / 2} Q ${x + side * 16},${cy} ${x - side * 14},${cy + hh / 2}`} opacity={1 - i * 0.22} />;
        }),
      )}
    </g>
  );
};

/** Little sine-wave squiggle (sound / vibration wave) from (x1,y) to (x2,y). */
export const WaveLine: React.FC<{x1: number; x2: number; y: number; amp: number; cycles: number; phase: number; color?: string; width?: number; opacity?: number}> = ({
  x1,
  x2,
  y,
  amp,
  cycles,
  phase,
  color = '#ffd23a',
  width = 7,
  opacity = 1,
}) => {
  const N = 60;
  const d = Array.from({length: N + 1})
    .map((_, i) => {
      const u = i / N;
      const x = x1 + (x2 - x1) * u;
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${(y + Math.sin(u * cycles * Math.PI * 2 + phase) * amp).toFixed(1)}`;
    })
    .join(' ');
  return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" opacity={opacity} />;
};
