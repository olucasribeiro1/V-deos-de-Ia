import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Cam, horizonY, project, projectDir} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp} from '../../lib/anim';

export type SeaActor = {
  key: string;
  x: number;
  z: number;
  y?: number;
  render: (p: {sx: number; sy: number; ppm: number; depth: number}) => React.ReactNode;
};

/**
 * Cold open ocean at 43° S: overcast grey sky, dark grey-green water, whitecaps.
 * Same perspective wavelet field as the EP01 ocean, re-coloured cold.
 */
export const ColdSea: React.FC<{cam: Cam; t: number; actors?: SeaActor[]; swell?: number}> = ({cam, t, actors = [], swell = 1}) => {
  const hy = horizonY(cam);
  const sun = projectDir(cam, 0.25, 0.12, 1);
  const waves: React.ReactNode[] = [];
  const h = Math.max(0.5, cam.y);
  let dz = 0.4;
  let row = 0;
  while (dz < 9000 && row < 140) {
    const z = cam.z + dz;
    const dist = Math.sqrt(dz * dz + h * h);
    const dx = Math.max(0.35, dist * 0.1);
    const rowOff = random(`cr${row}`) * dx;
    const k0 = Math.floor((cam.x - dist * 1.2 - rowOff) / dx);
    const k1 = Math.ceil((cam.x + dist * 1.2 - rowOff) / dx);
    for (let k = k0; k <= k1 && k - k0 < 60; k++) {
      const jx = (random(`cx${row}-${k}`) - 0.5) * dx * 0.7;
      const jz = (random(`cz${row}-${k}`) - 0.5) * dx * 0.5;
      const x = k * dx + rowOff + jx + Math.sin(t * 0.9 + k) * dx * 0.08;
      const pr = project(cam, x, 0, z + jz);
      if (!pr || pr.sx < -120 || pr.sx > W + 120 || pr.sy < hy - 2 || pr.sy > H + 60) continue;
      const s = dx * 0.34 * (0.6 + random(`cs${row}-${k}`) * 0.8);
      const w = s * pr.ppm;
      if (w < 1.2) continue;
      const lift = w * 0.3 * swell * (0.3 + 0.7 * Math.abs(Math.sin(t * 2.4 + k * 1.3 + row)));
      const fade = clamp((pr.sy - hy) / 120);
      const cap = random(`cc${row}-${k}`) > 0.82;
      const tw = 0.4 + 0.35 * Math.sin(t * 3 + k * 2.1 + row * 0.7);
      waves.push(
        <path
          key={`${row}-${k}`}
          d={`M${pr.sx - w},${pr.sy} Q${pr.sx},${pr.sy - lift} ${pr.sx + w},${pr.sy}`}
          stroke={cap ? '#e9f1f2' : '#7f9aa0'}
          strokeWidth={Math.max(1, w * (cap ? 0.12 : 0.07))}
          fill="none"
          strokeLinecap="round"
          opacity={fade * (cap ? 0.9 : tw)}
        />,
      );
      if (w > 6 && random(`cd${row}-${k}`) > 0.45) {
        waves.push(
          <path
            key={`d${row}-${k}`}
            d={`M${pr.sx - w * 0.9},${pr.sy + w * 0.1} Q${pr.sx},${pr.sy + w * 0.26} ${pr.sx + w * 0.9},${pr.sy + w * 0.1}`}
            stroke="#08141a"
            strokeWidth={Math.max(1, w * 0.1)}
            fill="none"
            strokeLinecap="round"
            opacity={fade * 0.45}
          />,
        );
      }
    }
    dz *= 1.09;
    row++;
  }
  const items = actors
    .map((a) => {
      const pr = project(cam, a.x, a.y ?? 0, a.z);
      if (!pr) return null;
      return {key: a.key, depth: pr.depth, node: a.render({sx: pr.sx, sy: pr.sy, ppm: pr.ppm, depth: pr.depth})};
    })
    .filter(Boolean) as {key: string; depth: number; node: React.ReactNode}[];
  items.sort((a, b) => b.depth - a.depth);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#16262d'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="cs-sky" gradientUnits="userSpaceOnUse" x1="0" y1={hy - 1500} x2="0" y2={hy}>
            <stop offset="0" stopColor="#2c3a46" />
            <stop offset="0.6" stopColor="#5f707b" />
            <stop offset="1" stopColor="#b3bec2" />
          </linearGradient>
          <radialGradient id="cs-sun" gradientUnits="userSpaceOnUse" cx={sun.sx} cy={sun.sy} r={700}>
            <stop offset="0" stopColor="#e8eef0" stopOpacity={0.55} />
            <stop offset="1" stopColor="#e8eef0" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="cs-sea" gradientUnits="userSpaceOnUse" x1="0" y1={hy} x2="0" y2={Math.max(hy + 900, H)}>
            <stop offset="0" stopColor="#8a9ba0" />
            <stop offset="0.12" stopColor="#3f5a61" />
            <stop offset="0.5" stopColor="#213840" />
            <stop offset="1" stopColor="#0f1f25" />
          </linearGradient>
        </defs>
        {hy > -50 && <rect x={0} y={-100} width={W} height={Math.max(0, hy + 102)} fill="url(#cs-sky)" />}
        {hy > -50 && <rect x={0} y={-100} width={W} height={Math.max(0, hy + 102)} fill="url(#cs-sun)" />}
        {hy > -50 &&
          [
            [-0.5, 0.14, 700, 60, 0.35],
            [0.3, 0.26, 900, 80, 0.3],
            [0.8, 0.08, 500, 30, 0.4],
            [-0.1, 0.4, 1100, 120, 0.25],
          ].map(([dx, dy, rx, ry, o], i) => {
            const c = projectDir(cam, dx + t * 0.01, dy, 1);
            return <ellipse key={i} cx={c.sx} cy={c.sy} rx={rx} ry={ry} fill="#4a5863" opacity={o} />;
          })}
        <rect x={0} y={Math.max(-100, hy)} width={W} height={H + 200} fill="url(#cs-sea)" />
        {waves}
      </svg>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(200,215,220,0) ${((hy - 260) / H) * 100}%, rgba(200,215,220,0.35) ${(hy / H) * 100}%, rgba(200,215,220,0) ${((hy + 160) / H) * 100}%)`,
        }}
      />
      <AbsoluteFill>{items.map((it) => <React.Fragment key={it.key}>{it.node}</React.Fragment>)}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Wind-blown spray / sleet streaks across the frame. */
export const Spray: React.FC<{t: number; count?: number; seed?: string; opacity?: number}> = ({t, count = 60, seed = 'spr', opacity = 0.5}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {Array.from({length: count}).map((_, i) => {
      const r = (k: string) => random(`${seed}-${i}-${k}`);
      const sp = 500 + r('s') * 900;
      const x = ((r('x') * W * 1.4 - t * sp) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2;
      const y = ((r('y') * H + t * sp * 0.35) % H + H) % H;
      const len = 20 + r('l') * 50;
      return <line key={i} x1={x} y1={y} x2={x + len} y2={y - len * 0.35} stroke="#e8f2f4" strokeWidth={1.5 + r('w') * 2.5} strokeLinecap="round" opacity={opacity * (0.4 + r('o') * 0.6)} />;
    })}
  </svg>
);
