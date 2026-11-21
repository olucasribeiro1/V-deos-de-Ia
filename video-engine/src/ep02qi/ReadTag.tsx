import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/**
 * "Mind reading" tag that Davi's HUD puts on a person: small caps label + big %, leader line to the face.
 * Kaiser-style: yellow energy accent. `error` renders the glitchy "LEITURA 0%" / "ERRO ???".
 * x,y = tag top-left (px); tx,ty = point on the person's face; from/to = local frames.
 */
export const ReadTag: React.FC<{
  label: string;
  pct?: number;
  text?: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  from: number;
  to?: number;
  error?: boolean;
  scale?: number;
}> = ({label, pct, text, x, y, tx, ty, from, to = 99999, error, scale = 1}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const k = frame - from;
  const line = interpolate(k, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const op = interpolate(k, [3, 8], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(frame, [to - 4, to], [1, 0], {extrapolateLeft: 'clamp'});
  const shown = text ?? (pct !== undefined ? `${Math.round(pct * interpolate(k, [3, 16], [0, 1], {extrapolateRight: 'clamp'}))}%` : '');
  const col = error ? '#ff3b3b' : '#ffd23a';
  const gl = error ? (random(`rt${frame}`) - 0.5) * 14 : 0;
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
        <line x1={x} y1={y + 30 * scale} x2={x + (tx - x) * line} y2={y + 30 * scale + (ty - y - 30 * scale) * line} stroke={col} strokeWidth={3} strokeDasharray={error ? '8 6' : undefined} opacity={0.9} />
        <circle cx={tx} cy={ty} r={10 * line} fill="none" stroke={col} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: x + gl,
          top: y,
          opacity: op,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          padding: '6px 14px 8px',
          borderRadius: 10,
          background: 'rgba(10,14,30,0.7)',
          borderLeft: `5px solid ${col}`,
          color: '#fff',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 22, letterSpacing: 2, opacity: 0.85}}>{label}</div>
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 56, lineHeight: 1, color: col}}>{shown}</div>
      </div>
    </>
  );
};
