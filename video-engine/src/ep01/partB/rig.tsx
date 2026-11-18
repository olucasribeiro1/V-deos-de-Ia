import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PARTS, f, wordAt} from '../timeline';
import {clamp, easeOut, kf, lerp, shake} from '../../lib/anim';

/** Part-local frame of the first frame of Part B. */
export const T0 = f(PARTS.B.start);
/** Part-local frame of a narration word start. */
export const lf = (id: string, n: number) => f(wordAt(id, n)) - T0;

export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word start. */
export const ev = (p: ShotP, id: string, n: number) => lf(id, n) - p.from;

type Dir = 'l' | 'r' | 'u' | 'd';
const DV: Record<Dir, [number, number]> = {l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1]};

export type Shake = {at: number; dur?: number; amp?: number};
export type Punch = {at: number; amt?: number; len?: number};

/**
 * Screen-space camera rig wrapped around a shot: eased push/pan/roll over the shot,
 * whip-pan in/out (motion-blurred slide), decaying shakes and impact zoom punches.
 */
export const Rig: React.FC<{
  dur: number;
  zoom?: [number, number];
  pan?: [number, number, number, number];
  rot?: [number, number];
  origin?: [number, number];
  /** easing exponent for the push (higher = more front-loaded) */
  pow?: number;
  whip?: Dir;
  whipOut?: Dir;
  shakes?: Shake[];
  punches?: Punch[];
  bg?: string;
  children: React.ReactNode;
}> = ({dur, zoom = [1, 1.08], pan = [0, 0, 0, 0], rot = [0, 0], origin = [540, 960], pow = 2, whip, whipOut, shakes = [], punches = [], bg = '#000', children}) => {
  const fr = useCurrentFrame();
  const p = clamp(fr / Math.max(1, dur - 1));
  const e = 1 - Math.pow(1 - p, pow);
  let z = lerp(zoom[0], zoom[1], e);
  for (const pu of punches) {
    const a = pu.amt ?? 0.12;
    const l = pu.len ?? 12;
    z += kf(fr, [pu.at, pu.at + 2, pu.at + l], [0, a, a * 0.25], easeOut) * (fr >= pu.at ? 1 : 0);
  }
  let x = lerp(pan[0], pan[2], e);
  let y = lerp(pan[1], pan[3], e);
  let r = lerp(rot[0], rot[1], e);
  let blur = 0;
  if (whip) {
    const k = 1 - easeOut(clamp(fr / 6));
    const [dx, dy] = DV[whip];
    x -= dx * 260 * k;
    y -= dy * 260 * k;
    z += 0.3 * k;
    blur = Math.max(blur, 26 * k);
  }
  if (whipOut) {
    const k = Math.pow(clamp((fr - (dur - 5)) / 5), 2);
    const [dx, dy] = DV[whipOut];
    x += dx * 260 * k;
    y += dy * 260 * k;
    z += 0.25 * k;
    blur = Math.max(blur, 22 * k);
  }
  for (const s of shakes) {
    const sh = shake(fr, s.at, s.dur ?? 14, s.amp ?? 22, s.at + 3);
    x += sh.x;
    y += sh.y;
    r += sh.r * 57;
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: bg}}>
      <AbsoluteFill
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${z})`,
          transformOrigin: `${origin[0]}px ${origin[1]}px`,
          filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Mask that fades its content out inside the caption bands (top ≈14–26 %, bottom ≈70–82 %). */
export const BAND_MASK =
  'linear-gradient(to bottom, #000 0%, #000 11%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 26%, #000 30%, #000 66%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.08) 82%, #000 86%)';
export const BandSafe: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={{WebkitMaskImage: BAND_MASK, maskImage: BAND_MASK, pointerEvents: 'none', ...style}}>{children}</AbsoluteFill>
);

/** Horizontal speed streaks (whip / flight), `k` 0..1 strength. */
export const SpeedLines: React.FC<{k: number; t: number; color?: string; vertical?: boolean; count?: number}> = ({k, t, color = '255,255,255', vertical, count = 26}) => {
  if (k <= 0.01) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <svg width={1080} height={1920}>
        {Array.from({length: count}).map((_, i) => {
          const r1 = ((i * 7919) % 101) / 101;
          const r2 = ((i * 104729) % 97) / 97;
          const len = 200 + r2 * 600;
          const pos = r1 * (vertical ? 1080 : 1920);
          const ph = ((t * (2600 + r2 * 2400) + r1 * 4000) % 3200) - 1000;
          return vertical ? (
            <rect key={i} x={pos} y={ph} width={2 + r2 * 5} height={len} fill={`rgba(${color},${0.2 + r2 * 0.4})`} rx={3} />
          ) : (
            <rect key={i} x={1080 - ph} y={pos} width={len} height={2 + r2 * 5} fill={`rgba(${color},${0.2 + r2 * 0.4})`} rx={3} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
