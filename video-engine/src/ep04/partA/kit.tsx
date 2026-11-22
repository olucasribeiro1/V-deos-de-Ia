import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {f, wordAt} from '../timeline';
import {H, W} from '../../lib/constants';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import type {Lighting, Pose} from '../../characters/types';

export {Rig, BandSafe, SpeedLines, CutFlash, Finish, Stamp, HudTag, Chip, EnergyLines, SweatDrop, Stars, Steam, FreezeFx, LabBg, Smear, Svg, walkPose} from '../../ep02qi/partA/kit';
export {SfxWord, Sparkle, DaviRoom, Desk, RingWaves} from '../../ep03/partA/kit';
export {W, H, clamp, easeOut, kf, lerp};

/** Part A starts at absolute 0, so part-local frame = absolute frame. */
export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word start (EP04 timing). */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
/** Absolute seconds at shot-local frame. */
export const abs = (p: ShotP, fr: number) => (p.from + fr) / 30;

export const DAY: Lighting = {side: -1, rim: '#fff2c4', rimStrength: 0.8, shadeStrength: 0.45};
export const NIGHT: Lighting = {side: 1, rim: '#8fd0ff', rimStrength: 0.85, shadeStrength: 0.65};
export const WARM: Lighting = {side: 1, rim: '#ffc86a', rimStrength: 0.9, shadeStrength: 0.6};

export const YEL = '#ffd23a';
export const BLU = '#5ab8ff';
export const RED = '#e0302c';
export const GRN = '#3be08a';

const rad = (d: number) => (d * Math.PI) / 180;
/** Screen position of a PlacedDavi's wrist (x,y feet; height px). side 'R' = screen-right arm (unflipped). Ignores lean. */
export const wrist = (x: number, y: number, height: number, pose: Pose, side: 'R' | 'L' = 'R', flip = false): [number, number] => {
  const k = height / 1000;
  const sh = side === 'R' ? (pose.shR ?? 7) : (pose.shL ?? -7);
  const el = side === 'R' ? (pose.elR ?? -6) : (pose.elL ?? 6);
  const sx = side === 'R' ? 128 : -128;
  const ex = sx + Math.sin(rad(sh)) * 182;
  const ey = -728 + Math.cos(rad(sh)) * 182;
  const [wx, wy] = leanRot(ex + Math.sin(rad(sh + el)) * 190, ey + Math.cos(rad(sh + el)) * 190, pose.lean ?? 0);
  return [x + (flip ? -wx : wx) * k, y + (wy + (pose.bob ?? 0)) * k];
};
/** Rotate a puppet-local point by the torso lean (around the hip). */
const leanRot = (px: number, py: number, lean: number): [number, number] => {
  const a = rad(lean);
  const dy = py + 480;
  return [px * Math.cos(a) - dy * Math.sin(a), -480 + px * Math.sin(a) + dy * Math.cos(a)];
};
/** Head centre + radius of a PlacedDavi. */
export const headOf = (x: number, y: number, height: number, bob = 0, lean = 0): [number, number, number] => {
  const k = height / 1000;
  const [hx, hy] = leanRot(0, -884, lean);
  return [x + hx * k, y + (hy + bob) * k, 124 * k];
};

/* ------------------------------------------------------------------ magnetic field visuals */

/**
 * Dipole field lobes (r = L·sin²θ) around (x,y), axis rotated by `ang` (deg; 0 = axis pointing right).
 * Alternating yellow/blue, with dashes flowing. `k` 0..1 strength, `scale` px of the biggest lobe.
 */
export const FieldLobes: React.FC<{x: number; y: number; ang?: number; scale?: number; k: number; frame: number; n?: number; width?: number; pulse?: number}> = ({
  x,
  y,
  ang = 0,
  scale = 420,
  k,
  frame,
  n = 5,
  width = 7,
  pulse = 0,
}) => {
  if (k <= 0.01) return null;
  const paths: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const L = scale * (0.28 + (0.72 * (i + 1)) / n) * (1 + pulse * 0.06 * Math.sin(frame * 0.5 + i));
    for (const side of [1, -1]) {
      const pts: string[] = [];
      for (let s = 0; s <= 40; s++) {
        const th = 0.12 + (s / 40) * (Math.PI - 0.24);
        const r = L * Math.sin(th) ** 2;
        // axis along +x in local frame, lobe above/below
        const lx = r * Math.cos(th);
        const ly = side * r * Math.sin(th);
        pts.push(`${s ? 'L' : 'M'}${lx.toFixed(1)},${ly.toFixed(1)}`);
      }
      const col = i % 2 === 0 ? YEL : BLU;
      paths.push(
        <path
          key={`${i}${side}`}
          d={pts.join(' ')}
          stroke={col}
          strokeWidth={width * (1 - i * 0.08)}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="34 18"
          strokeDashoffset={-frame * 4 * side}
          opacity={k * (1 - i * 0.12)}
        />,
      );
    }
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${ang})`} style={{filter: `drop-shadow(0 0 8px ${YEL})`, mixBlendMode: 'screen'}}>
      {paths}
    </g>
  );
};

/** Flowing field arcs from hand (a) to an object (b): a fan of curved dashed strands. */
export const FieldBeam: React.FC<{a: [number, number]; b: [number, number]; k: number; frame: number; n?: number; spread?: number; width?: number}> = ({a, b, k, frame, n = 5, spread = 120, width = 6}) => {
  if (k <= 0.01) return null;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return (
    <g style={{filter: `drop-shadow(0 0 8px ${YEL})`}}>
      {Array.from({length: n}).map((_, i) => {
        const o = (i - (n - 1) / 2) * (spread / Math.max(1, n - 1)) * 2;
        const mx = (a[0] + b[0]) / 2 + nx * o;
        const my = (a[1] + b[1]) / 2 + ny * o;
        return (
          <path
            key={i}
            d={`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`}
            stroke={i % 2 ? BLU : YEL}
            strokeWidth={width}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="22 16"
            strokeDashoffset={frame * 5}
            opacity={k * (0.6 + 0.4 * Math.sin(frame * 0.6 + i))}
          />
        );
      })}
    </g>
  );
};

/** Glowing palm aura at (x,y). */
export const PalmGlow: React.FC<{x: number; y: number; k: number; r?: number; frame: number}> = ({x, y, k, r = 90, frame}) =>
  k <= 0.01 ? null : (
    <g>
      <circle cx={x} cy={y} r={r * (1 + 0.08 * Math.sin(frame * 0.8))} fill={YEL} opacity={0.22 * k} />
      <circle cx={x} cy={y} r={r * 0.55} fill="#fff6c0" opacity={0.35 * k} />
      {Array.from({length: 6}).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + frame * 0.15;
        const rr = r * (0.7 + ((frame * 0.05 + i * 0.37) % 1) * 0.8);
        return <circle key={i} cx={x + Math.cos(a) * rr} cy={y + Math.sin(a) * rr} r={5} fill={i % 2 ? BLU : YEL} opacity={k} />;
      })}
    </g>
  );

/** Anger/strain vein (comic cross) at (x,y). */
export const Vein: React.FC<{x: number; y: number; s?: number; k: number; frame: number}> = ({x, y, s = 50, k, frame}) => {
  if (k <= 0.01) return null;
  const pul = 1 + 0.15 * Math.sin(frame * 1.4);
  return (
    <g transform={`translate(${x},${y}) scale(${(s / 50) * pul * easeOut(clamp(k))})`} stroke="#d2232a" strokeWidth={9} fill="none" strokeLinecap="round">
      <path d="M -24,-8 Q -10,-10 -8,-24" />
      <path d="M 8,-24 Q 10,-10 24,-8" />
      <path d="M 24,8 Q 10,10 8,24" />
      <path d="M -8,24 Q -10,10 -24,8" />
    </g>
  );
};

/* ------------------------------------------------------------------ metal props (local units, centred) */

export const Clip: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string}> = ({x, y, s = 1, rot = 0, color = '#cfd6e2'}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -10,-38 L -10,30 A 14,14 0 0 0 18,30 L 18,-44 A 20,20 0 0 0 -22,-44 L -22,36 A 26,26 0 0 0 30,36 L 30,-20" stroke="#20242c" strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d="M -10,-38 L -10,30 A 14,14 0 0 0 18,30 L 18,-44 A 20,20 0 0 0 -22,-44 L -22,36 A 26,26 0 0 0 30,36 L 30,-20" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

export const Key: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#20242c" strokeWidth={4}>
    <circle cx={-34} cy={0} r={26} fill="#e8c45a" />
    <circle cx={-40} cy={0} r={9} fill="#20242c" />
    <path d="M -10,-9 L 52,-9 L 52,0 L 46,0 L 46,12 L 38,12 L 38,0 L 30,0 L 30,10 L 22,10 L 22,9 L -10,9 Z" fill="#e8c45a" />
  </g>
);

export const Coin: React.FC<{x: number; y: number; s?: number; rot?: number; spin?: number; color?: string; label?: string}> = ({x, y, s = 1, rot = 0, spin = 1, color = '#e8c45a', label = '1'}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s * Math.max(0.12, Math.abs(spin))},${s})`}>
    <circle cx={0} cy={0} r={34} fill={color} stroke="#7a5a10" strokeWidth={5} />
    <circle cx={0} cy={0} r={24} fill="none" stroke="#7a5a10" strokeWidth={3} opacity={0.6} />
    <text x={0} y={11} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={30} fill="#7a5a10">
      {label}
    </text>
  </g>
);

export const Nail: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#20242c" strokeWidth={4}>
    <rect x={-30} y={-9} width={8} height={18} fill="#9aa3b2" />
    <path d="M -24,-5 L 46,-4 L 58,0 L 46,4 L -24,5 Z" fill="#b8c0cc" />
  </g>
);

export const Scissors: React.FC<{x: number; y: number; s?: number; rot?: number; open?: number}> = ({x, y, s = 1, rot = 0, open = 0.2}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#20242c" strokeWidth={4}>
    <g transform={`rotate(${-open * 20})`}>
      <path d="M 0,-4 L 70,-10 L 72,-4 L 0,4 Z" fill="#cfd6e2" />
      <ellipse cx={-30} cy={-18} rx={22} ry={15} fill="none" stroke="#e5484d" strokeWidth={9} />
    </g>
    <g transform={`rotate(${open * 20})`}>
      <path d="M 0,4 L 70,10 L 72,4 L 0,-4 Z" fill="#b8c0cc" />
      <ellipse cx={-30} cy={18} rx={22} ry={15} fill="none" stroke="#e5484d" strokeWidth={9} />
    </g>
    <circle cx={0} cy={0} r={5} fill="#20242c" />
  </g>
);

/** Aluminium soda can (silver/blue), base centre at (x,y). */
export const Can: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#20242c" strokeWidth={4}>
    <path d="M -38,-6 L -38,-126 Q -38,-136 -30,-140 L 30,-140 Q 38,-136 38,-126 L 38,-6 Q 38,0 30,0 L -30,0 Q -38,0 -38,-6 Z" fill="#c9d2de" />
    <rect x={-38} y={-110} width={76} height={70} fill="#2f6fd6" stroke="none" />
    <path d="M -38,-75 Q 0,-95 38,-75" stroke="#fff" strokeWidth={6} fill="none" />
    <rect x={-26} y={-128} width={14} height={110} fill="#fff" opacity={0.35} stroke="none" />
    <ellipse cx={0} cy={-140} rx={30} ry={5} fill="#aab4c2" />
  </g>
);

/** Coil of copper wire, centre (x,y). */
export const Wire: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} fill="none" strokeLinecap="round">
    {[0, 1, 2, 3].map((i) => (
      <ellipse key={i} cx={-24 + i * 16} cy={0} rx={20} ry={40} stroke="#7a3d14" strokeWidth={12} />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <ellipse key={i} cx={-24 + i * 16} cy={0} rx={20} ry={40} stroke="#e07a3a" strokeWidth={6} />
    ))}
    <path d="M 26,30 Q 60,50 80,30" stroke="#7a3d14" strokeWidth={12} />
    <path d="M 26,30 Q 60,50 80,30" stroke="#e07a3a" strokeWidth={6} />
  </g>
);

/** Gold ring with a little gem, centre (x,y). */
export const Ring: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={34} ry={30} fill="none" stroke="#7a5a10" strokeWidth={16} />
    <ellipse cx={0} cy={0} rx={34} ry={30} fill="none" stroke="#f2c84a" strokeWidth={10} />
    <path d="M -12,-30 L 0,-52 L 12,-30 Z" fill="#7fe0ff" stroke="#1d4e78" strokeWidth={4} />
  </g>
);

/* ------------------------------------------------------------------ bigger props */

/** Compact hatchback (side view, facing left), wheels on y. ~640 px wide at s=1. */
export const Car: React.FC<{x: number; y: number; s?: number; color?: string; shake?: number}> = ({x, y, s = 1, color = '#d9534f', shake = 0}) => (
  <g transform={`translate(${x + shake},${y}) scale(${s})`} stroke="#1a1420" strokeWidth={6} strokeLinejoin="round">
    <ellipse cx={0} cy={6} rx={330} ry={22} fill="#000" opacity={0.25} stroke="none" />
    <path d="M -320,-40 Q -330,-120 -270,-130 L -170,-140 L -90,-230 Q -70,-246 -40,-246 L 150,-246 Q 190,-246 210,-220 L 270,-140 Q 330,-130 330,-80 L 330,-40 Q 330,-20 300,-20 L -300,-20 Q -320,-20 -320,-40 Z" fill={color} />
    <path d="M -150,-146 L -78,-224 L 20,-224 L 20,-146 Z" fill="#a9d8f5" />
    <path d="M 44,-146 L 44,-224 L 150,-224 Q 176,-224 190,-206 L 236,-146 Z" fill="#a9d8f5" />
    <path d="M -300,-90 L 310,-90" stroke="#00000033" strokeWidth={8} />
    <rect x={-40} y={-120} width={44} height={10} rx={5} fill="#1a1420" />
    <rect x={-322} y={-110} width={30} height={30} rx={6} fill="#ffe680" />
    <rect x={306} y={-110} width={22} height={34} rx={6} fill="#ff6b5a" />
    {[-190, 200].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-22} r={62} fill="#22222a" />
        <circle cx={wx} cy={-22} r={30} fill="#b8c0cc" />
      </g>
    ))}
  </g>
);

/** Bank card (front), centre (x,y), w px. `dead` 0..1 → stripe fizzles + crossed. */
export const BankCard: React.FC<{x: number; y: number; w?: number; rot?: number; dead?: number; color?: string; frame?: number}> = ({x, y, w = 260, rot = 0, dead = 0, color = '#2f6fd6', frame = 0}) => {
  const h = w * 0.63;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.08} fill={color} stroke="#14141a" strokeWidth={5} />
      <rect x={-w / 2 + 2} y={-h / 2 + h * 0.16} width={w - 4} height={h * 0.2} fill="#14141a" />
      {dead > 0 &&
        Array.from({length: 10}).map((_, i) => (
          <rect
            key={i}
            x={-w / 2 + (i / 10) * w}
            y={-h / 2 + h * 0.16 + (random(`bs${i}${Math.floor(frame / 2)}`) - 0.5) * 10 * dead}
            width={w / 12}
            height={h * 0.2}
            fill={random(`bc${i}${Math.floor(frame / 2)}`) > 0.5 ? '#ffffff' : '#7fb2ff'}
            opacity={dead * 0.6}
          />
        ))}
      <rect x={-w * 0.38} y={h * 0.02} width={w * 0.18} height={h * 0.24} rx={4} fill="#e8c45a" stroke="#7a5a10" strokeWidth={2} />
      <rect x={-w * 0.38} y={h * 0.32} width={w * 0.62} height={h * 0.07} rx={3} fill="#ffffff" opacity={0.75} />
      <text x={w * 0.42} y={-h * 0.38 + h * 0.62} textAnchor="end" fontFamily="Oswald" fontWeight={700} fontSize={w * 0.09} fill="#ffffff" opacity={0.85}>
        BANCO
      </text>
      {dead > 0.5 && (
        <g stroke={RED} strokeWidth={w * 0.05} strokeLinecap="round" opacity={clamp((dead - 0.5) * 2)}>
          <line x1={-w * 0.42} y1={-h * 0.42} x2={w * 0.42} y2={h * 0.42} />
          <line x1={w * 0.42} y1={-h * 0.42} x2={-w * 0.42} y2={h * 0.42} />
        </g>
      )}
    </g>
  );
};

/**
 * Cartoon frog (front view), centre-bottom at (x,y), s=1 ≈ 300 px wide.
 * mood: 'happy' | 'shock' | 'annoyed'. crossed = front arms crossed over the belly.
 */
export const Frog: React.FC<{x: number; y: number; s?: number; mood?: 'happy' | 'shock' | 'annoyed'; crossed?: boolean; legs?: number; blink?: number; rot?: number}> = ({
  x,
  y,
  s = 1,
  mood = 'happy',
  crossed = false,
  legs = 0,
  blink = 0,
  rot = 0,
}) => {
  const g = '#4cbf4c';
  const gd = '#2e8a35';
  const lid = mood === 'annoyed' ? 0.5 : blink;
  const pupR = mood === 'shock' ? 9 : 14;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#14301a" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
      {/* back legs (dangle when floating: legs 0..1) */}
      {[-1, 1].map((d) => (
        <path
          key={d}
          d={`M ${d * 70},-40 Q ${d * (150 - legs * 60)},${-20 + legs * 40} ${d * (120 - legs * 50)},${10 + legs * 70} L ${d * (160 - legs * 60)},${14 + legs * 80}`}
          fill="none"
          stroke={gd}
          strokeWidth={30}
        />
      ))}
      {/* body */}
      <path d="M -130,-60 Q -140,-210 0,-215 Q 140,-210 130,-60 Q 120,0 0,0 Q -120,0 -130,-60 Z" fill={g} />
      <path d="M -80,-60 Q -70,-130 0,-132 Q 70,-130 80,-60 Q 70,-14 0,-14 Q -70,-14 -80,-60 Z" fill="#d8f0b8" strokeWidth={4} />
      {/* eyes */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <circle cx={d * 62} cy={-210} r={46} fill={g} />
          <circle cx={d * 62} cy={-214} r={32} fill="#ffffff" strokeWidth={4} />
          <circle cx={d * 62 + (mood === 'annoyed' ? -d * 4 : 0)} cy={-210} r={pupR} fill="#14141a" stroke="none" />
          {lid > 0.02 && <path d={`M ${d * 62 - 34},-214 A 34,34 0 0 1 ${d * 62 + 34},-214 L ${d * 62 + 34},${-214 - 34 + 68 * lid * 0.9} L ${d * 62 - 34},${-214 - 34 + 68 * lid * 0.9} Z`} fill={g} strokeWidth={4} />}
          {mood === 'annoyed' && <line x1={d * 62 - 34 * d} y1={-262 + 10} x2={d * 62 + 30 * d} y2={-262 - 4} stroke="#14301a" strokeWidth={10} />}
        </g>
      ))}
      {/* mouth */}
      {mood === 'happy' && <path d="M -60,-150 Q 0,-110 60,-150" fill="none" strokeWidth={7} />}
      {mood === 'shock' && <ellipse cx={0} cy={-140} rx={22} ry={18} fill="#7a1a24" strokeWidth={5} />}
      {mood === 'annoyed' && <path d="M -50,-136 Q 0,-150 50,-136" fill="none" strokeWidth={8} />}
      <circle cx={-90} cy={-150} r={12} fill="#ff8fa0" stroke="none" opacity={mood === 'happy' ? 0.6 : 0} />
      <circle cx={90} cy={-150} r={12} fill="#ff8fa0" stroke="none" opacity={mood === 'happy' ? 0.6 : 0} />
      {/* front arms */}
      {crossed ? (
        <g>
          <path d="M -110,-90 Q -40,-50 60,-80" fill="none" stroke={gd} strokeWidth={30} />
          <path d="M 110,-90 Q 40,-60 -60,-70" fill="none" stroke={g} strokeWidth={30} />
          <path d="M 110,-90 Q 40,-60 -60,-70" fill="none" stroke="#14301a" strokeWidth={6} opacity={0.35} />
          <circle cx={66} cy={-82} r={20} fill={gd} />
          <circle cx={-66} cy={-70} r={20} fill={g} />
        </g>
      ) : (
        [-1, 1].map((d) => <path key={d} d={`M ${d * 100},-70 Q ${d * 130},-20 ${d * 110},${10 + legs * 20}`} fill="none" stroke={gd} strokeWidth={26} />)
      )}
    </g>
  );
};

/** Glass of water (front), base centre (x,y), s=1 ≈ 300×420. `dent` 0..1 = diamagnetic dimple under the field. */
export const WaterGlass: React.FC<{x: number; y: number; s?: number; dent?: number; dentX?: number; frame: number}> = ({x, y, s = 1, dent = 0, dentX = 0, frame}) => {
  const lvl = -300;
  const surf = Array.from({length: 25})
    .map((_, i) => {
      const xx = -130 + i * (260 / 24);
      const d = Math.exp(-(((xx - dentX) / 70) ** 2)) * 60 * dent;
      return `L ${xx.toFixed(1)},${(lvl + d + Math.sin(i * 0.9 + frame * 0.3) * 3).toFixed(1)}`;
    })
    .join(' ');
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d={`M -130,${lvl} ${surf} L 130,${lvl} L 112,-6 L -112,-6 Z`} fill="#4aa8e8" opacity={0.75} />
      <path d={`M -130,${lvl} ${surf}`} stroke="#c8ecff" strokeWidth={6} fill="none" />
      <path d="M -150,-420 L 150,-420 L 120,0 L -120,0 Z" fill="rgba(220,240,255,0.18)" stroke="#e9f6ff" strokeWidth={8} strokeLinejoin="round" />
      <path d="M -118,-390 L -96,-40" stroke="#fff" strokeWidth={12} opacity={0.5} strokeLinecap="round" />
    </g>
  );
};

/** Water molecule (H2O) icon at (x,y), s=1 ≈ 60 px. */
export const H2O: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} stroke="#14223a" strokeWidth={3}>
    <circle cx={-22} cy={14} r={11} fill="#ffffff" />
    <circle cx={22} cy={14} r={11} fill="#ffffff" />
    <circle cx={0} cy={0} r={20} fill="#e5484d" />
  </g>
);

/* ------------------------------------------------------------------ backdrops */

const SvgL: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {children}
  </svg>
);

/** Flat comic backdrop: radial gradient + halftone + rotating rays. */
export const PopBg: React.FC<{c1: string; c2: string; t: number; cx?: number; cy?: number}> = ({c1, c2, t, cx = 540, cy = 960}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at ${(cx / W) * 100}% ${(cy / H) * 100}%, ${c1}, ${c2} 75%)`}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.12) 3px, transparent 3.5px)', backgroundSize: '26px 26px', backgroundPosition: `${t * 10}px 0`}} />
    <SvgL>
      {Array.from({length: 18}).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + t * 0.2;
        return <path key={i} d={`M ${cx},${cy} L ${cx + Math.cos(a) * 2200},${cy + Math.sin(a) * 2200} L ${cx + Math.cos(a + 0.12) * 2200},${cy + Math.sin(a + 0.12) * 2200} Z`} fill="#fff" opacity={0.07} />;
      })}
    </SvgL>
  </AbsoluteFill>
);

/** Cream textbook page with faint grid + margin line; `px` parallax. */
export const PaperBg: React.FC<{t: number; tint?: string}> = ({t, tint = '#f6efdd'}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'linear-gradient(rgba(60,90,140,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(60,90,140,0.10) 2px, transparent 2px)',
        backgroundSize: '60px 60px',
        backgroundPosition: `${t * 8}px ${t * 4}px`,
      }}
    />
    <AbsoluteFill style={{left: 90, width: 4, background: 'rgba(220,60,60,0.35)'}} />
  </AbsoluteFill>
);

/** Night street sidewalk with a wall (for the ATM). */
export const StreetWall: React.FC<{t: number; px?: number; floorY?: number; children?: React.ReactNode}> = ({t, px = 0, floorY = 1500, children}) => (
  <AbsoluteFill style={{background: '#2b3150', overflow: 'hidden'}}>
    <SvgL>
      <g transform={`translate(${px},0)`}>
        {Array.from({length: 20}).map((_, r) =>
          Array.from({length: 9}).map((__, c) => (
            <rect key={`${r}-${c}`} x={-300 + c * 200 - (r % 2) * 100} y={r * 80} width={196} height={76} fill={random(`bw${r}${c}`) > 0.5 ? '#3a4068' : '#353b60'} />
          )),
        )}
        <rect x={-400} y={floorY} width={W + 800} height={H} fill="#55586a" />
        <rect x={-400} y={floorY} width={W + 800} height={16} fill="#6e7186" />
        {Array.from({length: 10}).map((_, i) => (
          <line key={i} x1={-300 + i * 240} y1={floorY} x2={-500 + i * 300} y2={H} stroke="#45485a" strokeWidth={6} />
        ))}
      </g>
      {children}
    </SvgL>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 40% at 50% 40%, rgba(140,200,255,${0.18 + 0.02 * Math.sin(t * 9)}), rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
  </AbsoluteFill>
);

/** ATM machine, centre-bottom (x,y), s=1 ≈ 520 × 1000. screen: 'ok' | 'error' | 'insert'. */
export const ATM: React.FC<{x: number; y: number; s?: number; screen?: 'ok' | 'error' | 'insert'; frame: number; glitch?: number}> = ({x, y, s = 1, screen = 'insert', frame, glitch = 0}) => {
  const err = screen === 'error';
  const jx = glitch ? (random(`atm${Math.floor(frame / 2)}`) - 0.5) * 30 * glitch : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} stroke="#14141a" strokeWidth={6} strokeLinejoin="round">
      <rect x={-260} y={-1000} width={520} height={1000} rx={26} fill="#c7ccd6" />
      <rect x={-260} y={-1000} width={520} height={110} rx={26} fill="#2f6fd6" />
      <text x={0} y={-928} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={56} fill="#fff" stroke="none">
        24 HORAS
      </text>
      <rect x={-200} y={-850} width={400} height={300} rx={14} fill={err ? '#3a0c10' : '#0d2a4a'} />
      <g transform={`translate(${jx},0)`}>
        {err ? (
          <>
            <text x={0} y={-680} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={120} fill="#ff4a4a" stroke="none" style={{filter: 'drop-shadow(0 0 12px #ff4a4a)'}}>
              ERRO
            </text>
            <text x={0} y={-610} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={30} fill="#ff9a9a" stroke="none">
              CARTÃO ILEGÍVEL
            </text>
          </>
        ) : (
          <text x={0} y={-690} textAnchor="middle" fontFamily="Roboto Condensed" fontWeight={700} fontSize={40} fill="#9fe0ff" stroke="none">
            {screen === 'ok' ? 'LENDO…' : 'INSIRA O CARTÃO'}
          </text>
        )}
      </g>
      {/* card slot */}
      <rect x={-110} y={-500} width={220} height={40} rx={8} fill="#2a2d38" />
      <rect x={-90} y={-486} width={180} height={10} rx={4} fill={err ? '#ff4a4a' : '#3be08a'} stroke="none" />
      {/* keypad */}
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i} x={-150 + (i % 3) * 80} y={-420 + Math.floor(i / 3) * 56} width={64} height={44} rx={6} fill="#e8ebf0" strokeWidth={3} />
      ))}
      <rect x={-200} y={-160} width={400} height={50} rx={8} fill="#2a2d38" />
    </g>
  );
};

/** Lab tube magnet (cross-section style): big cylinder with coils, bore opening at centre (x,y). r = bore radius px. */
export const TubeMagnet: React.FC<{x: number; y: number; r?: number; h?: number; k?: number; frame: number; cut?: boolean}> = ({x, y, r = 170, h = 900, k = 1, frame, cut = true}) => {
  const R = r * 2.1;
  return (
    <g transform={`translate(${x},${y})`} stroke="#14141a" strokeWidth={6}>
      {/* outer body */}
      <rect x={-R} y={-h / 2} width={R * 2} height={h} rx={40} fill="#8a96a8" />
      <rect x={-R + 20} y={-h / 2 + 20} width={30} height={h - 40} rx={10} fill="#fff" opacity={0.25} stroke="none" />
      {cut && (
        <>
          {/* coils (cross-section) */}
          {Array.from({length: 14}).map((_, i) => {
            const yy = -h / 2 + 50 + i * ((h - 100) / 13);
            return (
              <g key={i}>
                <circle cx={-r - 50} cy={yy} r={20} fill="#e07a3a" strokeWidth={4} />
                <circle cx={r + 50} cy={yy} r={20} fill="#e07a3a" strokeWidth={4} />
                <text x={-r - 50} y={yy + 9} textAnchor="middle" fontSize={24} fontWeight={700} fill="#14141a" stroke="none">
                  ×
                </text>
                <circle cx={r + 50} cy={yy} r={5} fill="#14141a" stroke="none" />
              </g>
            );
          })}
          {/* bore */}
          <rect x={-r} y={-h / 2 - 4} width={r * 2} height={h + 8} fill="#0d1830" />
          {/* field lines in the bore */}
          {Array.from({length: 5}).map((_, i) => (
            <line
              key={i}
              x1={-r + (r * 2 * (i + 1)) / 6}
              y1={h / 2}
              x2={-r + (r * 2 * (i + 1)) / 6}
              y2={-h / 2}
              stroke={i % 2 ? BLU : YEL}
              strokeWidth={5}
              strokeDasharray="26 18"
              strokeDashoffset={frame * 6}
              opacity={0.75 * k}
            />
          ))}
        </>
      )}
    </g>
  );
};

/** Tiny HUD x/✓ badge. */
export const Mark: React.FC<{x: number; y: number; ok: boolean; k: number; s?: number}> = ({x, y, ok, k, s = 60}) => {
  if (k <= 0) return null;
  const sc = k < 1 ? lerp(2, 1, easeOut(clamp(k))) : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${(sc * s) / 60})`} opacity={clamp(k * 2)}>
      <circle r={30} fill={ok ? '#1f9d4a' : RED} stroke="#fff" strokeWidth={5} />
      {ok ? <path d="M -14,0 L -4,11 L 15,-11" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M -11,-11 L 11,11 M 11,-11 L -11,11" stroke="#fff" strokeWidth={8} strokeLinecap="round" />}
    </g>
  );
};

/** frames-since helper: k = (fr - at)/len clamped */
export const since = (fr: number, at: number, len = 6) => clamp((fr - at) / len);
/** flight from a to b with arc + ease, k 0..1. */
export const fly = (a: [number, number], b: [number, number], k: number, arc = -80): [number, number] => {
  const e = easeOut(clamp(k));
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + arc * Math.sin(e * Math.PI)];
};
export const jitter = (fr: number, amp: number, seed: string) => ({x: (random(`${seed}x${fr}`) - 0.5) * amp, y: (random(`${seed}y${fr}`) - 0.5) * amp});
