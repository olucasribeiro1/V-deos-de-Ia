import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, groundPath} from '../lib/camera';
import {H, W} from '../lib/constants';
import {clamp} from '../lib/anim';

/**
 * Concentric shockwave rings. Screen-space rings (air) + optional ground rings
 * projected with the camera. `age` in frames since the bang.
 */
export const Shockwave: React.FC<{
  cx: number;
  cy: number;
  age: number;
  rings?: number;
  /** px per frame */
  speed?: number;
  gap?: number;
  maxR?: number;
  ground?: {cam: Cam; x: number; z: number; speed?: number};
  color?: string;
}> = ({cx, cy, age, rings = 4, speed = 38, gap = 5, maxR = 1600, ground, color = '255,255,255'}) => {
  if (age < 0) return null;
  const items = Array.from({length: rings}).map((_, i) => {
    const a = age - i * gap;
    if (a < 0) return null;
    const r = Math.pow(a, 0.85) * speed;
    if (r > maxR) return null;
    const o = clamp(1 - r / maxR) * (1 - i * 0.12);
    return (
      <g key={i}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`rgba(${color},${0.25 * o})`} strokeWidth={34 - i * 4} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`rgba(${color},${0.8 * o})`} strokeWidth={5} />
        <circle cx={cx} cy={cy} r={r * 0.97} fill="none" stroke={`rgba(160,210,255,${0.4 * o})`} strokeWidth={3} />
      </g>
    );
  });
  const groundRings =
    ground &&
    Array.from({length: 3}).map((_, i) => {
      const a = age - i * gap;
      if (a < 0) return null;
      const R = Math.pow(a, 0.85) * (ground.speed ?? 0.35);
      const o = clamp(1 - R / 14);
      const pts = Array.from({length: 73}).map((__, k) => {
        const th = (k / 72) * Math.PI * 2;
        return [ground.x + Math.cos(th) * R, ground.z + Math.sin(th) * R] as [number, number];
      });
      return (
        <path key={i} d={groundPath(ground.cam, pts, true)} fill="none" stroke={`rgba(255,250,240,${0.85 * o})`} strokeWidth={6 - i} />
      );
    });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(170,215,255,0.8))'}}>
        {groundRings}
        {items}
      </svg>
    </AbsoluteFill>
  );
};
