import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import cutlist from './cutlist.json';
import {PARTS, f, wordAt} from '../timeline';
import {clamp, kf, shake} from '../../lib/anim';

type CutDef = {id: string; line?: string; word?: number; abs?: number; desc: string};
const DEFS = cutlist.cuts as CutDef[];

const absStart = (c: CutDef) => (c.abs !== undefined ? c.abs : wordAt(c.line!, c.word!));

export const PART_FROM = f(PARTS.C.start);
export const PART_LEN = f(PARTS.C.end) - PART_FROM;

/** Resolved cuts in part-local frames. */
export const CUTS = DEFS.map((c, i) => {
  const from = f(absStart(c)) - PART_FROM;
  const next = DEFS[i + 1];
  const to = next ? f(absStart(next)) - PART_FROM : PART_LEN;
  return {id: c.id, from, dur: to - from};
});
export const cut = (id: string) => CUTS.find((c) => c.id === id)!;
/** Local (to the shot) frame of an absolute narration word. */
export const wordLocal = (shotId: string, line: string, n: number) => f(wordAt(line, n)) - PART_FROM - cut(shotId).from;

export const useShot = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return {frame, fps, dur: durationInFrames, t: frame / fps, p: clamp(frame / Math.max(1, durationInFrames - 1))};
};

export type Whip = 'left' | 'right' | 'up' | 'down' | 'zoom';

/**
 * 2D camera rig on top of the scene: continuous push (scale from s0 -> s1), drift,
 * roll, optional shake impacts and whip-in / whip-out motion blur at the edges of the shot.
 */
export const Rig: React.FC<{
  children: React.ReactNode;
  s0?: number;
  s1?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  r0?: number;
  r1?: number;
  ox?: number;
  oy?: number;
  ease?: (t: number) => number;
  whipIn?: Whip;
  whipOut?: Whip;
  impacts?: {at: number; amp: number; dur?: number; zoom?: number}[];
}> = ({children, s0 = 1, s1 = 1.1, x0 = 0, x1 = 0, y0 = 0, y1 = 0, r0 = 0, r1 = 0, ox = 540, oy = 960, ease, whipIn, whipOut, impacts = []}) => {
  const {frame, dur, p} = useShot();
  const e = ease ? ease(p) : 1 - Math.pow(1 - p, 1.6);
  let s = s0 + (s1 - s0) * e;
  let x = x0 + (x1 - x0) * e;
  let y = y0 + (y1 - y0) * e;
  let r = r0 + (r1 - r0) * e;
  let blur = 0;
  for (const [i, im] of impacts.entries()) {
    const sh = shake(frame, im.at, im.dur ?? 12, im.amp, i + 3);
    x += sh.x;
    y += sh.y;
    r += sh.r * 57;
    if (im.zoom) s *= 1 + kf(frame, [im.at, im.at + 2, im.at + 10], [0, im.zoom, im.zoom * 0.4]);
  }
  const whip = (w: Whip, k: number) => {
    // k: 1 at the cut edge, 0 when settled
    const d = 900 * k * k;
    if (w === 'left') x -= d;
    if (w === 'right') x += d;
    if (w === 'up') y -= d;
    if (w === 'down') y += d;
    if (w === 'zoom') s *= 1 + 0.6 * k * k;
    blur = Math.max(blur, 26 * k);
  };
  if (whipIn) whip(whipIn, clamp(1 - frame / 5));
  if (whipOut) whip(whipOut, clamp((frame - (dur - 4)) / 4));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
          transformOrigin: `${ox}px ${oy}px`,
          filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Full screen svg layer. */
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);
