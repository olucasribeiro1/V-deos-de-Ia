import React from 'react';
import {random} from 'remotion';
import {PARTS, f, wordAt} from '../timeline';
import {clamp, lerp, easeOut, kf} from '../../lib/anim';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';

export {clamp, lerp, easeOut, kf};
export {CAPTION_FONT, HUD_FONT};

/** Absolute frame of part-B local frame 0. */
export const B0 = f(PARTS.B.start);
/** absolute seconds → part-B local frame */
export const lf = (abs: number) => f(abs) - B0;
/** local frame of the n-th word of a line */
export const wf = (id: string, n: number) => lf(wordAt(id, n));
/** visual centre between the two caption bands */
export const CY = 915;

export type ShotP = {fr: number; a: number; b: number};
/** shot progress 0..1 */
export const prog = ({fr, a, b}: ShotP) => clamp((fr - a) / Math.max(1, b - a));
/** smooth in-out progress (camera moves) */
export const sm = (t: number) => t * t * (3 - 2 * t);
/** appear amount 0..1 from local frame `at` over `d` frames */
export const ap = (fr: number, at: number, d = 9) => easeOut(clamp((fr - at) / d));

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden', ...style}}>
    {children}
  </svg>
);

/** Clean infographic label (dark pill, coloured border). */
export const Tag: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; align?: 'left' | 'center' | 'right'; sub?: string; solid?: boolean}> = ({
  x,
  y,
  text,
  k,
  color = '#ffd23a',
  size = 40,
  align = 'center',
  sub,
  solid,
}) => {
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'left' ? 0 : align === 'right' ? -100 : -50}%,-50%) translateY(${(1 - k) * 18}px) scale(${lerp(0.85, 1, k)})`,
        opacity: clamp(k * 1.4),
        padding: `${size * 0.16}px ${size * 0.45}px ${size * 0.2}px`,
        borderRadius: size * 0.3,
        background: solid ? color : 'rgba(8,20,40,0.82)',
        border: `${Math.max(2, size * 0.07)}px solid ${color}`,
        color: solid ? '#0b1a2e' : color,
        fontFamily: HUD_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: size * 0.06,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
        lineHeight: 1.1,
      }}
    >
      {text}
      {sub ? <div style={{fontSize: size * 0.5, letterSpacing: size * 0.05, opacity: 0.85, fontWeight: 400, marginTop: 2}}>{sub}</div> : null}
    </div>
  );
};

/** Small plain text label (diagram annotation). */
export const Note: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; align?: 'left' | 'center' | 'right'; weight?: number}> = ({x, y, text, k, color = '#fff', size = 30, align = 'center', weight = 700}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'left' ? 0 : align === 'right' ? -100 : -50}%,-50%)`,
        opacity: clamp(k),
        color,
        fontFamily: HUD_FONT,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: size * 0.08,
        whiteSpace: 'nowrap',
        textShadow: '0 2px 6px rgba(0,0,0,0.55)',
      }}
    >
      {text}
    </div>
  );

/** Big number/title in caption font. */
export const Big: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; glow?: boolean}> = ({x, y, text, k, color = '#ff4d4d', size = 180, glow}) =>
  k <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${lerp(1.35, 1, k)})`,
        opacity: clamp(k * 1.5),
        color,
        fontFamily: CAPTION_FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        textShadow: glow ? `0 0 30px ${color}88, 0 6px 0 rgba(0,0,0,0.5)` : '0 6px 0 rgba(0,0,0,0.45)',
      }}
    >
      {text}
    </div>
  );

/** Faint engineering grid background. */
export const Blueprint: React.FC<{top?: string; bottom?: string; grid?: number; op?: number; ox?: number; oy?: number}> = ({top = '#0d2b47', bottom = '#071728', grid = 60, op = 0.08, ox = 0, oy = 0}) => (
  <Svg>
    <defs>
      <linearGradient id="bpg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#bpg)" />
    <g stroke="#9fd4ff" strokeOpacity={op} strokeWidth={1.5}>
      {Array.from({length: Math.ceil(1080 / grid) + 2}).map((_, i) => (
        <line key={`v${i}`} x1={((i * grid + ox) % (1080 + grid)) - grid / 2} y1={0} x2={((i * grid + ox) % (1080 + grid)) - grid / 2} y2={1920} />
      ))}
      {Array.from({length: Math.ceil(1920 / grid) + 2}).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={((i * grid + oy) % (1920 + grid)) - grid / 2} x2={1080} y2={((i * grid + oy) % (1920 + grid)) - grid / 2} />
      ))}
    </g>
  </Svg>
);

/** Rain streaks over the whole frame. n streaks, t = frame. */
export const Rain: React.FC<{t: number; n?: number; op?: number; len?: number; seed?: string}> = ({t, n = 140, op = 0.55, len = 60, seed = 'rn'}) => (
  <Svg>
    <g stroke="#e6f2ff" strokeWidth={3} strokeLinecap="round" opacity={op}>
      {Array.from({length: n}).map((_, i) => {
        const q = (k: string) => random(`${seed}${i}${k}`);
        const sp = 48 + q('v') * 30;
        const y = ((q('y') * 2200 + t * sp) % 2200) - 140;
        const x = ((q('x') * 1300 - t * sp * 0.18) % 1300 + 1300) % 1300 - 100;
        const l = len * (0.6 + q('l') * 0.7);
        return <line key={i} x1={x} y1={y} x2={x - l * 0.18} y2={y + l} strokeOpacity={0.4 + q('o') * 0.6} />;
      })}
    </g>
  </Svg>
);

/** Drop shape path (tip up), centre (x,y), size s (height ≈ 2.2 s). */
export const dropPath = (x: number, y: number, s: number) =>
  `M${x},${y - s * 1.3} C${x + s * 0.35},${y - s * 0.75} ${x + s},${y - s * 0.15} ${x + s},${y + s * 0.3} A${s},${s} 0 1 1 ${x - s},${y + s * 0.3} C${x - s},${y - s * 0.15} ${x - s * 0.35},${y - s * 0.75} ${x},${y - s * 1.3} Z`;

/** Sun with soft rays. */
export const Sun: React.FC<{x: number; y: number; r: number; t: number; color?: string}> = ({x, y, r, t, color = '#ffd23a'}) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.9} fill={color} opacity={0.18} />
    <circle cx={x} cy={y} r={r * 1.4} fill={color} opacity={0.25} />
    <g stroke={color} strokeWidth={r * 0.12} strokeLinecap="round" opacity={0.9}>
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + t * 0.01;
        const r1 = r * 1.25;
        const r2 = r * (1.55 + 0.08 * Math.sin(t * 0.2 + i));
        return <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} />;
      })}
    </g>
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.45} fill="#fff6c8" opacity={0.6} />
  </g>
);

/** Wavy rising arrow (evaporation / heat). Base (x,y), height h, phase t. */
export const WavyUp: React.FC<{x: number; y: number; h: number; t: number; color?: string; w?: number; op?: number}> = ({x, y, h, t, color = '#ffffff', w = 6, op = 1}) => {
  const pts: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const yy = y - (i / 12) * h;
    const xx = x + Math.sin(i * 0.9 + t * 0.25) * 10;
    pts.push(`${i ? 'L' : 'M'}${xx.toFixed(1)},${yy.toFixed(1)}`);
  }
  const tipX = x + Math.sin(12 * 0.9 + t * 0.25) * 10;
  const tipY = y - h;
  return (
    <g opacity={op} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={pts.join(' ')} />
      <path d={`M${tipX - 14},${tipY + 14} L${tipX},${tipY} L${tipX + 14},${tipY + 14}`} />
    </g>
  );
};

/** Location pin. */
export const Pin: React.FC<{x: number; y: number; s?: number; color?: string; k?: number; pulse?: number}> = ({x, y, s = 1, color = '#ff5a5a', k = 1, pulse = 0}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${s * easeOut(clamp(k))})`}>
      {pulse > 0 && <circle cx={0} cy={0} r={20 + (pulse % 30) * 1.6} fill="none" stroke={color} strokeWidth={3} opacity={1 - (pulse % 30) / 30} />}
      <ellipse cx={0} cy={2} rx={12} ry={5} fill="rgba(0,0,0,0.3)" />
      <path d="M0,0 C-8,-14 -22,-26 -22,-42 A22,22 0 1 1 22,-42 C22,-26 8,-14 0,0 Z" fill={color} stroke="#fff" strokeWidth={3} />
      <circle cx={0} cy={-42} r={8} fill="#fff" />
    </g>
  );

/** Soft vignette over a shot. */
export const Vignette: React.FC<{op?: number}> = ({op = 0.45}) => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${op}) 100%)`, pointerEvents: 'none'}} />
);

/** Camera wrapper: scale s around screen point (540, CY) focused at content point (cx, cy). */
export const Cam: React.FC<{cx: number; cy: number; s: number; children: React.ReactNode}> = ({cx, cy, s, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${540 - cx * s}px,${CY - cy * s}px) scale(${s})`}}>{children}</div>
);

/** Interpolated camera between two keys across a shot (eased). */
export const camAt = (p: number, A: [number, number, number], Bk: [number, number, number]) => {
  const e = sm(p);
  return {cx: lerp(A[0], Bk[0], e), cy: lerp(A[1], Bk[1], e), s: lerp(A[2], Bk[2], e)};
};
