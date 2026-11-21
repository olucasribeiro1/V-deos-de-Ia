import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {H, W} from '../../lib/constants';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {ACADEMY, EmblemMark} from '../characters';

/**
 * EP03 shared sets — the Academy of Powers.
 *  - <AcademyCourtyard/>: daytime stone courtyard, big neoclassical-futuristic building with a clock/emblem tower,
 *    hanging emblem banners, the round ARENA wall with its arched gate on the right. Parallax via px/py.
 *  - <ArenaInterior/>: stands packed with crowd, entrance tunnel, sand floor, and a giant screen above (tilt with viewY).
 *  - <BigScreen/>, <Banner/>, <Crack/> building blocks.
 * All drawn in screen px (1080×1920 frame).
 */

const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/* ------------------------------------------------------------------ banner / crack */

/** Hanging banner (top-centre anchor at x,y), waving with t. */
export const Banner: React.FC<{x: number; y: number; w?: number; h?: number; t: number; color?: string; seed?: number}> = ({x, y, w = 120, h = 300, t, color = ACADEMY.navy, seed = 0}) => {
  const sw = Math.sin(t * 2.2 + seed) * 10;
  const half = w / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-half - 12} y={-10} width={w + 24} height={14} rx={7} fill="#6a5a3a" />
      <path d={`M ${-half},0 L ${half},0 L ${half + sw * 0.4},${h} L ${sw * 0.6},${h - 46} L ${-half + sw * 0.4},${h} Z`} fill={color} />
      <path d={`M ${-half + 10},0 L ${-half + 10 + sw * 0.35},${h - 16}`} stroke={ACADEMY.gold} strokeWidth={6} opacity={0.9} />
      <path d={`M ${half - 10},0 L ${half - 10 + sw * 0.35},${h - 16}`} stroke={ACADEMY.gold} strokeWidth={6} opacity={0.9} />
      <g transform={`translate(${sw * 0.25},${h * 0.38})`}>
        <EmblemMark s={w * 0.75} />
      </g>
    </g>
  );
};

/** Radial crack in a wall from (x,y). `k` 0..1 growth. */
export const Crack: React.FC<{x: number; y: number; r: number; k: number; seed?: string; color?: string}> = ({x, y, r, k, seed = 'ck', color = '#2a2218'}) => {
  if (k <= 0) return null;
  return (
    <g stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={x} cy={y} r={r * 0.16 * Math.min(1, k * 2)} fill="rgba(40,30,20,0.35)" stroke="none" />
      {Array.from({length: 9}).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5;
        const len = r * (0.55 + random(`${seed}l${i}`) * 0.45) * Math.min(1, k);
        const pts = Array.from({length: 5}).map((__, s) => {
          const rr = (len * s) / 4;
          const j = (random(`${seed}j${i}${s}`) - 0.5) * 0.5;
          return `${s ? 'L' : 'M'}${(x + Math.cos(a + j) * rr).toFixed(1)},${(y + Math.sin(a + j) * rr).toFixed(1)}`;
        });
        return <path key={i} d={pts.join(' ')} strokeWidth={9 - (i % 3) * 2} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ courtyard */

const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="#ffffff" opacity={0.9}>
    <ellipse cx={0} cy={0} rx={120} ry={46} />
    <ellipse cx={-70} cy={10} rx={70} ry={36} />
    <ellipse cx={60} cy={-24} rx={80} ry={50} />
  </g>
);

/** The main academy building (front facade), base centred at (cx, baseY), scale s. */
export const AcademyBuilding: React.FC<{cx: number; baseY: number; s?: number; t: number}> = ({cx, baseY, s = 1, t}) => {
  const cols = [-460, -330, -200, -70, 70, 200, 330, 460];
  return (
    <g transform={`translate(${cx},${baseY}) scale(${s})`}>
      {/* side wings */}
      <rect x={-900} y={-520} width={360} height={520} fill="#cbbd9f" />
      <rect x={540} y={-520} width={360} height={520} fill="#c4b596" />
      {[-860, -770, -680, -590, 580, 670, 760, 850].map((wx, i) =>
        [-460, -330, -200].map((wy, j) => <rect key={`${i}${j}`} x={wx} y={wy} width={52} height={86} rx={26} fill="#5b7fa8" stroke="#efe6d2" strokeWidth={8} />),
      )}
      <rect x={-920} y={-540} width={400} height={30} fill="#e9dfc8" />
      <rect x={520} y={-540} width={400} height={30} fill="#e9dfc8" />
      {/* tower */}
      <rect x={-130} y={-1120} width={260} height={420} fill="#ddd1b8" />
      <path d="M -160,-1120 L 0,-1300 L 160,-1120 Z" fill={ACADEMY.navy} />
      <rect x={-6} y={-1380} width={12} height={90} fill="#6a5a3a" />
      <path d={`M 6,-1376 L ${70 + Math.sin(t * 3) * 8},${-1356 + Math.sin(t * 4) * 4} L 6,-1334 Z`} fill={ACADEMY.crimson} />
      <circle cx={0} cy={-960} r={92} fill="#f6efdd" stroke={ACADEMY.gold} strokeWidth={14} />
      <g transform="translate(0,-960)">
        <EmblemMark s={130} />
      </g>
      {/* main block */}
      <rect x={-560} y={-720} width={1120} height={720} fill="#e3d7bd" />
      <rect x={-560} y={-720} width={1120} height={720} fill="url(#acadShade)" />
      {/* pediment */}
      <path d="M -600,-720 L 0,-900 L 600,-720 Z" fill="#efe6d2" stroke="#c2b391" strokeWidth={10} />
      <path d="M -480,-736 L 0,-870 L 480,-736 Z" fill="#d8cbb0" />
      <text x={0} y={-752} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={56} letterSpacing={10} fill={ACADEMY.navy}>
        ACADEMIA DE PODERES
      </text>
      {/* columns */}
      {cols.map((x) => (
        <g key={x}>
          <rect x={x - 34} y={-690} width={68} height={640} fill="#f4ecda" />
          <rect x={x - 34} y={-690} width={20} height={640} fill="#ffffff" opacity={0.6} />
          <rect x={x + 14} y={-690} width={20} height={640} fill="#c9bb9c" opacity={0.6} />
          <rect x={x - 46} y={-704} width={92} height={26} fill="#efe6d2" />
          <rect x={x - 46} y={-60} width={92} height={30} fill="#efe6d2" />
        </g>
      ))}
      {/* door */}
      <path d="M -110,-30 L -110,-380 Q 0,-470 110,-380 L 110,-30 Z" fill="#4a3424" />
      <path d="M -90,-30 L -90,-370 Q 0,-445 90,-370 L 90,-30 Z" fill="#6b4a30" />
      <line x1={0} y1={-430} x2={0} y2={-30} stroke="#3a2818" strokeWidth={8} />
      {/* banners between columns */}
      {[-395, -265, 265, 395].map((bx, i) => (
        <Banner key={bx} x={bx} y={-650} w={90} h={300} t={t} seed={i} color={i % 2 ? ACADEMY.crimson : ACADEMY.navy} />
      ))}
      {/* steps */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-620 - i * 40} y={-30 + i * 14} width={1240 + i * 80} height={18} fill={i % 2 ? '#cfc2a6' : '#e2d6bc'} />
      ))}
    </g>
  );
};

/** Round arena wall with a big arched gate, gate centre at (cx, baseY). */
export const ArenaGate: React.FC<{cx: number; baseY: number; s?: number; t: number; glow?: number}> = ({cx, baseY, s = 1, t, glow = 0.5}) => (
  <g transform={`translate(${cx},${baseY}) scale(${s})`}>
    <path d="M -520,0 L -520,-560 Q 0,-680 520,-560 L 520,0 Z" fill="#9c8d74" />
    <path d="M -520,-560 Q 0,-680 520,-560 L 520,-500 Q 0,-620 -520,-500 Z" fill={ACADEMY.navy} />
    {Array.from({length: 9}).map((_, i) => {
      const x = -440 + i * 110;
      return <path key={i} d={`M ${x - 34},-110 L ${x - 34},-380 Q ${x},-430 ${x + 34},-380 L ${x + 34},-110 Z`} fill="#6e624e" opacity={Math.abs(x) < 150 ? 0 : 1} />;
    })}
    {/* gate */}
    <path d="M -170,0 L -170,-330 Q 0,-470 170,-330 L 170,0 Z" fill="#1d1a22" />
    <path d="M -170,0 L -170,-330 Q 0,-470 170,-330 L 170,0 Z" fill={`rgba(255,200,110,${0.25 + 0.2 * glow + 0.05 * Math.sin(t * 6)})`} />
    <path d="M -200,0 L -200,-330 Q 0,-500 200,-330 L 200,0" stroke={ACADEMY.gold} strokeWidth={18} fill="none" />
    <rect x={-190} y={-540} width={380} height={86} rx={14} fill={ACADEMY.crimson} stroke={ACADEMY.gold} strokeWidth={8} />
    <text x={0} y={-478} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={700} fontSize={64} letterSpacing={14} fill="#fff">
      ARENA
    </text>
    {[-330, 330].map((x, i) => (
      <Banner key={x} x={x} y={-470} w={110} h={330} t={t} seed={i + 4} color={ACADEMY.crimson} />
    ))}
  </g>
);

/**
 * Daytime courtyard. `horizonY` = where the building base meets the paving.
 * px/py = parallax camera offset (px), applied with depth factors.
 */
export const AcademyCourtyard: React.FC<{t: number; px?: number; py?: number; horizonY?: number; gate?: boolean; dusk?: boolean; children?: React.ReactNode}> = ({
  t,
  px = 0,
  py = 0,
  horizonY = 1180,
  gate = true,
  dusk = false,
  children,
}) => {
  const vpX = 540 + px * 0.2;
  return (
    <AbsoluteFill style={{background: dusk ? 'linear-gradient(#ff9a6a, #ffd29a 60%)' : 'linear-gradient(#5fb4f0, #bfe6ff 62%)', overflow: 'hidden'}}>
      <Svg>
        <defs>
          <linearGradient id="acadShade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.12} />
          </linearGradient>
          <linearGradient id="acadFloor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#c9bc9e" />
            <stop offset="1" stopColor="#e4d8bd" />
          </linearGradient>
        </defs>
        <g transform={`translate(${px * 0.15},${py * 0.15})`}>
          <Cloud x={((180 + t * 14) % 1500) - 200} y={220} s={1.1} />
          <Cloud x={((900 + t * 9) % 1500) - 200} y={400} s={0.8} />
          <Cloud x={((560 + t * 11) % 1500) - 200} y={120} s={0.6} />
        </g>
        <g transform={`translate(${px * 0.5},${py * 0.5})`}>
          <AcademyBuilding cx={540} baseY={horizonY} s={0.78} t={t} />
        </g>
        {gate && (
          <g transform={`translate(${px * 0.7},${py * 0.7})`}>
            <ArenaGate cx={1260} baseY={horizonY + 60} s={0.85} t={t} />
          </g>
        )}
        {/* paving */}
        <g transform={`translate(0,${py})`}>
          <rect x={-300} y={horizonY} width={W + 600} height={H - horizonY + 400} fill="url(#acadFloor)" />
          {Array.from({length: 9}).map((_, i) => {
            const y = horizonY + Math.pow((i + 1) / 9, 1.8) * (H - horizonY + 200);
            return <line key={i} x1={-300} y1={y} x2={W + 300} y2={y} stroke={ACADEMY.stoneDark} strokeWidth={3 + i * 0.6} opacity={0.7} />;
          })}
          {Array.from({length: 17}).map((_, i) => {
            const bx = (i - 8) * 360 + px;
            return <line key={i} x1={vpX + (bx - vpX) * 0.08} y1={horizonY} x2={bx + 540} y2={H + 300} stroke={ACADEMY.stoneDark} strokeWidth={4} opacity={0.6} />;
          })}
          {/* central emblem mosaic */}
          <ellipse cx={540 + px} cy={horizonY + 330} rx={360} ry={90} fill="none" stroke={ACADEMY.gold} strokeWidth={10} opacity={0.7} />
          <ellipse cx={540 + px} cy={horizonY + 330} rx={300} ry={72} fill={ACADEMY.navy} opacity={0.18} />
        </g>
        {children}
      </Svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 40% at 30% 10%, rgba(255,250,220,0.35), rgba(0,0,0,0) 70%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ big screen */

/** Jumbotron frame with arbitrary HTML content; top-left at (x,y). */
export const BigScreen: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode; glow?: string}> = ({x, y, w, h, children, glow = '#4ab8ff'}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 18,
      border: '14px solid #1b1d26',
      boxShadow: `0 0 0 4px #3a3d4a, 0 0 60px ${glow}`,
      background: 'radial-gradient(ellipse at 50% 40%, #1f3a7a, #0a1230)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 2px)',
        backgroundSize: '8px 8px',
      }}
    />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff', fontFamily: CAPTION_FONT}}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ arena interior */

const CROWD_TOPS = ['#d9534f', '#4f8fd9', '#7b5ea7', '#5cb85c', '#f0ad4e', '#2fb5b0', '#e86fa0', '#1f2f5c', '#b8323a', '#e8b84a'];
const CROWD_SKINS = ['#f0c8a8', '#d6a07a', '#b47a52', '#8a5536', '#5e3a26'];

/** Rows of spectators between y0 (back row) and y1 (front row). `excite` 0..1 = bounce + arms up. */
export const Crowd: React.FC<{y0: number; y1: number; t: number; excite?: number; rows?: number; seed?: string; gapX?: [number, number]}> = ({
  y0,
  y1,
  t,
  excite = 0.3,
  rows = 6,
  seed = 'cr',
  gapX,
}) => (
  <g>
    {Array.from({length: rows}).map((_, ri) => {
      const k = ri / Math.max(1, rows - 1);
      const y = y0 + (y1 - y0) * k;
      const s = 0.55 + 0.6 * k;
      const step = 92 * s;
      const n = Math.ceil((W + 200) / step);
      return (
        <g key={ri}>
          <rect x={-100} y={y + 30 * s} width={W + 200} height={60 * s} fill={ri % 2 ? '#3b3f4f' : '#454a5c'} />
          {Array.from({length: n}).map((__, i) => {
            const x = -60 + i * step + (ri % 2) * step * 0.5;
            if (gapX && x > gapX[0] && x < gapX[1]) return null;
            const r = (q: string) => random(`${seed}${ri}-${i}${q}`);
            const top = CROWD_TOPS[Math.floor(r('c') * CROWD_TOPS.length)];
            const skin = CROWD_SKINS[Math.floor(r('s') * CROWD_SKINS.length)];
            const bounce = Math.abs(Math.sin(t * (7 + r('f') * 4) + r('p') * 6)) * 14 * excite * s;
            const arms = excite > 0.4 && r('a') < excite * 0.7;
            const yy = y - bounce;
            return (
              <g key={i} transform={`translate(${x},${yy}) scale(${s})`}>
                {arms && (
                  <>
                    <path d={`M -26,-10 L -44,${-80 - Math.sin(t * 9 + i) * 10}`} stroke={top} strokeWidth={16} strokeLinecap="round" />
                    <path d={`M 26,-10 L 44,${-80 - Math.cos(t * 9 + i) * 10}`} stroke={top} strokeWidth={16} strokeLinecap="round" />
                  </>
                )}
                <rect x={-36} y={-20} width={72} height={70} rx={26} fill={top} />
                <circle cx={0} cy={-46} r={28} fill={skin} />
                <path d={`M -28,-52 Q 0,${-90 + r('h') * 10} 28,-52 Q 18,-70 0,-72 Q -18,-70 -28,-52 Z`} fill={r('hc') > 0.5 ? '#2a1a10' : '#6b4a2a'} />
              </g>
            );
          })}
        </g>
      );
    })}
  </g>
);

/**
 * Arena interior. World coordinates: screen hangs at world y≈-900..-260 (above the default view),
 * stands at 160..1150, tunnel at centre, sand from `sandY` (default 1240) down.
 * `viewY` < 0 tilts the camera UP (e.g. viewY=-800 frames the big screen).
 * `screen` = content of the big screen. `sandChildren` drawn in world coords after the sand (svg).
 */
export const ArenaInterior: React.FC<{
  t: number;
  viewY?: number;
  px?: number;
  excite?: number;
  screen?: React.ReactNode;
  sandY?: number;
  tunnelGlow?: number;
  night?: boolean;
  children?: React.ReactNode;
  /** HTML/puppet layers in WORLD coords (tilt with the set), drawn above the screen. */
  actors?: React.ReactNode;
}> = ({t, viewY = 0, px = 0, excite = 0.3, screen, sandY = 1240, tunnelGlow = 0.4, night = true, children, actors}) => (
  <AbsoluteFill style={{background: night ? '#0d1226' : '#6fb7ee', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `translate(${px}px,${-viewY}px)`}}>
      {/* sky / roof */}
      <div style={{position: 'absolute', left: -200, top: -1400, width: W + 400, height: 1700, background: night ? 'linear-gradient(#070a18, #1a2450)' : 'linear-gradient(#3f8fd8,#9fd2f6)'}} />
      <Svg>
        {/* light rigs */}
        {[-1, 1].map((side) => (
          <g key={side}>
            <rect x={side < 0 ? 40 : W - 220} y={-1180} width={180} height={60} rx={10} fill="#222634" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={(side < 0 ? 80 : W - 180) + i * 50} cy={-1150} r={18} fill="#fff6d8" style={{filter: 'drop-shadow(0 0 14px #fff2b0)'}} />
            ))}
            <path d={`M ${side < 0 ? 130 : W - 130},-1130 L ${side < 0 ? 620 : 460},${sandY + 200} L ${side < 0 ? 900 : 180},${sandY + 200} Z`} fill="rgba(255,246,210,0.06)" />
          </g>
        ))}
        {/* screen cables */}
        <line x1={260} y1={-1400} x2={260} y2={-930} stroke="#2a2e3c" strokeWidth={10} />
        <line x1={820} y1={-1400} x2={820} y2={-930} stroke="#2a2e3c" strokeWidth={10} />
        {/* upper ring / banners */}
        <rect x={-100} y={60} width={W + 200} height={90} fill={ACADEMY.navy} />
        <rect x={-100} y={60} width={W + 200} height={12} fill={ACADEMY.gold} />
        <rect x={-100} y={138} width={W + 200} height={12} fill={ACADEMY.gold} />
        {Array.from({length: 7}).map((_, i) => (
          <g key={i} transform={`translate(${-20 + i * 190},105)`}>
            <EmblemMark s={60} />
          </g>
        ))}
        <Crowd y0={240} y1={1060} t={t} excite={excite} rows={7} gapX={[400, 680]} />
        {/* tunnel */}
        <path d={`M 390,${sandY} L 390,860 Q 540,740 690,860 L 690,${sandY} Z`} fill="#4b4438" />
        <path d={`M 420,${sandY} L 420,880 Q 540,780 660,880 L 660,${sandY} Z`} fill="#0f0c10" />
        <path d={`M 420,${sandY} L 420,880 Q 540,780 660,880 L 660,${sandY} Z`} fill={`rgba(255,190,110,${tunnelGlow})`} />
        <rect x={400} y={700} width={280} height={60} rx={10} fill={ACADEMY.crimson} stroke={ACADEMY.gold} strokeWidth={5} />
        <text x={540} y={745} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={36} letterSpacing={8} fill="#fff">
          ENTRADA
        </text>
        {/* barrier wall */}
        <rect x={-100} y={sandY - 120} width={W + 200} height={120} fill="#7a6a52" />
        <rect x={-100} y={sandY - 120} width={W + 200} height={14} fill={ACADEMY.gold} />
        {Array.from({length: 8}).map((_, i) => (
          <rect key={i} x={-60 + i * 160} y={sandY - 92} width={110} height={62} rx={8} fill={i % 2 ? ACADEMY.navy : ACADEMY.crimson} opacity={i === 3 || i === 4 ? 0 : 1} />
        ))}
        {/* sand */}
        <rect x={-200} y={sandY} width={W + 400} height={H + 600} fill="#e2c48a" />
        <rect x={-200} y={sandY} width={W + 400} height={40} fill="#c9a86c" opacity={0.7} />
        <ellipse cx={540} cy={sandY + 420} rx={620} ry={150} fill="none" stroke="#f6e7c4" strokeWidth={12} opacity={0.8} />
        <ellipse cx={540} cy={sandY + 420} rx={110} ry={30} fill="none" stroke="#f6e7c4" strokeWidth={10} opacity={0.8} />
        {Array.from({length: 60}).map((_, i) => (
          <circle key={i} cx={random(`sd${i}`) * W} cy={sandY + 60 + random(`sdy${i}`) * 900} r={3 + random(`sdr${i}`) * 4} fill="#b8975c" opacity={0.6} />
        ))}
        {children}
      </Svg>
      <BigScreen x={140} y={-930} w={800} h={620}>
        {screen}
      </BigScreen>
      {actors}
    </AbsoluteFill>
  </AbsoluteFill>
);
