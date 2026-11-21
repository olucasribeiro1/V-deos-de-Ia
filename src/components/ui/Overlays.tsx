import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

const FONT = '"DejaVu Sans", Arial, sans-serif';
const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 3600)).padStart(2, '0')}:${String(Math.floor((v % 3600) / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

/** Contagem regressiva "RAFAEL CHEGA EM" (retenção): canto superior direito. Quebra para ??:??:?? quando broken. */
export const Countdown: React.FC<{remaining: number; t: number; showAt: number; brokenAt?: number}> = ({remaining, t, showAt, brokenAt}) => {
  if (t < showAt) return null;
  const broken = brokenAt !== undefined && t >= brokenAt;
  const glitch = broken && Math.floor(t * 12) % 3 === 0;
  const op = interpolate(t - showAt, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', right: 40, top: 36, opacity: op, textAlign: 'right', fontFamily: FONT}}>
      <div style={{fontSize: 15, fontWeight: 800, letterSpacing: 3, color: broken ? '#ff6a6a' : '#f4f1ea', textShadow: '0 2px 0 #000'}}>
        {broken ? 'SEM CONTATO COM RAFAEL' : 'RAFAEL CHEGA EM'}
      </div>
      <div
        style={{
          fontFamily: '"DejaVu Sans Mono", monospace',
          fontSize: 40,
          fontWeight: 700,
          color: broken ? '#ff3b3b' : '#ffd24a',
          background: 'rgba(10,10,12,0.6)',
          padding: '2px 12px',
          borderRight: `6px solid ${broken ? '#ff3b3b' : '#d42a22'}`,
          transform: glitch ? 'translateX(-4px) skewX(-6deg)' : undefined,
        }}
      >
        {broken ? (glitch ? '0?:4?:1?' : '??:??:??') : fmt(remaining - (t - showAt))}
      </div>
    </div>
  );
};

/** Card educativo de sobrevivência: canto inferior esquerdo, acima da legenda; identifica a fonte. */
export const TipCard: React.FC<{title: string; text: string; src: string; t: number; dur: number}> = ({title, text, src, t, dur}) => {
  const k = interpolate(t, [0, 0.4, dur - 0.4, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 120,
          width: 380,
          opacity: k,
          transform: `translateX(${(1 - k) * -30}px)`,
          background: 'rgba(12,16,20,0.82)',
          borderLeft: '6px solid #3fb37f',
          borderRadius: 6,
          padding: '12px 16px',
          fontFamily: FONT,
          color: '#f4f1ea',
        }}
      >
        <div style={{fontSize: 13, fontWeight: 800, letterSpacing: 2, color: '#7fe0b0'}}>📘 DICA REAL DE SOBREVIVÊNCIA</div>
        <div style={{fontSize: 22, fontWeight: 900, marginTop: 4}}>{title}</div>
        <div style={{fontSize: 17, lineHeight: 1.3, marginTop: 6}}>{text}</div>
        <div style={{fontSize: 12, marginTop: 8, opacity: 0.7}}>Fonte: {src}</div>
      </div>
    </AbsoluteFill>
  );
};
