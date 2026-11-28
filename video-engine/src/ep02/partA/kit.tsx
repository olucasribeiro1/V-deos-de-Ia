import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {H, W} from '../../lib/constants';
import {HUD_FONT} from '../../lib/fonts';
import {clamp, easeOut, kf, lerp} from '../../lib/anim';
import {useUid} from '../../lib/useUid';
import {f, wordAt} from '../timeline';
import type {Lighting} from '../../characters/types';
import {Flash, Rastro} from '../../fx/Rastro';

/** Props every shot receives: absolute start frame and duration in frames. */
export type ShotProps = {start: number; d: number};

/** Shot-local frame of a narration word onset. */
export const wl = (start: number, line: string, n: number) => f(wordAt(line, n)) - start;

export const MORNING_LIGHT: Lighting = {side: -1, rim: '#ffe2a8', rimStrength: 0.8, shadeStrength: 0.5};
export const NOON_LIGHT: Lighting = {side: 1, rim: '#fff6d8', rimStrength: 0.7, shadeStrength: 0.45};
export const SNOW_LIGHT: Lighting = {side: 1, rim: '#d8f0ff', rimStrength: 0.9, shadeStrength: 0.6};
export const SCREEN_LIGHT: Lighting = {side: 1, rim: '#6fc8ff', rimStrength: 0.95, shadeStrength: 0.85};
export const NEON: Lighting = {side: 1, rim: '#ff6bd6', rimStrength: 0.85, shadeStrength: 0.75};
export const NYC_LIGHT: Lighting = {side: -1, rim: '#ffb35c', rimStrength: 0.85, shadeStrength: 0.7};

/** Fades content inside the caption bands (top ≈14–26 %, bottom ≈70–82 %). */
export const BAND_MASK =
  'linear-gradient(to bottom, #000 0%, #000 11%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 26%, #000 30%, #000 66%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.08) 82%, #000 86%)';

/** Vertical sky gradient (stops top → bottom). */
export const Sky: React.FC<{stops: string[]; h?: number}> = ({stops, h = H}) => {
  const id = useUid('sky');
  return (
    <svg width={W} height={H} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          {stops.map((c, i) => (
            <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect width={W} height={h} fill={`url(#${id})`} />
    </svg>
  );
};

/** Parallax layer: shifts with the camera progress `p` × depth factor and optional blur. */
export const Layer: React.FC<{dx?: number; dy?: number; s?: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({dx = 0, dy = 0, s = 1, blur = 0, children, style}) => (
  <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, ...style}}>{children}</AbsoluteFill>
);

/** Analog clock face (screen px). `h` in hours (fractional). */
export const Clock: React.FC<{x: number; y: number; r: number; h: number; label?: string; color?: string; glow?: number}> = ({x, y, r, h, label, color = '#ffd23f', glow = 0}) => {
  const ha = (h % 12) * 30;
  const ma = (h % 1) * 360;
  const hand = (a: number, len: number, w: number, c: string) => (
    <line x1={0} y1={0} x2={Math.sin((a * Math.PI) / 180) * len} y2={-Math.cos((a * Math.PI) / 180) * len} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g transform={`translate(${x},${y})`}>
      {glow > 0 && <circle r={r * 1.25} fill={color} opacity={0.18 * glow} />}
      <circle r={r} fill="#0f1426" stroke={color} strokeWidth={r * 0.07} />
      <circle r={r * 0.86} fill="#18203a" />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const l = i % 3 === 0 ? 0.16 : 0.08;
        return <line key={i} x1={Math.sin(a) * r * 0.82} y1={-Math.cos(a) * r * 0.82} x2={Math.sin(a) * r * (0.82 - l)} y2={-Math.cos(a) * r * (0.82 - l)} stroke="#fff" strokeWidth={r * 0.035} opacity={0.8} />;
      })}
      {hand(ha, r * 0.48, r * 0.08, '#fff')}
      {hand(ma, r * 0.7, r * 0.05, color)}
      <circle r={r * 0.07} fill={color} />
      {label && (
        <text y={r + r * 0.42} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={r * 0.3} letterSpacing={r * 0.03} fill="#fff" style={{filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))'}}>
          {label}
        </text>
      )}
    </g>
  );
};

/** Red map pin (tip at 0,0), size ~ 1 = 100 px tall. */
export const Pin: React.FC<{x: number; y: number; s?: number; color?: string; drop?: number; pulse?: number}> = ({x, y, s = 1, color = '#ff3b3b', drop = 1, pulse = 0}) => {
  if (drop <= 0) return null;
  const fall = (1 - drop) * -160;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={3} rx={20 * drop} ry={7 * drop} fill="#000" opacity={0.35} />
      {pulse > 0 && pulse < 1 && <circle r={20 + pulse * 90} fill="none" stroke={color} strokeWidth={6 * (1 - pulse)} opacity={1 - pulse} />}
      <g transform={`translate(0,${fall})`}>
        <path d="M 0,0 C -12,-22 -34,-44 -34,-70 A 34,34 0 1 1 34,-70 C 34,-44 12,-22 0,0 Z" fill={color} stroke="#5a0a0a" strokeWidth={3} />
        <path d="M -22,-80 A 25,25 0 0 1 8,-99" stroke="#ffb0b0" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
        <circle cx={0} cy={-70} r={12} fill="#fff" />
      </g>
    </g>
  );
};

/** Procedural "travel photo" thumbnail (w × h px at 0,0), kind by index. */
export const PhotoThumb: React.FC<{w: number; h: number; i: number}> = ({w, h, i}) => {
  const id = useUid('ph');
  const kinds = ['beach', 'tower', 'city', 'mount', 'palm', 'sunset', 'dome', 'night'] as const;
  const k = kinds[Math.floor(random(`pk-${i}`) * kinds.length)];
  const pal: Record<string, [string, string, string]> = {
    beach: ['#7fd0f5', '#ffe2a6', '#2f8fc9'],
    tower: ['#ffc78f', '#f8e7c8', '#6d5a48'],
    city: ['#3a4b8c', '#ff9e6b', '#1a1f3c'],
    mount: ['#8ec9f0', '#ffffff', '#5b6f8c'],
    palm: ['#41c7d6', '#f6e3a8', '#1e7f5c'],
    sunset: ['#ff8c5a', '#ffd27a', '#4a2a50'],
    dome: ['#5fb6f0', '#ffffff', '#2a5fb0'],
    night: ['#0f1838', '#ffd36b', '#2b2f55'],
  };
  const [a, b, c] = pal[k];
  const hz = h * (0.55 + random(`ph-hz-${i}`) * 0.15);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <clipPath id={id + 'c'}>
          <rect width={w} height={h} rx={w * 0.06} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width={w} height={h} fill={`url(#${id})`} />
        {k === 'beach' && <path d={`M0,${hz} H${w} V${h} H0 Z`} fill={c} />}
        {k === 'beach' && <path d={`M0,${h * 0.85} Q${w * 0.5},${h * 0.75} ${w},${h * 0.82} V${h} H0 Z`} fill="#f5d99a" />}
        {k === 'tower' && <path d={`M${w * 0.5},${h * 0.12} L${w * 0.58},${h * 0.6} L${w * 0.7},${h} H${w * 0.3} L${w * 0.42},${h * 0.6} Z`} fill={c} />}
        {k === 'city' &&
          Array.from({length: 6}).map((_, j) => {
            const bh = h * (0.25 + random(`pcb-${i}-${j}`) * 0.5);
            return <rect key={j} x={(j * w) / 6} y={h - bh} width={w / 6 - 2} height={bh} fill={c} />;
          })}
        {k === 'mount' && <path d={`M0,${h} L${w * 0.35},${h * 0.35} L${w * 0.5},${h * 0.5} L${w * 0.7},${h * 0.25} L${w},${h * 0.7} V${h} Z`} fill={c} />}
        {k === 'mount' && <path d={`M${w * 0.62},${h * 0.37} L${w * 0.7},${h * 0.25} L${w * 0.78},${h * 0.37} Z`} fill="#fff" />}
        {k === 'palm' && <path d={`M0,${hz} H${w} V${h} H0 Z`} fill="#33c2c9" />}
        {k === 'palm' && <path d={`M${w * 0.3},${h} Q${w * 0.34},${h * 0.6} ${w * 0.45},${h * 0.35}`} stroke="#5a3d22" strokeWidth={w * 0.05} fill="none" />}
        {k === 'palm' && <path d={`M${w * 0.45},${h * 0.35} q${-w * 0.25},${-h * 0.02} ${-w * 0.35},${h * 0.12} M${w * 0.45},${h * 0.35} q${w * 0.2},${-h * 0.06} ${w * 0.33},${h * 0.1} M${w * 0.45},${h * 0.35} q${-w * 0.02},${-h * 0.15} ${w * 0.1},${-h * 0.2}`} stroke={c} strokeWidth={w * 0.06} fill="none" strokeLinecap="round" />}
        {k === 'sunset' && <circle cx={w * 0.5} cy={hz} r={w * 0.18} fill="#fff2b0" />}
        {k === 'sunset' && <path d={`M0,${hz} H${w} V${h} H0 Z`} fill={c} />}
        {k === 'dome' && <path d={`M0,${hz} H${w} V${h} H0 Z`} fill={c} />}
        {k === 'dome' && <rect x={w * 0.25} y={hz - h * 0.2} width={w * 0.4} height={h * 0.2} fill="#fff" />}
        {k === 'dome' && <path d={`M${w * 0.3},${hz - h * 0.2} A${w * 0.15},${w * 0.15} 0 0 1 ${w * 0.6},${hz - h * 0.2} Z`} fill="#2a6fd0" />}
        {k === 'night' &&
          Array.from({length: 5}).map((_, j) => {
            const bh = h * (0.3 + random(`pnb-${i}-${j}`) * 0.45);
            return (
              <g key={j}>
                <rect x={(j * w) / 5} y={h - bh} width={w / 5 - 3} height={bh} fill={c} />
                <rect x={(j * w) / 5 + w * 0.05} y={h - bh + h * 0.08} width={w * 0.04} height={w * 0.04} fill={b} />
              </g>
            );
          })}
      </g>
    </g>
  );
};

/** Rastro arrival + white flash at frame 0 of a shot. */
export const Arrive: React.FC<{x: number; y: number; h: number; seed: string; at?: number; len?: number}> = ({x, y, h, seed, at = 0, len = 22}) => {
  const fr = useCurrentFrame();
  return (
    <>
      <Rastro x={x} y={y} height={h} life={kf(fr, [at, at + len], [0.12, 0.99], (v) => v)} frame={fr} seed={seed} />
      <Flash k={kf(fr, [at, at + 1, at + 6], [0, 0.75, 0], (v) => v)} />
    </>
  );
};

/** HUD-style big clock readout ("08:00") with a tiny label, centred on x. */
export const TimeChip: React.FC<{x: number; y: number; label: string; time: string; from: number; scale?: number}> = ({x, y, label, time, from, scale = 1}) => {
  const fr = useCurrentFrame();
  const k = kf(fr, [from, from + 8], [0, 1], easeOut);
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 200 * scale,
        width: 400 * scale,
        top: y,
        textAlign: 'center',
        fontFamily: HUD_FONT,
        color: '#fff',
        opacity: k,
        transform: `translateY(${(1 - k) * 14}px) scale(${lerp(1.15, 1, k)})`,
        textShadow: '0 3px 10px rgba(0,0,0,0.5)',
        lineHeight: 1,
      }}
    >
      <div style={{fontSize: 24 * scale, fontWeight: 700, letterSpacing: 4 * scale}}>{label}</div>
      <div style={{fontSize: 96 * scale, fontWeight: 700, marginTop: 6 * scale, fontVariantNumeric: 'tabular-nums'}}>{time}</div>
    </div>
  );
};

/** Snowfall / wind-blown flakes (screen space). */
export const Snow: React.FC<{t: number; count?: number; wind?: number; seed?: string; size?: number; opacity?: number}> = ({t, count = 70, wind = 300, seed = 'sn', size = 1, opacity = 0.9}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
    <svg width={W} height={H}>
      {Array.from({length: count}).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const sp = 0.5 + r('s');
        const x = ((((r('x') * (W + 400) + t * wind * sp) % (W + 400)) + W + 400) % (W + 400)) - 200;
        const y = (((r('y') * H + t * 260 * sp) % H) + H) % H;
        const rr = (2 + r('r') * 6) * size;
        return <ellipse key={i} cx={x} cy={y} rx={rr * (1 + wind / 600)} ry={rr} fill="#fff" opacity={0.4 + r('o') * 0.6} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** Breath vapour puffs from a mouth point, phase-driven. */
export const Breath: React.FC<{x: number; y: number; t: number; dir?: 1 | -1; scale?: number; rate?: number}> = ({x, y, t, dir = 1, scale = 1, rate = 2.2}) => (
  <svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none'}}>
    {[0, 1, 2].map((i) => {
      const ph = (t * rate + i / 3) % 1;
      const r = (20 + ph * 90) * scale;
      return <circle key={i} cx={x + dir * ph * 160 * scale} cy={y - ph * 40 * scale} r={r} fill="#eef7ff" opacity={(1 - ph) * 0.45} style={{filter: 'blur(6px)'}} />;
    })}
  </svg>
);

/** Two-atom O₂ molecule. */
export const O2: React.FC<{x: number; y: number; r: number; o?: number; a?: number}> = ({x, y, r, o = 1, a = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${a})`} opacity={o}>
    {[-1, 1].map((s) => (
      <g key={s}>
        <circle cx={s * r * 0.7} r={r} fill="#ff5a5a" />
        <circle cx={s * r * 0.7 - r * 0.3} cy={-r * 0.35} r={r * 0.32} fill="#ffc0c0" opacity={0.8} />
      </g>
    ))}
  </g>
);

export const pct = (fr: number, d: number) => clamp(fr / Math.max(1, d - 1));
