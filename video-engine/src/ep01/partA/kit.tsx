import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {H, W} from '../../lib/constants';
import {clamp, easeOut, kf, shake} from '../../lib/anim';
import {useUid} from '../../lib/useUid';
import {f} from '../timeline';
import type {Lighting} from '../../characters/types';

/** Props every shot receives: absolute start frame (episode timeline) and duration in frames. */
export type ShotProps = {start: number; d: number};

/** Local frame of an absolute time in seconds, relative to the shot start. */
export const atS = (start: number, s: number) => f(s) - start;

export type Shake = {at: number; dur: number; amp: number; seed?: number};
export type Punch = {at: number; amt: number; dur?: number};

/**
 * 2D camera on top of a shot: push-in/out (zoom), pan, roll, a whip-in on the first frames,
 * impact punches (scale bumps) and decaying shake.
 */
export const Cam2D: React.FC<{
  d: number;
  zoom?: [number, number];
  pan?: [number, number, number, number];
  roll?: [number, number];
  origin?: [number, number];
  whip?: 'left' | 'right' | 'up' | 'down' | 'zoom';
  shakes?: Shake[];
  punches?: Punch[];
  ease?: (t: number) => number;
  children: React.ReactNode;
}> = ({d, zoom = [1, 1.08], pan = [0, 0, 0, 0], roll = [0, 0], origin = [W / 2, H / 2], whip, shakes = [], punches = [], ease = easeOut, children}) => {
  const frame = useCurrentFrame();
  const p = kf(frame, [0, d], [0, 1], ease);
  let s = zoom[0] + (zoom[1] - zoom[0]) * p;
  let x = pan[0] + (pan[2] - pan[0]) * p;
  let y = pan[1] + (pan[3] - pan[1]) * p;
  let r = roll[0] + (roll[1] - roll[0]) * p;
  for (const pu of punches) {
    const dur = pu.dur ?? 10;
    if (frame >= pu.at && frame < pu.at + dur) {
      const k = (frame - pu.at) / dur;
      s *= 1 + pu.amt * Math.sin(Math.min(1, k * 3) * Math.PI * 0.5) * (1 - k) * (1 - k) * 1.6;
    }
  }
  for (const sh of shakes) {
    const o = shake(frame, sh.at, sh.dur, sh.amp, sh.seed ?? 2);
    x += o.x;
    y += o.y;
    r += o.r * 14;
  }
  if (shakes.length) s *= 1.04;
  let blur = 0;
  if (whip) {
    const w = 1 - kf(frame, [0, 6], [0, 1], easeOut);
    const dist = 520 * w;
    if (whip === 'left') x -= dist;
    if (whip === 'right') x += dist;
    if (whip === 'up') y -= dist;
    if (whip === 'down') y += dist;
    if (whip === 'zoom') s *= 1 + w * 0.35;
    blur = w * 14;
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
          transformOrigin: `${origin[0]}px ${origin[1]}px`,
          filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {whip && whip !== 'zoom' && <WhipStreaks frame={frame} dir={whip} />}
    </AbsoluteFill>
  );
};

/** Bright motion streaks during the first frames of a whip-pan. */
export const WhipStreaks: React.FC<{frame: number; dir: 'left' | 'right' | 'up' | 'down'}> = ({frame, dir}) => {
  const k = 1 - clamp(frame / 5);
  if (k <= 0) return null;
  const horiz = dir === 'left' || dir === 'right';
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: k * 0.8, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {Array.from({length: 26}).map((_, i) => {
          const a = random(`ws-${i}`);
          const b = random(`ws-b-${i}`);
          const len = 300 + b * 700;
          const th = 2 + random(`ws-t-${i}`) * 6;
          return horiz ? (
            <rect key={i} x={a * W - len / 2} y={random(`ws-y-${i}`) * H} width={len} height={th} fill="#fff" opacity={0.15 + b * 0.3} />
          ) : (
            <rect key={i} y={a * H - len / 2} x={random(`ws-y-${i}`) * W} height={len} width={th} fill="#fff" opacity={0.15 + b * 0.3} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Quick white flash on the first frames of a shot (impact / memory cut). */
export const CutFlash: React.FC<{frames?: number; color?: string; at?: number; peak?: number}> = ({frames = 5, color = '255,255,255', at = 0, peak = 0.9}) => {
  const frame = useCurrentFrame();
  const k = kf(frame, [at, at + 1, at + frames], [0, peak, 0], (x) => x);
  if (k <= 0.01) return null;
  return <AbsoluteFill style={{background: `rgba(${color},${k})`, pointerEvents: 'none'}} />;
};

/** Speed lines radiating or streaming (fall / slow-mo). */
export const SpeedLines: React.FC<{t: number; dir?: 'up' | 'left' | 'radial'; count?: number; opacity?: number; color?: string; seed?: string; speed?: number}> = ({
  t,
  dir = 'up',
  count = 40,
  opacity = 0.5,
  color = '#ffffff',
  seed = 'sl',
  speed = 2600,
}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
    <svg width={W} height={H}>
      {Array.from({length: count}).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const len = 180 + r('l') * 520;
        const th = 2 + r('t') * 5;
        if (dir === 'radial') {
          const a = r('a') * Math.PI * 2;
          const d0 = 380 + (((r('d') * 900 + t * speed * (0.5 + r('s'))) % 900) + 900) % 900;
          const x1 = W / 2 + Math.cos(a) * d0;
          const y1 = H / 2 + Math.sin(a) * d0;
          return <line key={i} x1={x1} y1={y1} x2={x1 + Math.cos(a) * len * 0.6} y2={y1 + Math.sin(a) * len * 0.6} stroke={color} strokeWidth={th} strokeLinecap="round" opacity={0.3 + r('o') * 0.5} />;
        }
        if (dir === 'up') {
          const x = r('x') * W;
          const y = ((((r('y') * (H + len) - t * speed * (0.6 + r('s'))) % (H + len)) + H + len) % (H + len)) - len;
          return <rect key={i} x={x} y={y} width={th} height={len} rx={th / 2} fill={color} opacity={0.3 + r('o') * 0.5} />;
        }
        const y = r('y') * H;
        const x = ((((r('x') * (W + len) - t * speed * (0.6 + r('s'))) % (W + len)) + W + len) % (W + len)) - len;
        return <rect key={i} x={x} y={y} width={len} height={th} rx={th / 2} fill={color} opacity={0.3 + r('o') * 0.5} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** Generic red soda can (no brand). Local units: centred on (0,0), ~ 120 wide × 230 tall. */
export const RedCan: React.FC<{tilt?: number; dent?: number}> = ({tilt = 0, dent = 0}) => {
  const id = useUid('can');
  const w = 60;
  const h = 115;
  return (
    <g transform={`rotate(${tilt})`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#7a0d12" />
          <stop offset="0.18" stopColor="#e2262c" />
          <stop offset="0.32" stopColor="#ff8a82" />
          <stop offset="0.42" stopColor="#e8333a" />
          <stop offset="0.8" stopColor="#a5141b" />
          <stop offset="1" stopColor="#5a080c" />
        </linearGradient>
        <linearGradient id={id + 'm'} x1="0" x2="1">
          <stop offset="0" stopColor="#6c7078" />
          <stop offset="0.3" stopColor="#f1f3f6" />
          <stop offset="0.6" stopColor="#a9adb5" />
          <stop offset="1" stopColor="#53565d" />
        </linearGradient>
      </defs>
      {/* body */}
      <path d={`M${-w},${-h + 14} L${w},${-h + 14} L${w},${h - 12} Q${w - 6},${h} ${w - 18},${h} L${-w + 18},${h} Q${-w + 6},${h} ${-w},${h - 12} Z`} fill={`url(#${id})`} />
      {/* white wave band + bubbles (generic) */}
      <path d={`M${-w},${-10} C${-w * 0.4},${-40} ${w * 0.2},${30} ${w},${-6} L${w},${26} C${w * 0.2},${60} ${-w * 0.4},${-8} ${-w},${22} Z`} fill="#fff3e6" opacity={0.92} />
      {[[-26, -60, 9], [-6, -76, 6], [14, -58, 11], [30, -82, 5], [-30, 60, 6], [18, 70, 8]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#ffe1d6" strokeWidth={3} opacity={0.75} />
      ))}
      {/* top rim */}
      <path d={`M${-w},${-h + 14} Q${-w + 4},${-h - 2} ${-w + 18},${-h - 4} L${w - 18},${-h - 4} Q${w - 4},${-h - 2} ${w},${-h + 14} Z`} fill={`url(#${id + 'm'})`} />
      <rect x={-w + 6} y={-h - 10} width={2 * w - 12} height={10} rx={5} fill={`url(#${id + 'm'})`} />
      {/* bottom */}
      <rect x={-w + 10} y={h - 8} width={2 * w - 20} height={10} rx={5} fill={`url(#${id + 'm'})`} />
      {/* condensation */}
      {Array.from({length: 14}).map((_, i) => (
        <ellipse key={i} cx={-w + 10 + random(`cd-x-${i}`) * (2 * w - 20)} cy={-h + 30 + random(`cd-y-${i}`) * (2 * h - 50)} rx={2.5} ry={3.5} fill="#fff" opacity={0.55} />
      ))}
      {dent > 0 && <path d={`M${w},${-30} q ${-dent * 30},30 0,60`} stroke="#3d0508" strokeWidth={8} fill="none" opacity={0.6} />}
    </g>
  );
};

/** Lighting for neon Tokyo night (magenta rim). */
export const NEON_LIGHT: Lighting = {side: 1, rim: '#ff6bd6', rimStrength: 0.85, shadeStrength: 0.75};
/** Cool memory/flashback light. */
export const DUSK_LIGHT: Lighting = {side: -1, rim: '#ffc58a', rimStrength: 0.6, shadeStrength: 0.6};
/** Bedroom night light (blue window). */
export const ROOM_LIGHT: Lighting = {side: 1, rim: '#8fd0ff', rimStrength: 0.75, shadeStrength: 0.7};

/** Davi's right wrist position in puppet units for a given pose (no lean). */
export const wristR = (shR: number, elR: number): [number, number] => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const ex = 128 + Math.sin(rad(shR)) * 182;
  const ey = -728 + Math.cos(rad(shR)) * 182;
  return [ex + Math.sin(rad(shR + elR)) * 168, ey + Math.cos(rad(shR + elR)) * 168];
};

/** Old-film flashback grade: desaturate, warm-teal tint, flicker. */
export const MemoryGrade: React.FC<{frame: number}> = ({frame}) => (
  <>
    <AbsoluteFill style={{backdropFilter: 'saturate(0.55) contrast(1.05)', pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: 'rgba(60,110,140,0.22)', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0) 50%, rgba(10,20,30,${0.55 + 0.05 * Math.sin(frame * 2.1)}) 100%)`,
        pointerEvents: 'none',
      }}
    />
  </>
);
