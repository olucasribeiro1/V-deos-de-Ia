import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {HUD_FONT} from '../lib/fonts';
import {easeOut} from '../lib/anim';

/**
 * Data label in the reference style: tiny caps label, big number, small unit,
 * and a thin white leader line ending in a small ring on the target point.
 */
export const HudLabel: React.FC<{
  label: string;
  value: number | string;
  unit?: string;
  /** text anchor (top-left of the label block) in px */
  x: number;
  y: number;
  /** point the leader line goes to */
  tx: number;
  ty: number;
  from: number;
  to?: number;
  /** count up numeric values */
  countUp?: boolean;
  decimals?: number;
  align?: 'left' | 'right';
  scale?: number;
}> = ({label, value, unit, x, y, tx, ty, from, to = 99999, countUp = true, decimals = 0, align = 'left', scale = 1}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const f = frame - from;
  const line = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp', easing: easeOut});
  const txt = interpolate(f, [4, 10], [0, 1], {extrapolateRight: 'clamp'});
  const out = interpolate(frame, [to - 4, to], [1, 0], {extrapolateLeft: 'clamp'});
  let shown: string;
  if (typeof value === 'number') {
    const v = countUp ? value * interpolate(f, [4, 20], [0, 1], {extrapolateRight: 'clamp', easing: easeOut}) : value;
    shown = v.toLocaleString('pt-BR', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  } else shown = value;
  // leader: from the text block corner to the target
  const cornerX = align === 'left' ? x + 16 * scale : x - 16 * scale;
  const cornerY = y + 108 * scale;
  const lx = cornerX + (tx - cornerX) * line;
  const ly = cornerY + (ty - cornerY) * line;
  const shadow = '0 2px 6px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)';
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: out}}>
      <svg width="100%" height="100%" style={{position: 'absolute', overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))'}}>
        <line x1={cornerX} y1={cornerY} x2={lx} y2={ly} stroke="#fff" strokeWidth={2.5 * scale} />
        {line > 0.98 && (
          <>
            <circle cx={tx} cy={ty} r={9 * scale} fill="none" stroke="#fff" strokeWidth={2.5 * scale} />
            <circle cx={tx} cy={ty} r={3 * scale} fill="#fff" />
          </>
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: align === 'left' ? x : undefined,
          right: align === 'right' ? 1080 - x : undefined,
          top: y,
          opacity: txt,
          transform: `translateY(${(1 - txt) * 10}px)`,
          fontFamily: HUD_FONT,
          color: '#fff',
          textAlign: align,
          textShadow: shadow,
          lineHeight: 1,
        }}
      >
        <div style={{fontSize: 22 * scale, fontWeight: 700, letterSpacing: 3 * scale, opacity: 0.92}}>{label}</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 6 * scale, justifyContent: align === 'left' ? 'flex-start' : 'flex-end', marginTop: 4 * scale}}>
          <span style={{fontSize: 74 * scale, fontWeight: 700, letterSpacing: -0.5}}>{shown}</span>
          {unit && <span style={{fontSize: 28 * scale, fontWeight: 400, opacity: 0.95}}>{unit}</span>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
