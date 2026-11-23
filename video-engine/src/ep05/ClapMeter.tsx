import React from 'react';
import {interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/constants';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/** Fixed metric (top-right): ESTALOS (jump claps). 0 most of the video; 1→30 in the climax (42.0–44.0 s, "trinta saltos em dois segundos"), 31 on "trigésimo primeiro" (48.6 s). */
export const clapsAt = (s: number) => {
  if (s < 42.0) return 0;
  if (s < 47.4) return Math.min(30, Math.max(1, Math.round(interpolate(s, [42.0, 44.0], [1, 30], {extrapolateRight: 'clamp'}))));
  if (s < 48.6) return 30;
  return 31;
};

export const ClapMeter: React.FC<{visibleUntil?: number}> = ({visibleUntil = 76.8}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  if (s > visibleUntil) return null;
  const n = clapsAt(s);
  const climax = s >= 42.0 && s < 48.0;
  const col = n >= 31 ? '#3be08a' : n > 0 ? '#ff5a5a' : '#7fb2ff';
  const jit = climax ? (random(`cl${frame}`) - 0.5) * 8 : 0;
  const pop = n === 31 ? spring({frame: frame - Math.round(48.6 * FPS), fps: FPS, config: {damping: 9, mass: 0.6}}) : 1;
  const intro = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 54, right: 40, width: 300, padding: '14px 18px 14px', borderRadius: 18, background: 'rgba(12,16,34,0.66)', border: `2px solid ${col}`, boxShadow: climax ? `0 0 26px ${col}` : '0 6px 18px rgba(0,0,0,0.35)', transform: `translate(${jit}px,0) scale(${intro * (n === 31 ? 1 + 0.2 * (1 - pop) : 1)})`, transformOrigin: 'top right', color: '#fff'}}>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.85, whiteSpace: 'nowrap'}}>💥 ESTALOS</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 74, lineHeight: 1.05, color: col}}>{n}</div>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: col}}>{n === 31 ? '✓ PEGOU A LIA' : climax ? 'MICROFONES: ERRO' : 'MICROFONES ATIVOS'}</div>
    </div>
  );
};
