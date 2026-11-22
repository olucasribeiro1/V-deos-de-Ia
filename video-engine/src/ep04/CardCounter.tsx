import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {CAPTION_FONT, HUD_FONT} from '../lib/fonts';
import {clamp, easeOut, lerp} from '../lib/anim';

/** Small crossed-out bank card icon (stripe + chip). w = px width. */
export const DeadCardIcon: React.FC<{w?: number; color?: string; crossed?: boolean}> = ({w = 70, color = '#2f6fd6', crossed = true}) => {
  const h = w * 0.63;
  return (
    <svg width={w + 8} height={h + 8} viewBox={`-4 -4 ${w + 8} ${h + 8}`} style={{display: 'block', overflow: 'visible'}}>
      <rect x={0} y={0} width={w} height={h} rx={w * 0.09} fill={color} stroke="#14141a" strokeWidth={3} />
      <rect x={0} y={h * 0.18} width={w} height={h * 0.2} fill="#14141a" />
      <rect x={w * 0.1} y={h * 0.52} width={w * 0.2} height={h * 0.26} rx={3} fill="#e8c45a" />
      <rect x={w * 0.4} y={h * 0.6} width={w * 0.45} height={h * 0.08} rx={2} fill="#fff" opacity={0.7} />
      {crossed && (
        <g stroke="#e0302c" strokeWidth={w * 0.08} strokeLinecap="round">
          <line x1={w * 0.05} y1={h * 0.05} x2={w * 0.95} y2={h * 0.95} />
          <line x1={w * 0.95} y1={h * 0.05} x2={w * 0.05} y2={h * 0.95} />
        </g>
      )}
    </svg>
  );
};

/**
 * Shared EP04 running gag: red rubber-stamp chip "CARTÕES PERDIDOS: N" with a dead-card icon.
 * Slams in at local frame `from` (4-frame landing from 2.4×, ink jitter), fades out at `to`.
 * Optional `prev`: shows that number first and flips to `value` at `flipAt` (local frame).
 * (x, y) = centre of the chip in px.
 */
export const CardCounter: React.FC<{
  value: number;
  from: number;
  to?: number;
  x: number;
  y: number;
  size?: number;
  rot?: number;
  prev?: number;
  flipAt?: number;
}> = ({value, from, to = 1e9, x, y, size = 56, rot = -6, prev, flipAt}) => {
  const fr = useCurrentFrame();
  const k = fr - from;
  if (k < 0 || fr >= to) return null;
  const sc = k < 4 ? lerp(2.4, 1, easeOut(k / 4)) : 1 + Math.max(0, 0.07 * Math.sin((k - 4) * 0.9) * Math.exp(-(k - 4) * 0.25));
  const out = clamp((to - fr) / 5);
  const shown = prev !== undefined && flipAt !== undefined && fr < flipAt ? prev : value;
  const fk = flipAt !== undefined ? fr - flipAt : 99;
  const numSc = fk >= 0 && fk < 8 ? 1 + 0.45 * Math.sin((fk / 8) * Math.PI) : 1;
  const jx = k < 6 ? (random(`cc${fr}`) - 0.5) * 10 : 0;
  const red = '#e0302c';
  return (
    <div
      style={{
        position: 'absolute',
        left: x + jx,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc})`,
        opacity: clamp(k / 2 + 0.3) * out,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.3,
        padding: `${size * 0.16}px ${size * 0.4}px ${size * 0.16}px ${size * 0.28}px`,
        border: `${size * 0.09}px solid ${red}`,
        borderRadius: size * 0.22,
        background: 'rgba(255,248,236,0.95)',
        boxShadow: `0 0 0 ${size * 0.05}px rgba(255,248,236,0.95), 0 12px 30px rgba(0,0,0,0.45)`,
        whiteSpace: 'nowrap',
        color: red,
      }}
    >
      <DeadCardIcon w={size * 1.3} />
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: size * 0.62, letterSpacing: size * 0.05, lineHeight: 1}}>CARTÕES PERDIDOS:</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: size * 1.25, lineHeight: 1, transform: `scale(${numSc})`, minWidth: size * 1.1, textAlign: 'center'}}>{shown}</div>
    </div>
  );
};
