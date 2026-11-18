import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, project, projectDir, horizonY, groundPath} from '../lib/camera';
import {H, W} from '../lib/constants';
import {PROP_SIZE, PropKind, renderProp} from './props';

/** Something standing on the ground of the set (character, prop, fx anchor). */
export type Actor = {
  key: string;
  x: number;
  z: number;
  /** height above ground of the anchor (default 0) */
  y?: number;
  /** cast a long soft shadow toward the camera (sun is behind the subject) */
  shadow?: number;
  /** skip depth-of-field blur (e.g. FX that must stay sharp) */
  sharp?: boolean;
  render: (p: {sx: number; sy: number; ppm: number; blur: number}) => React.ReactNode;
};

export type SetProp = {kind: PropKind; x: number; z: number; seed?: number; scale?: number};

export const COPA_PROPS: SetProp[] = [
  {kind: 'palm', x: -4.4, z: 15.4, seed: 1, scale: 0.85},
  {kind: 'palm', x: 7.6, z: 15.8, seed: 2, scale: 0.9},
  {kind: 'palm', x: -13, z: 15.4, seed: 3, scale: 0.85},
  {kind: 'palm', x: 17, z: 15.8, seed: 4, scale: 0.9},
  {kind: 'palm', x: -26, z: 15.5, seed: 5, scale: 0.85},
  {kind: 'kiosk', x: 3.4, z: 14.2},
  {kind: 'lamp', x: -8.6, z: 14.6},
  {kind: 'lamp', x: 12, z: 14.6},
  {kind: 'umbrella', x: -12, z: 28, seed: 0},
  {kind: 'umbrella', x: -4, z: 34, seed: 1},
  {kind: 'umbrella', x: 3, z: 26, seed: 2},
  {kind: 'umbrella', x: 15, z: 31, seed: 3},
  {kind: 'umbrella', x: 26, z: 27, seed: 1},
  {kind: 'person', x: -6, z: 30, seed: 0},
  {kind: 'person', x: 9, z: 38, seed: 0},
  {kind: 'person', x: 1, z: 40, seed: 0},
];

export type CopacabanaProps = {
  cam: Cam;
  /** seconds, drives water shimmer / sway */
  t: number;
  actors?: Actor[];
  props?: SetProp[];
  /** focus distance in metres (camera depth) */
  focus: number;
  /** blur in px for objects far out of focus */
  aperture?: number;
  /** -1..1, how far the sun sits left/right of centre (world direction) */
  sunX?: number;
  sunElev?: number;
  /** extra global colour grade (0 warm sunset, 1 cold desaturated) */
  cold?: number;
};

const SHORE_Z = 46;
const WALK_END_Z = 16.2;
const BAND = 0.62;
const AMP = 0.42;
const WAVE = 3.4;

const coc = (depth: number, focus: number, aperture: number) => Math.min(aperture * 1.6, (aperture * Math.abs(depth - focus)) / Math.max(depth, 0.1));

/** Black and white Copacabana wave pavement between z0 and z1, projected for `cam`. */
const Pavement: React.FC<{cam: Cam; z0: number; z1: number}> = ({cam, z0, z1}) => {
  const paths: string[] = [];
  const zStart = Math.max(z0, cam.z + 0.25);
  const kStart = Math.floor((zStart - AMP) / BAND);
  const kEnd = Math.ceil((z1 + AMP) / BAND);
  const halfW = ((W / 2 + 260) / cam.f) * (z1 - cam.z) + WAVE;
  const N = 90;
  const boundary = (k: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const x = cam.x - halfW + (2 * halfW * i) / N;
      let z = k * BAND + AMP * Math.sin((2 * Math.PI * x) / WAVE);
      z = Math.min(z1, Math.max(zStart, z));
      pts.push([x, z]);
    }
    return pts;
  };
  for (let k = kStart; k < kEnd; k++) {
    if (((k % 2) + 2) % 2 !== 0) continue;
    const a = boundary(k);
    const b = boundary(k + 1).reverse();
    paths.push(groundPath(cam, [...a, ...b], true));
  }
  return (
    <>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="#2a2629" />
      ))}
    </>
  );
};

export const Copacabana: React.FC<CopacabanaProps> = ({
  cam,
  t,
  actors = [],
  props = COPA_PROPS,
  focus,
  aperture = 10,
  sunX = -0.18,
  sunElev = 0.05,
  cold = 0,
}) => {
  const hy = horizonY(cam);
  const sun = projectDir(cam, sunX, sunElev, 1);
  const farBlur = coc(2000, focus, aperture);

  // hills on the horizon (world points far away)
  const hill = (pts: [number, number][]) => {
    const z = 3200;
    const out = pts.map(([x, y]) => project(cam, x, y, z)).filter(Boolean) as {sx: number; sy: number}[];
    return `M${out[0].sx},${hy + 2} ` + out.map((p) => `L${p.sx},${p.sy}`).join(' ') + ` L${out[out.length - 1].sx},${hy + 2} Z`;
  };
  const hillsBack = hill([
    [-1900, 0], [-1600, 120], [-1400, 170], [-1150, 140], [-950, 90], [-800, 40], [-700, 0],
  ]);
  // Sugarloaf-like dome pair (stylised, left of the sun)
  const sugarloaf = hill([
    [-1250, 0], [-1210, 120], [-1150, 280], [-1090, 330], [-1030, 310], [-985, 200], [-950, 90], [-890, 70], [-840, 110], [-790, 95], [-740, 30], [-700, 0],
  ]);
  const hillsRight = hill([
    [600, 0], [760, 70], [950, 130], [1150, 190], [1300, 170], [1500, 220], [1750, 150], [2000, 90], [2400, 0],
  ]);

  const seaTop = hy;
  const shore = project(cam, cam.x, 0, SHORE_Z);
  const walkEnd = project(cam, cam.x, 0, WALK_END_Z);
  const shoreY = shore ? shore.sy : hy + 40;
  const walkY = walkEnd ? walkEnd.sy : hy + 80;

  // ground layer bins with different blur
  const bins: {z0: number; z1: number}[] = [];
  const nearZ = cam.z + 0.25;
  const edges = [nearZ, Math.max(nearZ + 0.5, focus * 0.45 + cam.z), Math.max(nearZ + 1, focus * 0.8 + cam.z), focus * 1.25 + cam.z, WALK_END_Z];
  for (let i = 0; i < edges.length - 1; i++) {
    const z0 = Math.min(edges[i], WALK_END_Z);
    const z1 = Math.min(edges[i + 1], WALK_END_Z);
    if (z1 > z0 + 0.05) bins.push({z0, z1});
  }

  // merge env props + actors and sort far -> near
  type Item = {key: string; depth: number; node: React.ReactNode; blur: number; sx: number; sy: number};
  const items: Item[] = [];
  props.forEach((p, i) => {
    const pr = project(cam, p.x, 0, p.z);
    if (!pr) return;
    const size = PROP_SIZE[p.kind];
    const scale = (p.scale ?? 1) * pr.ppm;
    const wpx = size.w * scale;
    const hpx = size.h * scale;
    if (pr.sx + wpx < -200 || pr.sx - wpx > W + 200) return;
    const blur = coc(pr.depth, focus, aperture);
    items.push({
      key: 'p' + i,
      depth: pr.depth,
      blur,
      sx: pr.sx,
      sy: pr.sy,
      node: (
        <svg
          style={{position: 'absolute', left: pr.sx - wpx, top: pr.sy - hpx * 1.2, overflow: 'visible', filter: blur > 0.6 ? `blur(${blur}px)` : undefined}}
          width={wpx * 2}
          height={hpx * 1.25}
          viewBox={`${-size.w * 100} ${-size.h * 100 * 1.2} ${size.w * 200} ${size.h * 125}`}
        >
          {renderProp(p.kind, p.seed ?? i, t)}
        </svg>
      ),
    });
  });
  actors.forEach((a) => {
    const pr = project(cam, a.x, a.y ?? 0, a.z);
    if (!pr) return;
    const blur = a.sharp ? 0 : coc(pr.depth, focus, aperture);
    items.push({key: a.key, depth: pr.depth, blur, sx: pr.sx, sy: pr.sy, node: a.render({sx: pr.sx, sy: pr.sy, ppm: pr.ppm, blur})});
  });
  items.sort((a, b) => b.depth - a.depth);

  const shadows = actors.filter((a) => a.shadow);

  const grade = cold;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#d98b5f'}}>
      {/* SKY + SEA + HILLS (far, blurred) */}
      <AbsoluteFill style={{filter: `blur(${farBlur}px)`, transform: 'scale(1.03)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="copa-sky" gradientUnits="userSpaceOnUse" x1="0" y1={hy - 1500} x2="0" y2={hy}>
              <stop offset="0" stopColor="#4b4f7e" />
              <stop offset="0.35" stopColor="#a5708a" />
              <stop offset="0.68" stopColor="#ec9a63" />
              <stop offset="0.9" stopColor="#ffcf86" />
              <stop offset="1" stopColor="#ffe6b0" />
            </linearGradient>
            <radialGradient id="copa-sun" gradientUnits="userSpaceOnUse" cx={sun.sx} cy={sun.sy} r={900}>
              <stop offset="0" stopColor="#fffbe8" stopOpacity={1} />
              <stop offset="0.06" stopColor="#fff1c4" stopOpacity={0.95} />
              <stop offset="0.25" stopColor="#ffc979" stopOpacity={0.45} />
              <stop offset="1" stopColor="#ff9d5c" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="copa-sea" gradientUnits="userSpaceOnUse" x1="0" y1={seaTop} x2="0" y2={shoreY}>
              <stop offset="0" stopColor="#c99a97" />
              <stop offset="0.25" stopColor="#7d7f9c" />
              <stop offset="1" stopColor="#35577a" />
            </linearGradient>
            <linearGradient id="copa-sand" gradientUnits="userSpaceOnUse" x1="0" y1={shoreY} x2="0" y2={walkY}>
              <stop offset="0" stopColor="#d9b48e" />
              <stop offset="1" stopColor="#f0cfa3" />
            </linearGradient>
            <linearGradient id="copa-hill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8d5f7b" />
              <stop offset="1" stopColor="#b9817f" />
            </linearGradient>
            <linearGradient id="copa-hill2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#6b4a6d" />
              <stop offset="1" stopColor="#a0727a" />
            </linearGradient>
          </defs>
          <rect x={0} y={-100} width={W} height={hy + 120} fill="url(#copa-sky)" />
          {/* soft cloud streaks */}
          {[
            [-0.6, 0.16, 520, 26, 0.35],
            [0.35, 0.22, 680, 30, 0.3],
            [-0.15, 0.3, 420, 18, 0.25],
            [0.7, 0.11, 380, 14, 0.4],
          ].map(([dx, dy, rx, ry, o], i) => {
            const c = projectDir(cam, dx + t * 0.004, dy, 1);
            return <ellipse key={i} cx={c.sx} cy={c.sy} rx={rx} ry={ry} fill="#ffd9b0" opacity={o} />;
          })}
          <rect x={0} y={-100} width={W} height={hy + 120} fill="url(#copa-sun)" />
          <circle cx={sun.sx} cy={sun.sy} r={46} fill="#fffaf0" />
          <path d={hillsBack} fill="url(#copa-hill)" opacity={0.75} />
          <path d={hillsRight} fill="url(#copa-hill)" opacity={0.85} />
          <path d={sugarloaf} fill="url(#copa-hill2)" />
          {/* sea */}
          <rect x={0} y={seaTop} width={W} height={Math.max(0, shoreY - seaTop) + 2} fill="url(#copa-sea)" />
          {/* sun glitter column */}
          {Array.from({length: 26}).map((_, i) => {
            const z = 60 + i * i * 2.2;
            const p = project(cam, cam.x + (sun.sx - W / 2) * (z - cam.z) / cam.f, 0, z);
            if (!p || p.sy < seaTop || p.sy > shoreY) return null;
            const w = (14 + (i % 3) * 10) * Math.max(0.25, Math.min(1.6, p.ppm / 20)) * (0.6 + 0.4 * Math.sin(t * 6 + i * 1.7));
            return <rect key={i} x={p.sx - w + Math.sin(t * 3 + i) * 6} y={p.sy} width={w * 2} height={Math.max(1.5, p.ppm * 0.08)} rx={2} fill="#fff1c9" opacity={0.75} />;
          })}
          {/* wave lines rolling in */}
          {Array.from({length: 7}).map((_, i) => {
            const z = SHORE_Z + 3 + ((i * 9 - t * 2.5) % 60 + 60) % 60;
            const p = project(cam, cam.x, 0, z);
            if (!p) return null;
            return <rect key={i} x={0} y={p.sy} width={W} height={Math.max(1, p.ppm * 0.05)} fill="#e9d3c4" opacity={0.25} />;
          })}
          {/* foam at the shore */}
          <path
            d={groundPath(cam, Array.from({length: 40}).map((_, i) => [cam.x - 120 + i * 6, SHORE_Z - 0.6 + Math.sin(i * 0.9 + t * 1.5) * 0.5] as [number, number]))}
            stroke="#fff6ea"
            strokeWidth={Math.max(2, (shore?.ppm ?? 30) * 0.18)}
            fill="none"
            opacity={0.8}
          />
          {/* sand */}
          <rect x={0} y={shoreY} width={W} height={Math.max(0, walkY - shoreY) + 2} fill="url(#copa-sand)" />
        </svg>
      </AbsoluteFill>

      {/* CALÇADÃO: base tone + wave pavement in blur bins */}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="copa-walk" gradientUnits="userSpaceOnUse" x1="0" y1={walkY} x2="0" y2={H}>
              <stop offset="0" stopColor="#d9c3a8" />
              <stop offset="1" stopColor="#c8b29a" />
            </linearGradient>
          </defs>
          <rect x={0} y={walkY} width={W} height={H - walkY + 10} fill="url(#copa-walk)" />
          {/* curb */}
          {walkEnd && <rect x={0} y={walkY - Math.max(2, walkEnd.ppm * 0.15)} width={W} height={Math.max(2, walkEnd.ppm * 0.15)} fill="#efe2cf" />}
        </svg>
      </AbsoluteFill>
      {bins.map((b, i) => {
        const pz = project(cam, cam.x, 0, (b.z0 + b.z1) / 2);
        const blur = pz ? coc(pz.depth, focus, aperture) : 0;
        return (
          <AbsoluteFill key={i} style={{filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
              <Pavement cam={cam} z0={b.z0 - 0.15} z1={b.z1 + 0.15} />
            </svg>
          </AbsoluteFill>
        );
      })}

      {/* warm light falloff on the ground + long shadows */}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <radialGradient id="copa-groundglow" gradientUnits="userSpaceOnUse" cx={sun.sx} cy={walkY} r={1100}>
              <stop offset="0" stopColor="#ffcf8f" stopOpacity={0.55} />
              <stop offset="1" stopColor="#ffcf8f" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="copa-grounddark" gradientUnits="userSpaceOnUse" x1="0" y1={walkY} x2="0" y2={H}>
              <stop offset="0" stopColor="#3b2440" stopOpacity={0} />
              <stop offset="1" stopColor="#3b2440" stopOpacity={0.35} />
            </linearGradient>
            <filter id="copa-shadowblur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={8} />
            </filter>
          </defs>
          <rect x={0} y={walkY} width={W} height={H - walkY} fill="url(#copa-groundglow)" style={{mixBlendMode: 'soft-light'}} />
          <rect x={0} y={walkY} width={W} height={H - walkY} fill="url(#copa-grounddark)" />
          {shadows.map((a) => {
            const len = 3.2 * (a.shadow ?? 1);
            const d = groundPath(
              cam,
              [
                [a.x - 0.28, a.z],
                [a.x + 0.28, a.z],
                [a.x + 0.35 - 0.6, a.z - len],
                [a.x - 0.35 - 0.6, a.z - len],
              ],
              true,
            );
            return <path key={a.key} d={d} fill="#2a1830" opacity={0.42} filter="url(#copa-shadowblur)" />;
          })}
        </svg>
      </AbsoluteFill>

      {/* billboards + actors, far to near */}
      <AbsoluteFill>{items.map((it) => <React.Fragment key={it.key}>{it.node}</React.Fragment>)}</AbsoluteFill>

      {/* atmospheric haze toward the horizon */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(255,205,150,0) ${((hy - 500) / H) * 100}%, rgba(255,214,160,0.28) ${(hy / H) * 100}%, rgba(255,205,150,0) ${((hy + 260) / H) * 100}%)`,
          mixBlendMode: 'screen',
        }}
      />
      {grade > 0 && <AbsoluteFill style={{backdropFilter: `saturate(${1 - grade * 0.8})`, background: `rgba(120,140,170,${grade * 0.25})`}} />}
    </AbsoluteFill>
  );
};
