import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Cam, horizonY, project, projectDir} from '../../lib/camera';
import {H, W} from '../../lib/constants';
import {clamp} from '../../lib/anim';
import {Head} from '../../characters/parts';
import type {Expression, Outfit} from '../../characters/types';
import {SUNSET_LIGHT} from '../../characters/types';

/** Something floating on / above the open ocean. */
export type SeaActor = {
  key: string;
  x: number;
  z: number;
  y?: number;
  render: (p: {sx: number; sy: number; ppm: number; depth: number}) => React.ReactNode;
};

/**
 * Open ocean in the same sunset palette as the Copacabana set: sky, low sun, glitter
 * column and a perspective field of wavelets (gives scale for drone moves).
 */
export const Ocean: React.FC<{cam: Cam; t: number; actors?: SeaActor[]; sunX?: number; sunElev?: number; noSky?: boolean}> = ({
  cam,
  t,
  actors = [],
  sunX = -0.18,
  sunElev = 0.05,
}) => {
  const hy = horizonY(cam);
  const sun = projectDir(cam, sunX, sunElev, 1);
  // wavelets on log-spaced rows
  const waves: React.ReactNode[] = [];
  const h = Math.max(0.5, cam.y);
  let dz = 0.4;
  let row = 0;
  while (dz < 9000 && row < 140) {
    const z = cam.z + dz;
    const dist = Math.sqrt(dz * dz + h * h);
    const dx = Math.max(0.35, dist * 0.11);
    const rowOff = random(`row${row}`) * dx;
    const k0 = Math.floor((cam.x - dist * 1.2 - rowOff) / dx);
    const k1 = Math.ceil((cam.x + dist * 1.2 - rowOff) / dx);
    for (let k = k0; k <= k1 && k - k0 < 60; k++) {
      const jx = (random(`wx${row}-${k}`) - 0.5) * dx * 0.7;
      const jz = (random(`wz${row}-${k}`) - 0.5) * dx * 0.5;
      const x = k * dx + rowOff + jx + Math.sin(t * 0.7 + k) * dx * 0.05;
      const pr = project(cam, x, 0, z + jz);
      if (!pr || pr.sx < -120 || pr.sx > W + 120 || pr.sy < hy - 2 || pr.sy > H + 60) continue;
      const s = dx * 0.32 * (0.6 + random(`ws${row}-${k}`) * 0.8);
      const w = s * pr.ppm;
      if (w < 1.2) continue;
      const lift = w * 0.18 * (0.3 + 0.7 * Math.abs(Math.sin(t * 2 + k * 1.3 + row)));
      const fade = clamp((pr.sy - hy) / 160);
      const tw = 0.35 + 0.35 * Math.sin(t * 3 + k * 2.1 + row * 0.7);
      waves.push(
        <path
          key={`${row}-${k}`}
          d={`M${pr.sx - w},${pr.sy} Q${pr.sx},${pr.sy - lift} ${pr.sx + w},${pr.sy}`}
          stroke={random(`wc${row}-${k}`) > 0.7 ? '#ffe2bd' : '#9fb7cf'}
          strokeWidth={Math.max(1, w * 0.07)}
          fill="none"
          strokeLinecap="round"
          opacity={fade * tw}
        />,
      );
      if (w > 6 && random(`wd${row}-${k}`) > 0.5) {
        waves.push(
          <path
            key={`d${row}-${k}`}
            d={`M${pr.sx - w * 0.8},${pr.sy + w * 0.08} Q${pr.sx},${pr.sy + w * 0.2} ${pr.sx + w * 0.8},${pr.sy + w * 0.08}`}
            stroke="#1d3150"
            strokeWidth={Math.max(1, w * 0.08)}
            fill="none"
            strokeLinecap="round"
            opacity={fade * 0.35}
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
    <AbsoluteFill style={{overflow: 'hidden', background: '#2b4466'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="oc-sky" gradientUnits="userSpaceOnUse" x1="0" y1={hy - 1500} x2="0" y2={hy}>
            <stop offset="0" stopColor="#4b4f7e" />
            <stop offset="0.35" stopColor="#a5708a" />
            <stop offset="0.68" stopColor="#ec9a63" />
            <stop offset="0.9" stopColor="#ffcf86" />
            <stop offset="1" stopColor="#ffe6b0" />
          </linearGradient>
          <radialGradient id="oc-sun" gradientUnits="userSpaceOnUse" cx={sun.sx} cy={sun.sy} r={900}>
            <stop offset="0" stopColor="#fffbe8" stopOpacity={1} />
            <stop offset="0.06" stopColor="#fff1c4" stopOpacity={0.95} />
            <stop offset="0.25" stopColor="#ffc979" stopOpacity={0.45} />
            <stop offset="1" stopColor="#ff9d5c" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="oc-sea" gradientUnits="userSpaceOnUse" x1="0" y1={hy} x2="0" y2={Math.max(hy + 900, H)}>
            <stop offset="0" stopColor="#d6a59a" />
            <stop offset="0.12" stopColor="#8a86a0" />
            <stop offset="0.45" stopColor="#3f5f86" />
            <stop offset="1" stopColor="#223a5e" />
          </linearGradient>
          <radialGradient id="oc-glint" gradientUnits="userSpaceOnUse" cx={sun.sx} cy={hy} r={700}>
            <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55} />
            <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
          </radialGradient>
        </defs>
        {hy > -50 && <rect x={0} y={-100} width={W} height={Math.max(0, hy + 102)} fill="url(#oc-sky)" />}
        {hy > -50 && <rect x={0} y={-100} width={W} height={Math.max(0, hy + 102)} fill="url(#oc-sun)" />}
        {hy > -50 && [
          [-0.6, 0.16, 520, 26, 0.35],
          [0.35, 0.22, 680, 30, 0.3],
          [0.7, 0.11, 380, 14, 0.4],
        ].map(([dx, dy, rx, ry, o], i) => {
          const c = projectDir(cam, dx + t * 0.004, dy, 1);
          return <ellipse key={i} cx={c.sx} cy={c.sy} rx={rx} ry={ry} fill="#ffd9b0" opacity={o} />;
        })}
        {hy > -50 && hy < H + 50 && <circle cx={sun.sx} cy={sun.sy} r={46} fill="#fffaf0" />}
        <rect x={0} y={Math.max(-100, hy)} width={W} height={H + 200} fill="url(#oc-sea)" />
        <rect x={0} y={Math.max(-100, hy)} width={W} height={H + 200} fill="url(#oc-glint)" style={{mixBlendMode: 'screen'}} />
        {/* glitter column */}
        {Array.from({length: 30}).map((_, i) => {
          const z = 30 + i * i * 3;
          const p = project(cam, cam.x + ((sun.sx - W / 2) * z) / cam.f, 0, z + cam.z);
          if (!p || p.sy < hy || p.sy > H) return null;
          const w = (14 + (i % 3) * 10) * Math.max(0.25, Math.min(1.6, p.ppm / 20)) * (0.6 + 0.4 * Math.sin(t * 6 + i * 1.7));
          return <rect key={i} x={p.sx - w + Math.sin(t * 3 + i) * 6} y={p.sy} width={w * 2} height={Math.max(1.5, p.ppm * 0.08)} rx={2} fill="#fff1c9" opacity={0.7} />;
        })}
        {waves}
      </svg>
      {/* haze at the horizon */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(255,205,150,0) ${((hy - 300) / H) * 100}%, rgba(255,214,160,0.35) ${(hy / H) * 100}%, rgba(255,205,150,0) ${((hy + 200) / H) * 100}%)`,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill>{items.map((it) => <React.Fragment key={it.key}>{it.node}</React.Fragment>)}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Expanding foam rings on the water at (sx, sy). age in frames. */
export const Ripples: React.FC<{sx: number; sy: number; ppm: number; age: number; n?: number; flat?: number}> = ({sx, sy, ppm, age, n = 3, flat = 0.28}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const a = age - i * 7;
      if (a < 0) return null;
      const r = (0.4 + a * 0.06) * ppm;
      const o = clamp(1 - a / 40);
      return <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * flat} fill="none" stroke="#f4f1ea" strokeWidth={Math.max(1.5, ppm * 0.04)} opacity={o * 0.8} />;
    })}
  </g>
);

/** Ballistic water splash (crown of droplets + white column + foam). age in frames, 30 fps. */
export const Splash: React.FC<{sx: number; sy: number; ppm: number; age: number; size?: number; seed?: string}> = ({sx, sy, ppm, age, size = 1, seed = 'sp'}) => {
  if (age < 0) return null;
  const tt = age / 30;
  const g = 9.8;
  const drops = Array.from({length: 46}).map((_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const ang = r('a') * Math.PI * 2;
    const vh = (1.2 + r('h') * 2.8) * size;
    const vy = (3 + r('v') * 6) * size;
    const x = Math.cos(ang) * vh * tt;
    const zz = Math.sin(ang) * vh * tt * 0.3;
    const y = vy * tt - 0.5 * g * tt * tt;
    if (y < -0.05) return null;
    const rad = Math.max(1.5, (0.05 + r('s') * 0.09) * size * ppm);
    return <circle key={i} cx={sx + x * ppm} cy={sy - y * ppm + zz * ppm} r={rad} fill={r('c') > 0.3 ? '#f6fbff' : '#bfe0f5'} opacity={0.95} />;
  });
  const colH = Math.max(0, (6 * tt - 0.5 * g * 1.6 * tt * tt) * 1.3) * size;
  const colW = (0.35 + tt * 0.9) * size;
  const foamR = (0.5 + tt * 2.4) * size;
  const foamO = clamp(1 - tt / 1.6);
  return (
    <g>
      <ellipse cx={sx} cy={sy} rx={foamR * ppm} ry={foamR * ppm * 0.25} fill="#eef6fb" opacity={0.75 * foamO} />
      <ellipse cx={sx} cy={sy} rx={foamR * ppm * 1.25} ry={foamR * ppm * 0.31} fill="none" stroke="#fff" strokeWidth={Math.max(2, ppm * 0.06)} opacity={0.8 * foamO} />
      {colH > 0.02 && (
        <path
          d={`M${sx - colW * ppm},${sy} Q${sx - colW * 0.4 * ppm},${sy - colH * ppm * 0.6} ${sx},${sy - colH * ppm} Q${sx + colW * 0.4 * ppm},${sy - colH * ppm * 0.6} ${sx + colW * ppm},${sy} Z`}
          fill="#f2f9ff"
          opacity={0.9}
        />
      )}
      {drops}
    </g>
  );
};

/** A head bobbing in the water, waterline at (sx, sy). Body hinted under the surface. */
export const SwimHead: React.FC<{
  sx: number;
  sy: number;
  ppm: number;
  outfit: Outfit;
  expr?: Expression;
  facing?: number;
  tilt?: number;
  t: number;
  seed?: number;
  /** extra stuff drawn on top (in head-local units, origin = head centre) */
  over?: React.ReactNode;
}> = ({sx, sy, ppm, outfit, expr = {}, facing = 0, tilt = 0, t, seed = 0, over}) => {
  const k = (ppm * 1.75) / 1000;
  const bob = Math.sin(t * 2.6 + seed) * 12;
  const id = `swim-${seed}`;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id={id}>
          <rect x={-2000} y={-3000} width={4000} height={3000 + 70 - bob} />
        </clipPath>
      </defs>
      <g transform={`translate(${sx},${sy}) scale(${k})`}>
        {/* submerged body */}
        <ellipse cx={0} cy={260} rx={170} ry={210} fill={outfit.top.base} opacity={0.32} />
        <ellipse cx={0} cy={140} rx={140} ry={60} fill={outfit.top.shade} opacity={0.35} />
        <g clipPath={`url(#${id})`}>
          <g transform={`translate(0,${-60 + bob}) rotate(${tilt})`}>
            <Head skin={outfit.skin} style={outfit.head} expr={expr} light={SUNSET_LIGHT} facing={facing} />
            {over}
          </g>
        </g>
        {/* wet shine line + foam collar */}
        <ellipse cx={0} cy={70} rx={190} ry={36} fill="none" stroke="#f6f2ea" strokeWidth={14} opacity={0.85} />
        <ellipse cx={0} cy={74} rx={250} ry={50} fill="none" stroke="#e9f2f8" strokeWidth={6} opacity={0.4} />
      </g>
    </svg>
  );
};

/** Orange ring buoy (lifebuoy), centred at 0,0, radius r (svg units). `flat` squashes it for perspective. */
export const Buoy: React.FC<{r: number; flat?: number}> = ({r, flat = 1}) => (
  <g transform={`scale(1,${flat})`}>
    <circle r={r * 0.78} fill="none" stroke="#b8400f" strokeWidth={r * 0.46} transform={`translate(0,${r * 0.06})`} />
    <circle r={r * 0.78} fill="none" stroke="#ff6a1f" strokeWidth={r * 0.44} />
    {[0, 90, 180, 270].map((a) => (
      <circle
        key={a}
        r={r * 0.78}
        fill="none"
        stroke="#f8f4ec"
        strokeWidth={r * 0.45}
        strokeDasharray={`${r * 0.5} ${Math.PI * 2 * r * 0.78 - r * 0.5}`}
        transform={`rotate(${a + 20})`}
      />
    ))}
    <circle r={r * 0.78} fill="none" stroke="#ffd2a8" strokeWidth={r * 0.08} strokeDasharray={`${r * 1.2} ${r * 3.7}`} transform="rotate(200)" opacity={0.7} />
    <circle r={r * 1.0} fill="none" stroke="#7a3a1a" strokeWidth={r * 0.03} opacity={0.4} />
  </g>
);
