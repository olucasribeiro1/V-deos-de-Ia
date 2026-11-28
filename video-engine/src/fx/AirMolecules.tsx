import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../lib/constants';
import {clamp} from '../lib/anim';

/**
 * Air molecules (shaded blue/white spheres) rushing inward to fill a void.
 * `progress` 0 -> 1: 0 = scattered around, 1 = collapsed onto the target area.
 */
export const AirMolecules: React.FC<{
  cx: number;
  cy: number;
  /** half-size of the void (target area) */
  rx: number;
  ry: number;
  /** how far out the molecules start */
  spread?: number;
  progress: number;
  count?: number;
  size?: number;
  seed?: string;
  t: number;
}> = ({cx, cy, rx, ry, spread = 2.6, progress, count = 60, size = 22, seed = 'air', t}) => {
  const items = Array.from({length: count}).map((_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const a = r('a') * Math.PI * 2;
    const d0 = 1.15 + r('d') * (spread - 1);
    const sx = cx + Math.cos(a) * rx * d0;
    const sy = cy + Math.sin(a) * ry * d0;
    const ta = r('ta') * Math.PI * 2;
    const td = Math.sqrt(r('td')) * 0.85;
    const ex = cx + Math.cos(ta) * rx * td;
    const ey = cy + Math.sin(ta) * ry * td;
    const delay = r('delay') * 0.35;
    const local = clamp((progress - delay) / (1 - delay));
    const e = local * local * (3 - 2 * local);
    const jitter = Math.sin(t * 9 + i) * size * 0.15 * (1 - e);
    const x = sx + (ex - sx) * e + jitter;
    const y = sy + (ey - sy) * e + Math.cos(t * 8 + i) * size * 0.15 * (1 - e);
    const depth = 0.55 + r('z') * 0.9;
    const rad = size * depth;
    const speed = local > 0 && local < 1 ? 6 * local * (1 - local) : 0;
    const red = r('red') > 0.86;
    return {x, y, rad, depth, sx, sy, speed, red, ex, ey};
  });
  items.sort((a, b) => a.depth - b.depth);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <radialGradient id={`${seed}-b`} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.25" stopColor="#cfe9ff" />
            <stop offset="0.7" stopColor="#4f8fe0" />
            <stop offset="1" stopColor="#24427e" />
          </radialGradient>
          <radialGradient id={`${seed}-r`} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.25" stopColor="#ffd2cc" />
            <stop offset="0.7" stopColor="#e0564f" />
            <stop offset="1" stopColor="#7e2424" />
          </radialGradient>
          <radialGradient id={`${seed}-halo`}>
            <stop offset="0" stopColor="#bfe6ff" stopOpacity={0.6} />
            <stop offset="1" stopColor="#bfe6ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {items.map((m, i) => {
          const dx = m.ex - m.sx;
          const dy = m.ey - m.sy;
          const len = Math.hypot(dx, dy) || 1;
          const tail = m.speed * m.rad * 2.2;
          return (
            <g key={i} opacity={0.55 + m.depth * 0.35}>
              {tail > 1 && (
                <line
                  x1={m.x}
                  y1={m.y}
                  x2={m.x - (dx / len) * tail}
                  y2={m.y - (dy / len) * tail}
                  stroke="#bfe6ff"
                  strokeWidth={m.rad * 0.55}
                  strokeLinecap="round"
                  opacity={0.16}
                />
              )}
              <circle cx={m.x} cy={m.y} r={m.rad * 1.8} fill={`url(#${seed}-halo)`} />
              <circle cx={m.x} cy={m.y} r={m.rad} fill={`url(#${seed}-${m.red ? 'r' : 'b'})`} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
