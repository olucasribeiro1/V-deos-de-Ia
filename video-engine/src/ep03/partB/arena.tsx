import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {ArenaInterior} from '../sets/Academy';
import {clamp, lerp} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {ACADEMY, EmblemMark} from '../characters';
import {Svg} from './kit';

const SKIN = ['#f0c8a8', '#d6a07a', '#b47a52', '#8a5536', '#5e3a26'];
const SHIRT = [ACADEMY.navy, ACADEMY.navyLight, '#b8323a', '#e8b84a', '#d9cdb6', ACADEMY.navy, '#3d8a6b', '#4a5060'];

/**
 * Arena interior (part B): tiered stands packed with the academy crowd, gold banners, spotlights and the big screen.
 * Everything above `horizon` (px). `px` = horizontal parallax, `cheer` 0..1 crowd bounce, `shock` 0..1 (arms up / jaws),
 * `empty` 0..1 (crowd gone, for the "3 hours later" gag), `dusk` 0..1 darker light, `screen` text on the big screen.
 */
export const ArenaBack: React.FC<{
  t: number;
  horizon: number;
  px?: number;
  cheer?: number;
  shock?: number;
  empty?: number;
  dusk?: number;
  screen?: string;
  screenSub?: string;
  screenY?: number;
  rows?: number;
  scale?: number;
}> = ({t, horizon, px = 0, cheer = 0.3, shock = 0, empty = 0, dusk = 0, screen, screenSub, screenY, rows = 7, scale = 1}) => {
  const people: React.ReactNode[] = [];
  for (let r = rows - 1; r >= 0; r--) {
    const s = scale * (1 - r * 0.09);
    const rowY = horizon - 70 * scale - r * 105 * scale * (1 - r * 0.03);
    const step = 62 * s;
    const n = Math.ceil(1400 / step);
    for (let i = 0; i < n; i++) {
      const q = (k: string) => random(`ar${r}-${i}${k}`);
      if (q('gone') < empty) continue;
      const x = -160 + i * step + (r % 2) * step * 0.5 + (q('x') - 0.5) * 14 + px * (0.4 + r * 0.02);
      const bounce = Math.max(0, Math.sin(t * (9 + q('f') * 4) + q('p') * 6)) * 14 * s * cheer;
      const y = rowY - bounce;
      const sk = SKIN[Math.floor(q('s') * SKIN.length)];
      const sh = SHIRT[Math.floor(q('c') * SHIRT.length)];
      const armsUp = q('a') < 0.55 ? cheer * 0.8 + shock : 0;
      people.push(
        <g key={`${r}-${i}`} transform={`translate(${x},${y}) scale(${s})`}>
          {armsUp > 0.05 && (
            <>
              <path d={`M-16,-30 L${-30 - 6 * armsUp},${-30 - 50 * armsUp}`} stroke={sh} strokeWidth={11} strokeLinecap="round" />
              <path d={`M16,-30 L${30 + 6 * armsUp},${-30 - 50 * armsUp}`} stroke={sh} strokeWidth={11} strokeLinecap="round" />
            </>
          )}
          <path d="M-26,10 Q-26,-38 0,-40 Q26,-38 26,10 Z" fill={sh} />
          <circle cx={0} cy={-56} r={17} fill={sk} />
          <path d="M-17,-60 Q0,-80 17,-60 Q10,-70 0,-71 Q-10,-70 -17,-60 Z" fill={q('h') < 0.5 ? '#24170f' : '#4a2e1a'} />
          {shock > 0.2 && <ellipse cx={0} cy={-49} rx={4} ry={3 + 5 * shock} fill="#3a1010" />}
        </g>,
      );
    }
  }
  const topY = horizon - 70 * scale - rows * 105 * scale;
  const sy = screenY ?? topY - 330;
  return (
    <Svg>
      <defs>
        <linearGradient id="arWall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#060a1c" />
          <stop offset="1" stopColor="#1a2550" />
        </linearGradient>
        <radialGradient id="arSpot" cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#fff6d8" stopOpacity={0.35} />
          <stop offset="1" stopColor="#fff6d8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-300} y={-300} width={1680} height={horizon + 320} fill="url(#arWall)" />
      {/* tier bands */}
      {Array.from({length: rows + 1}).map((_, r) => {
        const y = horizon - r * 105 * scale * (1 - r * 0.03) - 20 * scale;
        return <rect key={r} x={-300} y={y - 12 * scale} width={1680} height={16 * scale} fill={r === 0 ? ACADEMY.gold : '#0d1430'} opacity={r === 0 ? 0.9 : 0.8} />;
      })}
      {people}
      {/* barrier wall with gold trim and banners */}
      <rect x={-300} y={horizon - 46 * scale} width={1680} height={46 * scale + 4} fill={ACADEMY.navyDark} />
      <rect x={-300} y={horizon - 50 * scale} width={1680} height={8 * scale} fill={ACADEMY.gold} />
      {[-1, 0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${140 + i * 420 + px * 0.6},${horizon - 24 * scale}) scale(${scale})`}>
          <EmblemMark s={34} />
        </g>
      ))}
      {/* big screen */}
      {screen !== undefined && (
        <g transform={`translate(${380 + px * 0.25},${sy})`}>
          <rect x={-250} y={-20} width={500} height={290} rx={14} fill="#05070f" stroke="#3a4f8a" strokeWidth={8} />
          <rect x={-232} y={-2} width={464} height={254} rx={6} fill="#0f1d4a" />
          <text x={0} y={150} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={110} fill={ACADEMY.gold}>
            {screen}
          </text>
          {screenSub && (
            <text x={0} y={215} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={40} letterSpacing={4} fill="#fff">
              {screenSub}
            </text>
          )}
        </g>
      )}
      {/* spotlights */}
      {[-1, 1].map((s) => {
        const sw = Math.sin(t * 0.9 + s) * 120;
        return <path key={s} d={`M${540 + s * 600},-100 L${540 + sw - 160},${horizon + 400} L${540 + sw + 160},${horizon + 400} Z`} fill="url(#arSpot)" opacity={lerp(0.9, 0.4, dusk)} />;
      })}
      {dusk > 0 && <rect x={-300} y={-300} width={1680} height={2600} fill="#1a0a30" opacity={dusk * 0.45} />}
    </Svg>
  );
};

/**
 * Arena sand floor from `horizon` down. Perspective ring lines; `ripple` = frames since Davi's palm hit (concentric ripples
 * from rx,ry), `liquid` 0..1 = glossy wet look (liquefaction), `t` seconds.
 */
export const Sand: React.FC<{horizon: number; t: number; ripple?: number; rx?: number; ry?: number; liquid?: number; px?: number; tilt?: number}> = ({
  horizon,
  t,
  ripple = -1,
  rx = 540,
  ry = 1500,
  liquid = 0,
  px = 0,
}) => {
  const H2 = 2400 - horizon;
  return (
    <Svg>
      <defs>
        <linearGradient id="sandG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c9a670" />
          <stop offset="1" stopColor="#e2c48e" />
        </linearGradient>
        <linearGradient id="sandWet" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7a6440" />
          <stop offset="1" stopColor="#a68a5a" />
        </linearGradient>
      </defs>
      <rect x={-300} y={horizon} width={1680} height={H2} fill="url(#sandG)" />
      {liquid > 0 && <rect x={-300} y={horizon} width={1680} height={H2} fill="url(#sandWet)" opacity={liquid * 0.85} />}
      {/* arena ring lines (ellipses in perspective) */}
      {[0.12, 0.3, 0.55, 0.9].map((u, i) => (
        <ellipse key={i} cx={540 + px} cy={horizon + H2 * u * 0.6} rx={900 + u * 1400} ry={60 + u * 420} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={4 + u * 6} />
      ))}
      {/* grain speckles */}
      {Array.from({length: 90}).map((_, i) => {
        const q = (k: string) => random(`sd${i}${k}`);
        const v = q('y');
        const y = horizon + v * v * H2;
        return <circle key={i} cx={-100 + q('x') * 1280 + px * (0.3 + v)} cy={y} r={1.5 + v * 5} fill="#8a6a3a" opacity={0.35} />;
      })}
      {/* liquefied gloss streaks */}
      {liquid > 0 &&
        Array.from({length: 7}).map((_, i) => {
          const y = horizon + 40 + i * 90 + Math.sin(t * 3 + i) * 10;
          return <ellipse key={'g' + i} cx={540 + Math.sin(t * 1.5 + i * 2) * 200 + px} cy={y} rx={240 + i * 60} ry={8 + i * 3} fill="#fff" opacity={0.12 * liquid} />;
        })}
      {ripple >= 0 &&
        Array.from({length: 6}).map((_, i) => {
          const a = ripple - i * 5;
          if (a < 0) return null;
          const R = a * 34;
          const o = clamp(1 - R / 1500);
          return (
            <g key={'r' + i} opacity={o}>
              <ellipse cx={rx} cy={ry} rx={R} ry={R * 0.32} fill="none" stroke="#6a4c22" strokeWidth={16} opacity={0.4} />
              <ellipse cx={rx} cy={ry - 6} rx={R} ry={R * 0.32} fill="none" stroke="#fff3d6" strokeWidth={6} />
            </g>
          );
        })}
    </Svg>
  );
};

/** Sand splash particles thrown up from (x,y). age frames. */
export const SandSplash: React.FC<{x: number; y: number; age: number; n?: number; seed?: string; spread?: number; power?: number}> = ({x, y, age, n = 22, seed = 'ss', spread = 1, power = 1}) => {
  if (age < 0 || age > 30) return null;
  return (
    <Svg>
      {Array.from({length: n}).map((_, i) => {
        const q = (k: string) => random(`${seed}${i}${k}`);
        const a = -Math.PI / 2 + (q('a') - 0.5) * 2.2 * spread;
        const v = (10 + q('v') * 22) * power;
        const xx = x + Math.cos(a) * v * age;
        const yy = y + Math.sin(a) * v * age + 1.2 * age * age;
        return <circle key={i} cx={xx} cy={yy} r={6 + q('r') * 12} fill={q('c') < 0.5 ? '#d8b97f' : '#a98a52'} opacity={clamp(1 - age / 30)} />;
      })}
    </Svg>
  );
};

/* ================================================================== shared arena (Agent A's set) + sand fx */

/** Sand effects as an SVG group (world coords): wet/liquid gloss, ripples from (rx, ry). */
export const SandFx: React.FC<{sandY: number; t: number; ripple?: number; rx?: number; ry?: number; liquid?: number}> = ({sandY, t, ripple = -1, rx = 540, ry = 1500, liquid = 0}) => (
  <g>
    {liquid > 0 && <rect x={-300} y={sandY} width={1680} height={2400} fill="#8a6c3e" opacity={liquid * 0.55} />}
    {liquid > 0 &&
      Array.from({length: 8}).map((_, i) => {
        const y = sandY + 60 + i * 110 + Math.sin(t * 3 + i) * 12;
        return <ellipse key={'g' + i} cx={540 + Math.sin(t * 1.5 + i * 2) * 220} cy={y} rx={240 + i * 70} ry={10 + i * 4} fill="#fff" opacity={0.16 * liquid} />;
      })}
    {liquid > 0 &&
      Array.from({length: 5}).map((_, i) => {
        const y = sandY + 140 + i * 170;
        const d = Array.from({length: 25})
          .map((__, k) => `${k ? 'L' : 'M'}${-100 + k * 55},${(y + Math.sin(k * 0.8 + t * 6 + i) * 14 * liquid).toFixed(1)}`)
          .join(' ');
        return <path key={'w' + i} d={d} stroke="#5e4522" strokeWidth={6} fill="none" opacity={0.35 * liquid} />;
      })}
    {ripple >= 0 &&
      Array.from({length: 6}).map((_, i) => {
        const a = ripple - i * 5;
        if (a < 0) return null;
        const R = a * 34;
        const o = clamp(1 - R / 1500);
        return (
          <g key={'r' + i} opacity={o}>
            <ellipse cx={rx} cy={ry} rx={R} ry={R * 0.32} fill="none" stroke="#6a4c22" strokeWidth={16} opacity={0.4} />
            <ellipse cx={rx} cy={ry - 6} rx={R} ry={R * 0.32} fill="none" stroke="#fff3d6" strokeWidth={6} />
          </g>
        );
      })}
  </g>
);

/**
 * The arena (Agent A's ArenaInterior) with part-B extras: zoom/blur (close shots), liquid sand + ripples,
 * `empty` (stands emptied, 3-hours-later gag) and `dusk` tint.
 */
export const Arena: React.FC<{
  t: number;
  sandY?: number;
  px?: number;
  viewY?: number;
  excite?: number;
  zoom?: number;
  zx?: number;
  zy?: number;
  blur?: number;
  liquid?: number;
  ripple?: number;
  rx?: number;
  ry?: number;
  empty?: number;
  dusk?: number;
  screen?: React.ReactNode;
}> = ({t, sandY = 1240, px = 0, viewY = 0, excite = 0.3, zoom = 1, zx = 540, zy = 960, blur = 0, liquid = 0, ripple = -1, rx, ry, empty = 0, dusk = 0, screen}) => (
  <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${zx}px ${zy}px`, filter: blur ? `blur(${blur}px)` : undefined}}>
    <ArenaInterior t={t} sandY={sandY} px={px} viewY={viewY} excite={excite} screen={screen} tunnelGlow={0.3}>
      <SandFx sandY={sandY} t={t} liquid={liquid} ripple={ripple} rx={rx} ry={ry} />
      {empty > 0 && (
        <g opacity={empty}>
          {Array.from({length: 7}).map((_, ri) => {
            const k = ri / 6;
            const y = 240 + 820 * k;
            const s = 0.55 + 0.6 * k;
            return (
              <g key={ri}>
                <rect x={-100} y={y - 90 * s} width={490} height={130 * s} fill={ri % 2 ? '#3b3f4f' : '#454a5c'} />
                <rect x={690} y={y - 90 * s} width={500} height={130 * s} fill={ri % 2 ? '#3b3f4f' : '#454a5c'} />
                <rect x={-100} y={y + 30 * s} width={490} height={8} fill="#2a2d38" />
                <rect x={690} y={y + 30 * s} width={500} height={8} fill="#2a2d38" />
              </g>
            );
          })}
        </g>
      )}
    </ArenaInterior>
    {dusk > 0 && <AbsoluteFill style={{background: '#2a1040', opacity: dusk * 0.4, mixBlendMode: 'multiply'}} />}
    {dusk > 0 && <AbsoluteFill style={{background: 'linear-gradient(#ff8a3a00, #ff8a3a55)', opacity: dusk}} />}
  </AbsoluteFill>
);
