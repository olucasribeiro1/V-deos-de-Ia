import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {clamp, lerp} from '../../lib/anim';
import {useUid} from '../../lib/useUid';
import {H, W} from '../../lib/constants';
import type {Pose} from '../../characters/types';

/* ------------------------------------------------------------------ pigeons */

/** Better cartoon pigeon: teardrop body, iridescent neck, barred wings with feathered tips, tail fan. */
export const Pigeon2: React.FC<{x: number; y: number; size: number; flap: number; flying: number; dir: 1 | -1; tilt?: number; shade?: number}> = ({
  x,
  y,
  size,
  flap,
  flying,
  dir,
  tilt = 0,
  shade = 0,
}) => {
  const id = useUid('pg');
  const w = Math.sin(flap * Math.PI * 2);
  // 0 = wing straight up-back, 120 = down-back
  const ang = lerp(lerp(70, 95, flying), lerp(-5, 125, (w + 1) / 2), flying);
  const fore = 0.75 + 0.25 * Math.abs(Math.cos(flap * Math.PI * 2));
  const s = size / 100;
  const wing = 'M0,0 C -6,-30 -30,-74 -66,-104 L -70,-96 L -80,-104 L -82,-92 L -92,-98 L -92,-86 L -102,-90 L -98,-76 L -106,-76 C -84,-40 -46,-10 -12,10 Z';
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${dir * s},${s})`}>
      <defs>
        <linearGradient id={id + 'b'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={shade ? '#8b90a0' : '#a7b0c2'} />
          <stop offset="1" stopColor={shade ? '#5b6070' : '#7f889c'} />
        </linearGradient>
        <linearGradient id={id + 'n'} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#5fa58e" />
          <stop offset="0.5" stopColor="#7a6aa8" />
          <stop offset="1" stopColor="#56607a" />
        </linearGradient>
      </defs>
      {flying > 0.05 && (
        <g transform={`translate(4,-30) rotate(${ang + 12}) scale(1,${fore * 0.9})`}>
          <path d={wing} fill="#5e6678" />
        </g>
      )}
      {/* tail fan */}
      <path d="M -34,-22 L -82,-34 Q -88,-22 -82,-10 Z" fill="#6f788b" />
      <path d="M -70,-31 L -82,-34 Q -88,-22 -82,-10 L -71,-13 Z" fill="#2e3240" />
      {/* body */}
      <path d="M 40,-30 C 44,-6 22,4 -6,2 C -30,0 -42,-12 -46,-24 C -30,-36 6,-50 40,-30 Z" fill={`url(#${id}b)`} />
      <path d="M 34,-14 C 26,-2 6,2 -12,-2 C 4,-6 24,-10 34,-14 Z" fill="#c9cfdb" opacity={0.7} />
      {/* folded wing with two dark bars */}
      {flying < 0.5 && (
        <g opacity={1 - flying * 2}>
          <path d="M 18,-34 C 4,-40 -30,-34 -50,-22 C -26,-12 6,-14 18,-24 Z" fill="#8a93a6" />
          <path d="M -6,-33 L -12,-17" stroke="#272a33" strokeWidth={5} strokeLinecap="round" />
          <path d="M -20,-31 L -26,-16" stroke="#272a33" strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
      {/* neck + head */}
      <path d="M 20,-36 C 22,-50 30,-58 40,-56 C 48,-52 46,-40 42,-28 C 34,-24 24,-26 20,-36 Z" fill={`url(#${id}n)`} />
      <circle cx={42} cy={-56} r={12} fill="#9099ab" />
      <circle cx={46} cy={-58} r={4} fill="#f08a2a" />
      <circle cx={46.6} cy={-58} r={2.2} fill="#111" />
      <path d="M 52,-57 L 66,-52 L 53,-50 Z" fill="#3a3436" />
      <ellipse cx={54} cy={-56} rx={3.5} ry={2.2} fill="#f2efe8" />
      {/* near wing */}
      {flying > 0.05 && (
        <g transform={`translate(8,-30) rotate(${ang}) scale(1,${fore})`}>
          <path d={wing} fill="#7d879b" />
          <path d="M -20,-20 L -52,-66" stroke="#2c303b" strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          <path d="M -8,-10 L -34,-50" stroke="#2c303b" strokeWidth={6} strokeLinecap="round" opacity={0.75} />
        </g>
      )}
      {flying < 0.6 && (
        <g stroke="#e0736a" strokeWidth={4.5} strokeLinecap="round" opacity={1 - flying}>
          <line x1={-2} y1={-1} x2={-5} y2={10} />
          <line x1={9} y1={-1} x2={10} y2={10} />
        </g>
      )}
    </g>
  );
};

/** Flock pecking on the ground that bursts upward / outward at `start`. Screen px. */
export const Flock: React.FC<{frame: number; start: number; ox: number; oy: number; count?: number; spread?: number; size?: number; seed?: string; speed?: number}> = ({
  frame,
  start,
  ox,
  oy,
  count = 14,
  spread = 420,
  size = 60,
  seed = 'fl',
  speed = 1,
}) => {
  const birds = Array.from({length: count}).map((_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const bx = ox + (r('x') - 0.5) * spread * 2;
    const by = oy + (r('y') - 0.3) * spread * 0.3;
    const depth = 1 + (by - oy) / (spread * 1.2);
    const s = size * (0.75 + r('s') * 0.5) * depth;
    const away = bx >= ox ? 1 : -1;
    const age = frame - start - r('d') * 3;
    const fly = clamp(age / 3);
    const tt = Math.max(0, age);
    const vx = away * (5 + r('vx') * 14) * speed * depth;
    const vy = -(10 + r('vy') * 12) * speed * depth;
    const x = bx + vx * tt + Math.sin(tt * 0.35 + i) * 5;
    const y = by + vy * tt + 0.12 * tt * tt * speed;
    const peck = age < 0 ? Math.max(0, Math.sin(frame * 0.35 + i * 2)) * s * 0.06 : 0;
    return {i, x, y: y + peck, s: s * (1 + tt * 0.03), flap: tt * (0.28 + r('f') * 0.12) + r('p'), fly, dir: (age < 0 ? (r('dir') > 0.5 ? 1 : -1) : away) as 1 | -1, tilt: fly * away * -(10 + r('t') * 18), by};
  });
  birds.sort((a, b) => a.by - b.by);
  return (
    <g>
      {birds.map((b) => (
        <Pigeon2 key={b.i} x={b.x} y={b.y} size={b.s} flap={b.flap} flying={b.fly} dir={b.dir} tilt={b.tilt} />
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ microphones */

/** Small weatherproof microphone box with a mesh dome, antenna and LED. Drawn centred, ~200 px tall at scale 1. */
export const MicBox: React.FC<{x: number; y: number; scale?: number; led: number; ping?: number}> = ({x, y, scale = 1, led, ping = 0}) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {ping > 0 && ping < 1 && (
      <>
        <circle r={40 + ping * 260} fill="none" stroke="#ff4848" strokeWidth={10 * (1 - ping)} opacity={1 - ping} />
        <circle r={20 + ping * 160} fill="none" stroke="#ffb0a8" strokeWidth={6 * (1 - ping)} opacity={(1 - ping) * 0.8} />
      </>
    )}
    {/* bracket */}
    <rect x={40} y={-14} width={60} height={28} fill="#30343c" />
    <rect x={92} y={-40} width={22} height={80} rx={6} fill="#24272e" />
    {/* antenna */}
    <line x1={-30} y1={-70} x2={-44} y2={-160} stroke="#2a2d33" strokeWidth={6} strokeLinecap="round" />
    <circle cx={-44} cy={-162} r={6} fill="#2a2d33" />
    {/* box */}
    <rect x={-66} y={-74} width={112} height={128} rx={14} fill="#5b616c" />
    <rect x={-66} y={-74} width={30} height={128} rx={12} fill="#7c838f" opacity={0.6} />
    <rect x={-60} y={-68} width={100} height={20} rx={6} fill="#6d7480" />
    {/* mesh dome */}
    <path d="M -50,54 Q -50,110 -10,112 Q 30,110 30,54 Z" fill="#1d2026" />
    {Array.from({length: 5}).map((_, i) => (
      <line key={i} x1={-44 + i * 16} y1={58} x2={-44 + i * 16} y2={104 - Math.abs(i - 2) * 8} stroke="#3e434d" strokeWidth={3} />
    ))}
    {/* LED */}
    <circle cx={22} cy={-30} r={18} fill="#ff2a2a" opacity={0.35 * led} />
    <circle cx={22} cy={-30} r={8} fill={led > 0.5 ? '#ff4040' : '#5a1c1c'} />
    <circle cx={20} cy={-32} r={3} fill="#fff" opacity={0.6 * led} />
  </g>
);

/** Dusk city backdrop (blurred building silhouettes with windows) for mic close-ups. */
export const DuskCity: React.FC<{t: number; seed?: string; hue?: number; offset?: number}> = ({t, seed = 'dc', hue = 0, offset = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, hsl(${255 + hue},40%,22%) 0%, hsl(${330 + hue},45%,45%) 45%, hsl(${25 + hue},85%,64%) 70%, hsl(${280 + hue},25%,25%) 100%)`}}>
    <AbsoluteFill style={{filter: 'blur(10px)'}}>
      <svg width={W} height={H}>
        {Array.from({length: 10}).map((_, i) => {
          const r = (k: string) => random(`${seed}-${i}-${k}`);
          const x = i * 130 - 120 + r('x') * 40 + offset;
          const h = 500 + r('h') * 700;
          return (
            <g key={i}>
              <rect x={x} y={1500 - h} width={110 + r('w') * 60} height={h + 600} fill={`hsl(${265 + hue},30%,${14 + r('l') * 8}%)`} />
              {Array.from({length: 14}).map((__, k) => (
                <rect key={k} x={x + 16 + (k % 3) * 32} y={1540 - h + Math.floor(k / 3) * 70} width={18} height={28} fill="#ffd38a" opacity={random(`${seed}-w-${i}-${k}`) > 0.6 ? 0.85 : 0.1} />
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 30% at 50% 62%, rgba(255,190,120,0.35), rgba(255,190,120,0))', mixBlendMode: 'screen', opacity: 0.6 + 0.1 * Math.sin(t * 3)}} />
  </AbsoluteFill>
);

/** Lamp pole (vertical) with a mic box clamped to it. Screen px. */
export const PoleWithMic: React.FC<{x: number; topY: number; micY: number; scale?: number; led: number; ping?: number; arm?: boolean}> = ({x, topY, micY, scale = 1, led, ping = 0, arm = true}) => {
  const id = useUid('pole');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#ffb170" />
          <stop offset="0.12" stopColor="#4a4e58" />
          <stop offset="0.6" stopColor="#2a2d34" />
          <stop offset="1" stopColor="#15161b" />
        </linearGradient>
      </defs>
      <rect x={x - 34 * scale} y={topY} width={68 * scale} height={H * 2} fill={`url(#${id})`} />
      {arm && <path d={`M${x},${topY + 20} Q ${x},${topY - 120 * scale} ${x + 200 * scale},${topY - 130 * scale} L ${x + 300 * scale},${topY - 130 * scale}`} stroke="#25282f" strokeWidth={24 * scale} fill="none" />}
      <rect x={x - 40 * scale} y={micY - 30 * scale} width={80 * scale} height={20 * scale} fill="#1b1d22" />
      <rect x={x - 40 * scale} y={micY + 50 * scale} width={80 * scale} height={20 * scale} fill="#1b1d22" />
      <MicBox x={x - 150 * scale} y={micY + 20 * scale} scale={scale} led={led} ping={ping} />
    </g>
  );
};

/* ------------------------------------------------------------------ emblem / props */

/** Old engraved bronze seal of "A Linha": rings, ticks, a single horizontal bar. */
export const LinhaEmblem: React.FC<{x: number; y: number; r: number; glow: number; sweep: number}> = ({x, y, r, glow, sweep}) => {
  const id = useUid('emb');
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#8a6a3a" />
          <stop offset="0.6" stopColor="#4a361c" />
          <stop offset="1" stopColor="#21170c" />
        </radialGradient>
        <linearGradient id={id + 's'} x1="0" x2="1" y1="0" y2="1">
          <stop offset={Math.max(0, sweep - 0.12)} stopColor="#fff2c8" stopOpacity={0} />
          <stop offset={sweep} stopColor="#fff2c8" stopOpacity={0.55} />
          <stop offset={Math.min(1, sweep + 0.12)} stopColor="#fff2c8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <circle r={r * 1.3} fill="#c9a060" opacity={0.12 * glow} />
      <circle r={r} fill={`url(#${id})`} stroke="#120c06" strokeWidth={r * 0.03} />
      <circle r={r * 0.86} fill="none" stroke="#b08a4e" strokeWidth={r * 0.025} opacity={0.8} />
      <circle r={r * 0.62} fill="none" stroke="#b08a4e" strokeWidth={r * 0.02} opacity={0.7} />
      {Array.from({length: 48}).map((_, i) => {
        const a = (i / 48) * Math.PI * 2;
        const l = i % 4 === 0 ? 0.1 : 0.05;
        return <line key={i} x1={Math.cos(a) * r * 0.88} y1={Math.sin(a) * r * 0.88} x2={Math.cos(a) * r * (0.88 + l)} y2={Math.sin(a) * r * (0.88 + l)} stroke="#c49a58" strokeWidth={r * 0.012} opacity={0.75} />;
      })}
      {/* the line */}
      <rect x={-r * 0.78} y={-r * 0.06} width={r * 1.56} height={r * 0.12} rx={r * 0.03} fill="#d9b36e" />
      <rect x={-r * 0.78} y={-r * 0.06} width={r * 1.56} height={r * 0.035} fill="#fff0c4" opacity={0.6} />
      <circle r={r * 0.08} fill="#21170c" stroke="#d9b36e" strokeWidth={r * 0.02} />
      <circle r={r} fill={`url(#${id}s)`} />
    </g>
  );
};

/** Generic red soda can (no brand), centred, ~ h px tall. */
export const RedCan: React.FC<{x: number; y: number; h: number; rot?: number}> = ({x, y, h, rot = 0}) => {
  const id = useUid('can');
  const w = h * 0.55;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#7a0e10" />
          <stop offset="0.25" stopColor="#ff4a3d" />
          <stop offset="0.45" stopColor="#d81e1e" />
          <stop offset="1" stopColor="#5e0a0c" />
        </linearGradient>
      </defs>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.12} fill={`url(#${id})`} />
      <path d={`M${-w / 2},${-h * 0.05} C ${-w * 0.1},${-h * 0.2} ${w * 0.1},${h * 0.12} ${w / 2},${-h * 0.02} L ${w / 2},${h * 0.08} C ${w * 0.1},${h * 0.22} ${-w * 0.1},${-h * 0.1} ${-w / 2},${h * 0.05} Z`} fill="#fff4ec" opacity={0.9} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.08} rx={w * 0.08} fill="#c9ccd3" />
      <rect x={-w / 2} y={h / 2 - h * 0.06} width={w} height={h * 0.06} rx={w * 0.08} fill="#9ea2aa" />
      <rect x={-w * 0.32} y={-h / 2} width={w * 0.1} height={h} fill="#fff" opacity={0.25} />
    </g>
  );
};

/** Açaí cup (purple, granola, spoon), centred on its middle, h px tall. */
export const AcaiCup: React.FC<{x: number; y: number; h: number; rot?: number}> = ({x, y, h, rot = 0}) => {
  const id = useUid('acai');
  const wt = h * 0.82;
  const wb = h * 0.6;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#d9d2e4" />
          <stop offset="0.3" stopColor="#ffffff" />
          <stop offset="1" stopColor="#a99fb8" />
        </linearGradient>
      </defs>
      {/* spoon */}
      <rect x={h * 0.05} y={-h * 0.85} width={h * 0.06} height={h * 0.5} rx={h * 0.03} fill="#e3542a" transform={`rotate(14 ${h * 0.08} ${-h * 0.5})`} />
      <path d={`M${-wt / 2},${-h / 2} L ${wt / 2},${-h / 2} L ${wb / 2},${h / 2} L ${-wb / 2},${h / 2} Z`} fill={`url(#${id})`} />
      <path d={`M${-wt * 0.47},${-h * 0.1} L ${wt * 0.47},${-h * 0.1} L ${wt * 0.44},${h * 0.12} L ${-wt * 0.44},${h * 0.12} Z`} fill="#5b2a6e" />
      <ellipse cx={0} cy={-h / 2} rx={wt / 2} ry={h * 0.1} fill="#4a1d5c" />
      <ellipse cx={0} cy={-h / 2 - h * 0.03} rx={wt * 0.42} ry={h * 0.08} fill="#6b2a80" />
      {Array.from({length: 9}).map((_, i) => (
        <circle key={i} cx={-wt * 0.3 + ((i * 37) % 11) * wt * 0.055} cy={-h * 0.55 + ((i * 13) % 5) * h * 0.012} r={h * 0.03} fill={i % 3 ? '#d9a35a' : '#f1d9a6'} />
      ))}
      <circle cx={wt * 0.12} cy={-h * 0.57} r={h * 0.045} fill="#ffd13b" />
    </g>
  );
};

/* ------------------------------------------------------------------ puppet helpers */

const SH: [number, number] = [128, -728];
const rad = (d: number) => (d * Math.PI) / 180;
const step = (p: [number, number], a: number, l: number): [number, number] => [p[0] + Math.sin(rad(a)) * l, p[1] + Math.cos(rad(a)) * l];
/** Wrist position (puppet local units) for a pose, ignoring lean / bob. */
export const wristOf = (pose: Pose, side: 'L' | 'R'): [number, number] => {
  const sh: [number, number] = side === 'L' ? [-SH[0], SH[1]] : [SH[0], SH[1]];
  const s = side === 'L' ? pose.shL ?? -7 : pose.shR ?? 7;
  const e = side === 'L' ? pose.elL ?? 6 : pose.elR ?? -6;
  return step(step(sh, s, 182), s + e, 168 + 26);
};

/** Desaturated "imagination" grade overlay. */
export const Imagination: React.FC<{k?: number}> = ({k = 1}) => (
  <>
    <AbsoluteFill style={{backdropFilter: `grayscale(${0.9 * k}) contrast(1.05)`, pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: `rgba(120,130,150,${0.18 * k})`, mixBlendMode: 'multiply', pointerEvents: 'none'}} />
  </>
);
