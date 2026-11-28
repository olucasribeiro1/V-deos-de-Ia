import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../../lib/constants';
import {useUid} from '../../lib/useUid';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import type {Lighting} from '../../characters/types';

/**
 * EP02 metro station set (flat 2.5D, screen space 1080×1920), shared by parts A and B.
 * - <MetroHall>     concourse: tiled wall, line stripe, station sign, posters, columns, fluorescent ceiling, perspective floor.
 * - <MetroPlatform> platform: back wall, track pit with an optional <TrainCar>, yellow tactile edge, platform floor.
 * - <Turnstile>     catraca (side view) with a rotating tripod arm, for the vault gag.
 * `px` = horizontal camera scroll in px (parallax: far layers move less, near layers more).
 */

export const METRO_LIGHT: Lighting = {side: 1, rim: '#d6fff4', rimStrength: 0.75, shadeStrength: 0.6};
export const METRO_LINE = '#e2462f'; // line colour (stripe, train band)
export const METRO_TILE = '#e9e4d6';

const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/** Brick-bond subway tile pattern fill rect. */
const Tiles: React.FC<{x: number; y: number; w: number; h: number; px: number; tile?: number; color?: string; grout?: string}> = ({
  x,
  y,
  w,
  h,
  px,
  tile = 56,
  color = METRO_TILE,
  grout = '#b9b3a3',
}) => {
  const id = useUid('tile');
  const th = tile / 2;
  return (
    <>
      <defs>
        <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse" patternTransform={`translate(${px % tile},${y})`}>
          <rect width={tile} height={tile} fill={color} />
          <rect width={tile} height={2.5} y={0} fill={grout} />
          <rect width={tile} height={2.5} y={th} fill={grout} />
          <rect width={2.5} height={th} x={0} y={0} fill={grout} />
          <rect width={2.5} height={th} x={th} y={th} fill={grout} />
          <rect width={tile - 6} height={4} x={3} y={4} fill="#fff" opacity={0.45} />
          <rect width={tile - 6} height={4} x={3} y={th + 4} fill="#fff" opacity={0.45} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </>
  );
};

/** Fluorescent ceiling with light tubes receding to a vanishing point. */
const Ceiling: React.FC<{y1: number; vp: [number, number]; px: number; t: number; flicker?: number}> = ({y1, vp, px, t, flicker = 0}) => {
  const rows = 6;
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={y1 + 200} fill="#2a3036" />
      {Array.from({length: 12}).map((_, i) => {
        const x = -800 + i * 240 + (px * 1.2) % 240;
        return <line key={i} x1={x} y1={-100} x2={vp[0] + (x - vp[0]) * 0.25} y2={y1} stroke="#1d2227" strokeWidth={4} />;
      })}
      {Array.from({length: rows}).map((_, r) => {
        const k = r / rows;
        const y = -60 + (y1 + 60) * Math.pow(k, 0.7);
        const sc = 1 - k * 0.7;
        return Array.from({length: 4}).map((__, c) => {
          const cx = vp[0] + (-540 + c * 360 + ((px * 1.2) % 360)) * sc;
          const on = flicker > 0 && random(`fl${r}${c}${Math.floor(t * 12)}`) < flicker ? 0.2 : 1;
          return (
            <g key={`${r}-${c}`} opacity={on}>
              <rect x={cx - 120 * sc} y={y - 10 * sc} width={240 * sc} height={22 * sc} rx={8 * sc} fill="#f4fff9" />
              <rect x={cx - 160 * sc} y={y - 40 * sc} width={320 * sc} height={80 * sc} rx={40 * sc} fill="#dffff3" opacity={0.12} />
            </g>
          );
        });
      })}
      <rect x={-200} y={y1 - 18} width={W + 400} height={18} fill="#1a1e22" />
    </g>
  );
};

/** Perspective floor from `y0` (wall base) to the bottom of the frame. */
const Floor: React.FC<{y0: number; vpx: number; px: number; color?: string; line?: string}> = ({y0, vpx, px, color = '#8d8a84', line = '#77746e'}) => {
  const id = useUid('floor');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6e6b66" />
          <stop offset="0.35" stopColor={color} />
          <stop offset="1" stopColor="#a6a29b" />
        </linearGradient>
      </defs>
      <rect x={-200} y={y0} width={W + 400} height={H - y0 + 200} fill={`url(#${id})`} />
      {Array.from({length: 9}).map((_, r) => {
        const y = y0 + Math.pow((r + 1) / 9, 1.8) * (H - y0 + 60);
        return <line key={r} x1={-200} y1={y} x2={W + 200} y2={y} stroke={line} strokeWidth={3} />;
      })}
      {Array.from({length: 30}).map((_, i) => {
        const xb = -1800 + i * 140 + (((px * 1.8) % 140) + 140) % 140;
        const xt = vpx + (xb - vpx) * 0.18 + px * 0.0;
        return <line key={i} x1={xt} y1={y0} x2={xb} y2={H + 60} stroke={line} strokeWidth={3} />;
      })}
      {/* reflected light streak */}
      <rect x={-200} y={y0} width={W + 400} height={60} fill="#fff" opacity={0.07} />
    </g>
  );
};

/** Station name sign (dark blue panel, white text, line dot). */
export const StationSign: React.FC<{x: number; y: number; name?: string; s?: number}> = ({x, y, name = 'ESTAÇÃO CENTRAL', s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-300} y={-62} width={600} height={124} rx={14} fill="#16305c" stroke="#0b1a35" strokeWidth={6} />
    <circle cx={-236} cy={0} r={36} fill={METRO_LINE} stroke="#fff" strokeWidth={6} />
    <text x={-236} y={14} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={40} fill="#fff">
      3
    </text>
    <text x={30} y={18} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={54} letterSpacing={3} fill="#fff">
      {name}
    </text>
  </g>
);

/** Generic ad poster in a steel frame. */
const Poster: React.FC<{x: number; y: number; w: number; h: number; i: number}> = ({x, y, w, h, i}) => {
  const pal = [
    ['#ffcf3a', '#f05a28', '#2b2b2b'],
    ['#45c4b0', '#1b5f7a', '#ffffff'],
    ['#ff7aa8', '#7b3fa0', '#ffffff'],
    ['#9fd356', '#2f6b2f', '#ffffff'],
  ][i % 4];
  return (
    <g>
      <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} rx={8} fill="#5d6268" />
      <rect x={x} y={y} width={w} height={h} fill={pal[0]} />
      <circle cx={x + w * 0.5} cy={y + h * 0.4} r={w * 0.28} fill={pal[1]} />
      <rect x={x + w * 0.12} y={y + h * 0.74} width={w * 0.76} height={h * 0.07} rx={6} fill={pal[2]} opacity={0.85} />
      <rect x={x + w * 0.22} y={y + h * 0.85} width={w * 0.56} height={h * 0.05} rx={6} fill={pal[2]} opacity={0.6} />
      <rect x={x} y={y} width={w * 0.2} height={h} fill="#fff" opacity={0.12} />
    </g>
  );
};

/** Tiled wall with line stripe, sign and posters. Spans [y0, y1]. */
const Wall: React.FC<{y0: number; y1: number; px: number; sign?: string; posters?: boolean}> = ({y0, y1, px, sign, posters = true}) => {
  const span = 1500;
  const off = ((px % span) + span) % span;
  return (
    <g>
      <Tiles x={-200} y={y0} w={W + 400} h={y1 - y0} px={px} />
      {/* line colour stripe */}
      <rect x={-200} y={y0 + (y1 - y0) * 0.5} width={W + 400} height={46} fill={METRO_LINE} />
      <rect x={-200} y={y0 + (y1 - y0) * 0.5 + 46} width={W + 400} height={10} fill="#8f2a1c" />
      {/* skirting */}
      <rect x={-200} y={y1 - 40} width={W + 400} height={40} fill="#4d5156" />
      {[-1, 0, 1, 2].map((k) => {
        const bx = k * span - span + off;
        return (
          <g key={k}>
            {sign && <StationSign x={bx + 750} y={y0 + (y1 - y0) * 0.27} name={sign} s={0.8} />}
            {posters && <Poster x={bx + 180} y={y0 + (y1 - y0) * 0.12} w={220} h={300} i={k + 4} />}
            {posters && <Poster x={bx + 1150} y={y0 + (y1 - y0) * 0.62} w={200} h={150} i={k + 5} />}
          </g>
        );
      })}
      {/* soft light falloff */}
      <rect x={-200} y={y0} width={W + 400} height={(y1 - y0) * 0.25} fill="#000" opacity={0.12} />
    </g>
  );
};

/** Square tiled columns (near layer). */
const Columns: React.FC<{y0: number; y1: number; px: number; gap?: number; k?: number}> = ({y0, y1, px, gap = 900, k = 1.35}) => {
  const off = (((px * k) % gap) + gap) % gap;
  return (
    <g>
      {[-1, 0, 1, 2].map((i) => {
        const x = i * gap - gap * 0.5 + off;
        return (
          <g key={i}>
            <rect x={x} y={y0} width={130} height={y1 - y0} fill="#cfc9b8" />
            <rect x={x} y={y0} width={30} height={y1 - y0} fill="#f2eee2" />
            <rect x={x + 100} y={y0} width={30} height={y1 - y0} fill="#a8a291" />
            <rect x={x} y={y0 + (y1 - y0) * 0.5} width={130} height={46} fill={METRO_LINE} />
            <rect x={x - 6} y={y1 - 46} width={142} height={46} fill="#4d5156" />
          </g>
        );
      })}
    </g>
  );
};

/** Station concourse (catracas area). */
export const MetroHall: React.FC<{t: number; px?: number; floorY?: number; ceilY?: number; sign?: string; flicker?: number; columns?: boolean; children?: React.ReactNode}> = ({
  t,
  px = 0,
  floorY = 1300,
  ceilY = 300,
  sign = 'ESTAÇÃO CENTRAL',
  flicker = 0,
  columns = true,
  children,
}) => (
  <AbsoluteFill style={{background: '#22272c', overflow: 'hidden'}}>
    <Svg>
      <Ceiling y1={ceilY} vp={[540, (ceilY + floorY) / 2]} px={px} t={t} flicker={flicker} />
      <Wall y0={ceilY} y1={floorY} px={px} sign={sign} />
      <Floor y0={floorY} vpx={540} px={px} />
      {columns && <Columns y0={ceilY - 20} y1={floorY + 30} px={px} />}
    </Svg>
    {children}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 45%, rgba(220,255,240,0.10), rgba(0,0,0,0) 70%)', pointerEvents: 'none'}} />
  </AbsoluteFill>
);

/** Side view of a metro car. (x, y) = bottom-left on the rails. `doors` 0 closed .. 1 open. */
export const TrainCar: React.FC<{x: number; y: number; w?: number; h?: number; doors?: number; lit?: boolean; seed?: string}> = ({x, y, w = 1500, h = 640, doors = 0, lit = true, seed = 'tc'}) => {
  const id = useUid('car');
  const top = y - h;
  const doorW = 150;
  const doorXs = [0.22, 0.62].map((k) => x + w * k);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c9d0d8" />
          <stop offset="0.15" stopColor="#eef2f6" />
          <stop offset="0.75" stopColor="#b8c0c9" />
          <stop offset="1" stopColor="#7d8690" />
        </linearGradient>
      </defs>
      <rect x={x} y={top} width={w} height={h} rx={40} fill={`url(#${id})`} />
      <rect x={x} y={top + h * 0.72} width={w} height={34} fill={METRO_LINE} />
      <rect x={x} y={top + h * 0.72 + 34} width={w} height={10} fill="#8f2a1c" />
      {/* windows */}
      {Array.from({length: 6}).map((_, i) => {
        const wx = x + 60 + i * (w / 6);
        if (doorXs.some((d) => Math.abs(wx + 80 - d - doorW / 2) < 140)) return null;
        return (
          <g key={i}>
            <rect x={wx} y={top + 110} width={170} height={200} rx={18} fill={lit ? '#fff3c4' : '#3b4650'} />
            {lit &&
              Array.from({length: 2}).map((__, k) =>
                random(`${seed}${i}${k}`) > 0.4 ? <circle key={k} cx={wx + 50 + k * 70} cy={top + 250} r={34} fill="#5b4b3a" opacity={0.55} /> : null,
              )}
            <rect x={wx} y={top + 110} width={170} height={36} fill="#fff" opacity={0.35} />
          </g>
        );
      })}
      {/* doors */}
      {doorXs.map((dx, i) => {
        const o = doors * (doorW / 2 - 8);
        return (
          <g key={i}>
            <rect x={dx - 6} y={top + 70} width={doorW + 12} height={h - 90} fill="#1e252c" />
            <rect x={dx + 4} y={top + 80} width={doorW - 8} height={h - 110} fill={lit ? '#ffe9a8' : '#2c343c'} opacity={doors > 0.05 ? 1 : 0} />
            {[0, 1].map((s) => (
              <g key={s} transform={`translate(${s ? o : -o},0)`}>
                <rect x={dx + (s ? doorW / 2 : 0)} y={top + 74} width={doorW / 2} height={h - 100} fill="#dfe5eb" stroke="#8b949e" strokeWidth={4} />
                <rect x={dx + (s ? doorW / 2 : 0) + 16} y={top + 110} width={doorW / 2 - 32} height={180} rx={10} fill={lit ? '#fff3c4' : '#3b4650'} />
              </g>
            ))}
          </g>
        );
      })}
      <rect x={x + 20} y={y - 20} width={w - 40} height={20} fill="#2a2f35" />
      {[0.12, 0.3, 0.7, 0.88].map((k) => (
        <circle key={k} cx={x + w * k} cy={y} r={28} fill="#1a1d21" stroke="#4a5058" strokeWidth={6} />
      ))}
    </g>
  );
};

/** Platform: back wall, track pit (optional train), yellow tactile edge, floor. */
export const MetroPlatform: React.FC<{
  t: number;
  px?: number;
  edgeY?: number;
  ceilY?: number;
  train?: {x: number; doors?: number; lit?: boolean} | null;
  sign?: string;
  flicker?: number;
  children?: React.ReactNode;
}> = ({t, px = 0, edgeY = 1260, ceilY = 260, train = null, sign = 'ESTAÇÃO CENTRAL', flicker = 0, children}) => {
  const pitTop = edgeY - 120;
  return (
    <AbsoluteFill style={{background: '#1b1f24', overflow: 'hidden'}}>
      <Svg>
        <Ceiling y1={ceilY} vp={[540, (ceilY + edgeY) / 2]} px={px * 0.8} t={t} flicker={flicker} />
        <Wall y0={ceilY} y1={pitTop} px={px * 0.8} sign={sign} />
        {/* pit */}
        <rect x={-200} y={pitTop} width={W + 400} height={130} fill="#15171a" />
        <rect x={-200} y={pitTop + 70} width={W + 400} height={10} fill="#6b6f74" />
        {train && <TrainCar x={train.x + px * 0.9} y={pitTop + 90} doors={train.doors ?? 0} lit={train.lit ?? true} />}
        {/* platform edge */}
        <rect x={-200} y={edgeY - 14} width={W + 400} height={24} fill="#d7d3c8" />
        <rect x={-200} y={edgeY + 10} width={W + 400} height={56} fill="#f4c21b" />
        {Array.from({length: 40}).map((_, i) => (
          <circle key={i} cx={-200 + i * 40 + (((px * 1.2) % 40) + 40) % 40} cy={edgeY + 38} r={7} fill="#d29f0a" />
        ))}
        <Floor y0={edgeY + 66} vpx={540} px={px} />
      </Svg>
      {children}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 45%, rgba(220,255,240,0.10), rgba(0,0,0,0) 70%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

/**
 * Catraca, side view. (x, y) = centre of the base on the floor; `s` scale (1 ≈ 380 px tall).
 * `arm` rotates the tripod (deg). `led` 'green' | 'red'.
 */
export const Turnstile: React.FC<{x: number; y: number; s?: number; arm?: number; led?: 'green' | 'red'; flip?: boolean}> = ({x, y, s = 1, arm = 0, led = 'red', flip}) => {
  const id = useUid('ts');
  const ledC = led === 'green' ? '#3dff8a' : '#ff3b3b';
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#e9edf1" />
          <stop offset="0.4" stopColor="#aab3bc" />
          <stop offset="1" stopColor="#6c757e" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={4} rx={190} ry={18} fill="#000" opacity={0.25} />
      {/* cabinet */}
      <path d="M -170,0 L -170,-300 Q -170,-330 -140,-336 L 150,-336 Q 176,-330 176,-300 L 176,0 Z" fill={`url(#${id})`} />
      <rect x={-170} y={-344} width={346} height={26} rx={10} fill="#5c656e" />
      <rect x={-150} y={-300} width={300} height={14} fill="#fff" opacity={0.35} />
      {/* card reader + led */}
      <rect x={40} y={-334} width={110} height={30} rx={6} fill="#1f2a33" />
      <circle cx={120} cy={-319} r={9} fill={ledC} />
      <circle cx={120} cy={-319} r={20} fill={ledC} opacity={0.3} />
      {/* tripod hub */}
      <g transform={`translate(-10,-200)`}>
        <circle r={36} fill="#7b848d" stroke="#4d555d" strokeWidth={6} />
        {[0, 120, 240].map((a) => (
          <g key={a} transform={`rotate(${a + arm})`}>
            <rect x={0} y={-11} width={210} height={22} rx={11} fill="#d9dee3" stroke="#7e8790" strokeWidth={4} />
            <rect x={6} y={-8} width={196} height={6} rx={3} fill="#fff" opacity={0.6} />
          </g>
        ))}
        <circle r={16} fill="#c9d0d6" />
      </g>
      {/* arrow sign on the side */}
      <rect x={-130} y={-120} width={110} height={70} rx={8} fill="#1f2a33" />
      <path d="M -112,-85 L -60,-85 M -76,-102 L -54,-85 L -76,-68" stroke={ledC} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** "SAÍDA" hanging sign / yellow arrow wayfinding. */
export const ExitSign: React.FC<{x: number; y: number; s?: number; text?: string}> = ({x, y, s = 1, text = 'SAÍDA'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <line x1={-120} y1={-120} x2={-120} y2={-40} stroke="#3a4046" strokeWidth={8} />
    <line x1={120} y1={-120} x2={120} y2={-40} stroke="#3a4046" strokeWidth={8} />
    <rect x={-190} y={-44} width={380} height={96} rx={10} fill="#f4c21b" stroke="#2a2a2a" strokeWidth={6} />
    <text x={-20} y={22} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={54} letterSpacing={4} fill="#1d1d1d">
      {text}
    </text>
    <path d="M 110,4 L 160,4 M 140,-14 L 162,4 L 140,22" stroke="#1d1d1d" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
