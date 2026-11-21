import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/constants';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/**
 * The episode's fixed metric: Davi's brain temperature, top-right corner, whole video.
 * Keyframes are ABSOLUTE seconds (synced to the narration in timing.json).
 */
const KF: [number, number][] = [
  [0, 38.0], [5.4, 38.6], // chase + "Spoiler"
  [8.6, 37.6], [16.6, 37.8], // explaining microexpressions (calm)
  [22.0, 37.2], [33.5, 37.4], // childhood flashbacks
  [36.6, 37.5], [38.6, 37.6], [39.8, 40.3], [41.0, 38.0], // heat rule demo: 1 person 37.5 → crowd 40+
  [45.1, 38.4], [48.9, 38.9], // reading agents
  [51.7, 39.1], [54.7, 39.3], // botox boss (reading 0%)
  [57.2, 39.4], [59.2, 39.6], [59.8, 40.1], [60.9, 41.0], [62.4, 41.3], // crowd: 39 → 40 → 41
  [65.6, 40.0], [69.2, 38.6], // train / platform
  [70.0, 37.6], [73.2, 37.4], [73.5, 38.7], [75.2, 38.2], [79.3, 37.8], // home: cat spike (ERRO)
];

export const brainTempAt = (s: number) =>
  interpolate(s, KF.map((k) => k[0]), KF.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const colorFor = (t: number) => {
  const k = interpolate(t, [37, 39, 40.5, 42], [0, 0.45, 0.8, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stops = [
    [70, 220, 120],
    [255, 210, 58],
    [255, 120, 40],
    [255, 45, 45],
  ];
  const i = Math.min(2, Math.floor(k * 3));
  const u = k * 3 - i;
  const c = stops[i].map((v, j) => Math.round(v + (stops[i + 1][j] - v) * u));
  return `rgb(${c.join(',')})`;
};

/** Rendered at episode level (inside Ep02Qi), uses the absolute frame. */
export const BrainMeter: React.FC<{visibleUntil?: number}> = ({visibleUntil = 78.2}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  if (s > visibleUntil) return null;
  const t = brainTempAt(s);
  const col = colorFor(t);
  const hot = t >= 40;
  const pulse = hot ? 1 + 0.06 * Math.sin(s * 18) : 1;
  const shake = t >= 40.8 ? (random(`bm${frame}`) - 0.5) * 8 : 0;
  const fill = interpolate(t, [36, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const intro = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        right: 40,
        width: 300,
        padding: '14px 18px 16px',
        borderRadius: 18,
        background: 'rgba(12,16,34,0.62)',
        border: `2px solid ${col}`,
        boxShadow: hot ? `0 0 28px ${col}` : '0 6px 18px rgba(0,0,0,0.35)',
        transform: `translate(${shake}px, ${shake * 0.6}px) scale(${pulse * intro})`,
        transformOrigin: 'top right',
        color: '#fff',
      }}
    >
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 22, letterSpacing: 3, opacity: 0.85}}>🧠 CÉREBRO DO DAVI</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 72, lineHeight: 1.05, color: col}}>
        {t.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})}
        <span style={{fontSize: 34, marginLeft: 6}}>°C</span>
      </div>
      <div style={{position: 'relative', height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.18)', marginTop: 6, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: col, borderRadius: 7}} />
        <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: '#ff2d2d'}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: HUD_FONT, fontSize: 18, opacity: 0.75, marginTop: 4}}>
        <span>36°</span>
        <span style={{color: '#ff6b6b'}}>42° PANE</span>
      </div>
    </div>
  );
};
