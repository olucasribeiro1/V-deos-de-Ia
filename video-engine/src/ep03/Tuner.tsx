import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/**
 * Guitar-tuner style frequency readout shown when Davi uses his power.
 * Needle sweeps from `fromHz` and locks on `hz` (turns green + "TRAVADO" when locked).
 * Place it inside a shot: x,y = top-left px; from/to = local frames; lockAt = local frame when it locks.
 */
export const Tuner: React.FC<{
  hz: number;
  note?: string;
  x: number;
  y: number;
  from: number;
  to?: number;
  lockAt?: number;
  fromHz?: number;
  scale?: number;
}> = ({hz, note, x, y, from, to = 99999, lockAt, fromHz, scale = 1}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const lk = lockAt ?? from + 18;
  const startHz = fromHz ?? Math.round(hz * 0.55);
  const wobble = frame < lk ? Math.sin(frame * 0.9) * hz * 0.04 : 0;
  const cur = Math.round(interpolate(frame, [from, lk], [startHz, hz], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) + wobble);
  const locked = frame >= lk;
  const col = locked ? '#3be08a' : '#ffd23a';
  const needle = interpolate(cur, [hz * 0.5, hz, hz * 1.5], [-60, 0, 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = interpolate(frame, [from, from + 5], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(frame, [to - 4, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 320, opacity: op, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      <div style={{padding: '12px 16px 14px', borderRadius: 16, background: 'rgba(10,14,30,0.72)', border: `2px solid ${col}`, color: '#fff'}}>
        <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 3, opacity: 0.85}}>〰 FREQUÊNCIA</div>
        <svg width={288} height={70} viewBox="-144 -64 288 70">
          {[-60, -30, 0, 30, 60].map((a) => (
            <line key={a} x1={Math.sin((a * Math.PI) / 180) * 50} y1={-Math.cos((a * Math.PI) / 180) * 50} x2={Math.sin((a * Math.PI) / 180) * 60} y2={-Math.cos((a * Math.PI) / 180) * 60} stroke="#fff" strokeOpacity={a === 0 ? 0.9 : 0.4} strokeWidth={a === 0 ? 4 : 2} />
          ))}
          <line x1={0} y1={0} x2={Math.sin((needle * Math.PI) / 180) * 56} y2={-Math.cos((needle * Math.PI) / 180) * 56} stroke={col} strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={0} r={6} fill={col} />
        </svg>
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 58, lineHeight: 1, color: col}}>
          {cur}
          <span style={{fontSize: 26, marginLeft: 6}}>Hz</span>
          {note && locked ? <span style={{fontSize: 30, marginLeft: 12, color: '#fff'}}>· {note}</span> : null}
        </div>
        <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: col, marginTop: 2}}>{locked ? '✓ TRAVADO' : 'PROCURANDO…'}</div>
      </div>
    </div>
  );
};
