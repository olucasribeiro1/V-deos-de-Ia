import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {f, wordAt} from '../timeline';
import {H, W} from '../../lib/constants';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import type {Pose} from '../../characters/types';

export {Rig, BandSafe, SpeedLines} from '../../ep01/partB/rig';
export {CutFlash} from '../../ep01/partA/kit';
export {Finish} from '../../scenes/common';
export {W, H};

/** Part A starts at absolute 0, so part-local frame = absolute frame. */
export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word start. */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
/** Absolute seconds at shot-local frame. */
export const abs = (p: ShotP, fr: number) => (p.from + fr) / 30;

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/* ------------------------------------------------------------------ poses */

/** Sprint cycle (side view, facing screen-right when not flipped). */
export const runPose = (t: number, amp = 1, ph = 0): Pose => {
  const s = Math.sin(t * 15 + ph);
  return {
    lean: 10 * amp,
    hipL: s * 38 * amp,
    hipR: -s * 38 * amp,
    knL: (s < 0 ? 70 : 18) * amp * Math.abs(s),
    knR: (s > 0 ? 70 : 18) * amp * Math.abs(s),
    shL: -s * 50 * amp,
    elL: -60 * amp,
    shR: s * 50 * amp,
    elR: -60 * amp,
    bob: -Math.abs(Math.cos(t * 15 + ph)) * 26 * amp,
  };
};

export const walkPose = (t: number, ph = 0, amp = 1): Pose => {
  const s = Math.sin(t * 9 + ph);
  return {
    hipL: s * 16 * amp,
    hipR: -s * 16 * amp,
    knL: Math.max(0, -s) * 20 * amp,
    knR: Math.max(0, s) * 20 * amp,
    shL: -8 - s * 12 * amp,
    elL: 10,
    shR: 8 + s * 12 * amp,
    elR: -10,
    bob: -Math.abs(s) * 10 * amp,
  };
};

/* ------------------------------------------------------------------ comic stamps & tags */

/**
 * Rubber-stamp slam. `k` = frames since the slam (negative = hidden).
 * Lands in 4 frames from 2.6× with a little ink burst; stays.
 */
export const Stamp: React.FC<{x: number; y: number; text: string; sub?: string; color?: string; k: number; rot?: number; size?: number; bg?: string}> = ({
  x,
  y,
  text,
  sub,
  color = '#d23c3c',
  k,
  rot = -9,
  size = 110,
  bg = 'rgba(255,250,240,0.9)',
}) => {
  if (k < 0) return null;
  const s = k < 4 ? lerp(2.6, 1, easeOut(k / 4)) : 1 + Math.max(0, 0.06 * Math.sin((k - 4) * 0.9) * Math.exp(-(k - 4) * 0.25));
  const op = clamp(k / 2 + 0.2);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: op,
        border: `${size * 0.08}px solid ${color}`,
        borderRadius: size * 0.2,
        padding: `${size * 0.06}px ${size * 0.3}px ${size * 0.03}px`,
        color,
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: size * 0.04,
        lineHeight: 1.02,
        textAlign: 'center',
        background: bg,
        boxShadow: `0 0 0 ${size * 0.04}px ${bg}, 0 12px 30px rgba(0,0,0,0.45)`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      {sub && <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: size * 0.3, letterSpacing: size * 0.06, marginTop: 2}}>{sub}</div>}
    </div>
  );
};

/** Series HUD tag: tiny label + big value (no leader). `k` 0..1 reveal. */
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
        textShadow: '0 3px 10px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.9)',
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{fontSize: size * 0.3, letterSpacing: 6, fontWeight: 700, opacity: 0.9}}>{label}</div>
      <div style={{fontFamily: CAPTION_FONT, fontSize: size, fontWeight: 700, lineHeight: 1}}>{value}</div>
    </div>
  );
};

/** Small pill chip (e.g. "FLASHBACK · 5 ANOS"). */
export const Chip: React.FC<{x: number; y: number; text: string; k: number; color?: string; fg?: string; size?: number}> = ({x, y, text, k, color = '#ffd23a', fg = '#141414', size = 40}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${lerp(0.6, 1, easeOut(clamp(k)))})`,
        opacity: clamp(k * 2),
        background: color,
        color: fg,
        fontFamily: HUD_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 4,
        padding: `${size * 0.18}px ${size * 0.5}px`,
        borderRadius: size,
        boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );

/* ------------------------------------------------------------------ energy / fx */

/** Kaiser-style yellow energy lines: jagged strokes radiating from (x, y) between r0 and r1. */
export const EnergyLines: React.FC<{x: number; y: number; r0: number; r1: number; k: number; frame: number; seed?: string; count?: number; color?: string}> = ({
  x,
  y,
  r0,
  r1,
  k,
  frame,
  seed = 'en',
  count = 16,
  color = '#ffd23a',
}) => {
  if (k <= 0.01) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', mixBlendMode: 'screen', filter: `drop-shadow(0 0 10px ${color})`, pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const fl = Math.floor(frame / 2);
        const a = (i / count) * Math.PI * 2 + (random(`${seed}a${i}`) - 0.5) * 0.3;
        const ph = (frame * 0.09 + random(`${seed}p${i}`)) % 1;
        const ra = lerp(r0, r1, ph);
        const len = (r1 - r0) * 0.35;
        const pts = Array.from({length: 4}).map((__, s) => {
          const rr = ra + (len * s) / 3;
          const jit = (random(`${seed}j${i}${s}${fl}`) - 0.5) * 0.08;
          return `${s ? 'L' : 'M'}${(x + Math.cos(a + jit) * rr).toFixed(1)},${(y + Math.sin(a + jit) * rr).toFixed(1)}`;
        });
        return <path key={i} d={pts.join(' ')} stroke={color} strokeWidth={6 + random(`${seed}w${i}`) * 5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={k * Math.sin(ph * Math.PI)} />;
      })}
    </svg>
  );
};

/** Dotted prediction arrow (animated dashes) from a to b with a bulge. `k` 0..1 draw-on. */
export const PredictArrow: React.FC<{a: [number, number]; b: [number, number]; bend?: number; k: number; frame: number; color?: string; width?: number}> = ({
  a,
  b,
  bend = 0.25,
  k,
  frame,
  color = '#ffd23a',
  width = 9,
}) => {
  if (k <= 0) return null;
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend;
  const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const kk = clamp(k);
  const q = (t: number): [number, number] => [lerp(lerp(a[0], mx, t), lerp(mx, b[0], t), t), lerp(lerp(a[1], my, t), lerp(my, b[1], t), t)];
  const pts = Array.from({length: 24}).map((_, i) => q((i / 23) * kk));
  const end = pts[pts.length - 1];
  const prev = pts[pts.length - 3];
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const head = 30;
  return (
    <g style={{filter: `drop-shadow(0 0 6px ${color})`}}>
      <path d={'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L')} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={-frame * 3} />
      {kk > 0.2 && (
        <path
          d={`M${end[0] + Math.cos(ang + 2.5) * head},${end[1] + Math.sin(ang + 2.5) * head} L${end[0]},${end[1]} L${end[0] + Math.cos(ang - 2.5) * head},${end[1] + Math.sin(ang - 2.5) * head}`}
          stroke={color}
          strokeWidth={width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};

/** Cartoon sweat drop at (x, y), size s px. `k` 0..1 slide down. */
export const SweatDrop: React.FC<{x: number; y: number; s?: number; k?: number}> = ({x, y, s = 60, k = 0}) => (
  <g transform={`translate(${x},${y + k * s * 0.8}) scale(${s / 60})`}>
    <path d="M 0,-34 C 14,-12 24,2 24,14 A 24,24 0 0 1 -24,14 C -24,2 -14,-12 0,-34 Z" fill="#8fd8ff" stroke="#1d4e78" strokeWidth={4} />
    <ellipse cx={-8} cy={10} rx={6} ry={9} fill="#fff" opacity={0.8} />
  </g>
);

/** Dizzy cartoon stars orbiting (x, y). */
export const Stars: React.FC<{x: number; y: number; r: number; t: number; n?: number; color?: string}> = ({x, y, r, t, n = 4, color = '#ffd23a'}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const a = t * 6 + (i / n) * Math.PI * 2;
      const sx = x + Math.cos(a) * r;
      const sy = y + Math.sin(a) * r * 0.32;
      const s = 18 + 6 * Math.sin(a);
      const star = Array.from({length: 10})
        .map((__, k) => {
          const rr = k % 2 ? s * 0.45 : s;
          const aa = (k / 10) * Math.PI * 2 - Math.PI / 2;
          return `${k ? 'L' : 'M'}${(sx + Math.cos(aa) * rr).toFixed(1)},${(sy + Math.sin(aa) * rr).toFixed(1)}`;
        })
        .join(' ');
      return <path key={i} d={star + 'Z'} fill={color} stroke="#7a5a00" strokeWidth={3} />;
    })}
  </g>
);

/** Rising steam / smoke puffs from (x, y). */
export const Steam: React.FC<{x: number; y: number; t: number; k: number; spread?: number; color?: string; seed?: string; n?: number; size?: number}> = ({
  x,
  y,
  t,
  k,
  spread = 120,
  color = '#ffffff',
  seed = 'st',
  n = 9,
  size = 1,
}) => {
  if (k <= 0.01) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const ph = (t * 1.6 + random(`${seed}${i}`)) % 1;
        const px = x + (random(`${seed}x${i}`) - 0.5) * spread + Math.sin(t * 4 + i) * 20 * ph;
        const py = y - ph * 320 * size;
        const r = (24 + ph * 60) * size;
        return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={k * 0.5 * Math.sin(ph * Math.PI)} />;
      })}
    </g>
  );
};

/** Wavy heat-shimmer lines above a point. */
export const HeatWaves: React.FC<{x: number; y: number; t: number; k: number; w?: number; color?: string}> = ({x, y, t, k, w = 200, color = '#ff8a3a'}) =>
  k <= 0.01 ? null : (
    <g opacity={k} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round">
      {[-1, 0, 1].map((i) => {
        const ox = x + i * w * 0.38;
        const ph = (t * 1.3 + i * 0.3) % 1;
        const oy = y - ph * 120;
        return (
          <path
            key={i}
            d={`M${ox},${oy} q 18,-22 0,-44 q -18,-22 0,-44 q 18,-22 0,-44`}
            opacity={Math.sin(ph * Math.PI)}
          />
        );
      })}
    </g>
  );

/** Flashback grade: warm sepia + soft vignette + film edges. */
export const Flashback: React.FC<{k?: number}> = ({k = 1}) => (
  <>
    <AbsoluteFill style={{backdropFilter: `sepia(${0.45 * k}) saturate(${1 - 0.15 * k})`, pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,30,10,${0.55 * k}) 100%)`, pointerEvents: 'none'}} />
  </>
);

/** Red alert tint + pulsing vignette, `k` 0..1. */
export const RedTint: React.FC<{k: number; t: number}> = ({k, t}) =>
  k <= 0.01 ? null : (
    <>
      <AbsoluteFill style={{background: `rgba(255,30,20,${0.22 * k})`, mixBlendMode: 'multiply', pointerEvents: 'none'}} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,0,0,0) 45%, rgba(255,20,10,${(0.45 + 0.15 * Math.sin(t * 20)) * k}) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </>
  );

/** Freeze-frame treatment: comic paper border + slight desat + halftone dots. */
export const FreezeFx: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <>
      <AbsoluteFill style={{backdropFilter: `saturate(${1 - 0.35 * k}) contrast(1.08)`, pointerEvents: 'none'}} />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.22) 2.2px, transparent 2.6px)',
          backgroundSize: '16px 16px',
          opacity: 0.5 * k,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill style={{boxShadow: `inset 0 0 0 ${30 * k}px #fbf6ea, inset 0 0 0 ${36 * k}px #141414`, pointerEvents: 'none'}} />
    </>
  );

/** Big dark backdrop with a radial glow (for diagram/x-ray shots). */
export const LabBg: React.FC<{c1?: string; c2?: string; grid?: boolean; t?: number}> = ({c1 = '#123a52', c2 = '#050b14', grid = true, t = 0}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 48%, ${c1}, ${c2})`}}>
    {grid && (
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(120,220,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(120,220,255,0.08) 2px, transparent 2px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${t * 20}px`,
        }}
      />
    )}
  </AbsoluteFill>
);

/** Whoosh-smear trail behind a moving thing (horizontal). */
export const Smear: React.FC<{x: number; y: number; w: number; h: number; dir?: 1 | -1; k: number; color?: string}> = ({x, y, w, h, dir = 1, k, color = '255,255,255'}) =>
  k <= 0.02 ? null : (
    <div
      style={{
        position: 'absolute',
        left: dir > 0 ? x - w : x,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: h,
        background: `linear-gradient(${dir > 0 ? 90 : 270}deg, rgba(${color},0), rgba(${color},${0.45 * k}))`,
        filter: 'blur(6px)',
      }}
    />
  );

export {clamp, easeOut, kf, lerp};
