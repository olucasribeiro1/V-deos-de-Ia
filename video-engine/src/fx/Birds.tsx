import React from 'react';
import {random} from 'remotion';
import {clamp} from '../lib/anim';

/** One cartoon pigeon. `flap` 0..1 phase, `flying` 0 (standing) .. 1 (wings out). */
export const Pigeon: React.FC<{x: number; y: number; size: number; flap: number; flying: number; dir: 1 | -1; tilt?: number}> = ({
  x,
  y,
  size,
  flap,
  flying,
  dir,
  tilt = 0,
}) => {
  const wing = Math.sin(flap * Math.PI * 2);
  const wy = -wing * 70 * flying;
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${(dir * size) / 100},${size / 100})`}>
      {/* far wing */}
      {flying > 0.05 && <path d={`M -5,-20 Q -20,${-40 + wy * 0.8} -60,${-30 + wy} Q -30,-10 -5,-8 Z`} fill="#6d7280" />}
      {/* body */}
      <ellipse cx={0} cy={-18} rx={34} ry={20} fill="#9aa0ad" />
      <path d="M -30,-22 L -58,-30 L -56,-14 Z" fill="#7b818e" />
      <ellipse cx={4} cy={-10} rx={24} ry={10} fill="#c5c9d2" opacity={0.6} />
      {/* neck + head */}
      <ellipse cx={24} cy={-32} rx={12} ry={14} fill="#6f8f8a" />
      <circle cx={32} cy={-44} r={11} fill="#8a909c" />
      <circle cx={36} cy={-46} r={2.6} fill="#1a1a1a" />
      <path d="M 42,-44 L 52,-41 L 42,-39 Z" fill="#e3a23a" />
      {/* near wing */}
      {flying > 0.05 ? (
        <path d={`M 0,-24 Q 10,${-50 + wy} -30,${-46 + wy * 1.2} Q -10,-18 0,-14 Z`} fill="#7c8290" />
      ) : (
        <path d="M -24,-26 Q 6,-34 18,-20 Q -4,-10 -24,-14 Z" fill="#7c8290" />
      )}
      {/* legs */}
      {flying < 0.5 && (
        <g stroke="#d9665b" strokeWidth={4} strokeLinecap="round">
          <line x1={-2} y1={-2} x2={-4} y2={8} />
          <line x1={8} y1={-2} x2={8} y2={8} />
        </g>
      )}
    </g>
  );
};

/**
 * A flock of pigeons on the ground that bursts away from (ox, oy) at `start` frame.
 * Positions are given in screen px around the origin.
 */
export const PigeonFlock: React.FC<{frame: number; start: number; ox: number; oy: number; count?: number; spread?: number; size?: number; seed?: string}> = ({
  frame,
  start,
  ox,
  oy,
  count = 10,
  spread = 420,
  size = 60,
  seed = 'pg',
}) => (
  <g>
    {Array.from({length: count}).map((_, i) => {
      const r = (k: string) => random(`${seed}-${i}-${k}`);
      const bx = ox + (r('x') - 0.5) * spread * 2;
      const by = oy + (r('y') - 0.3) * spread * 0.35;
      const s = size * (0.7 + r('s') * 0.6) * (1 + (by - oy) / (spread * 1.5));
      const away = bx >= ox ? 1 : -1;
      const age = frame - start - r('d') * 4;
      const fly = clamp(age / 4);
      const vx = away * (6 + r('vx') * 12);
      const vy = -(8 + r('vy') * 11);
      const tt = Math.max(0, age);
      const x = bx + vx * tt + Math.sin(tt * 0.3 + i) * 6;
      const y = by + vy * tt + 0.03 * tt * tt;
      const peck = age < 0 ? Math.max(0, Math.sin(frame * 0.3 + i * 2)) * 4 : 0;
      return (
        <Pigeon
          key={i}
          x={x}
          y={y + peck}
          size={s * (1 + tt * 0.02)}
          flap={tt * 0.32 + r('f')}
          flying={fly}
          dir={(age < 0 ? (r('dir') > 0.5 ? 1 : -1) : away) as 1 | -1}
          tilt={fly * away * -15}
        />
      );
    })}
  </g>
);
