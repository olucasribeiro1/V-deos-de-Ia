import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/constants';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/** Fixed metric (top-right, whole video): reservoir level %. Keyframes in ABSOLUTE seconds. */
const KF: [number, number][] = [
  [0, 5], [12.3, 5], [13.3, 100], // hook: SP 2015 ~5% → refills when the explanation starts
  [27.9, 100], [36.5, 72], [47.6, 58], [54.9, 42], // causes: losses, deforestation, pollution+drought
  [55.5, 42], [70.0, 30], [82.4, 24], [93.4, 18], [103.1, 14], // Salvador risks
  [103.3, 14], [116.0, 35], [128.9, 55], [137.4, 68], [148.4, 80], [153.9, 86], [162.9, 92], // solutions
];
export const levelAt = (s: number) =>
  interpolate(s, KF.map((k) => k[0]), KF.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const colorFor = (v: number) => (v < 20 ? '#ff4d4d' : v < 45 ? '#ffb02e' : v < 70 ? '#ffd23a' : '#3be08a');

export const ReservoirMeter: React.FC<{visibleUntil?: number}> = ({visibleUntil = 163.5}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  if (s > visibleUntil) return null;
  const v = levelAt(s);
  const col = colorFor(v);
  const low = v < 20;
  const blink = low ? 0.75 + 0.25 * Math.sin(s * 8) : 1;
  const intro = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const wave = Math.sin(s * 3) * 3;
  return (
    <div style={{position: 'absolute', top: 54, right: 40, width: 330, padding: '14px 18px 16px', borderRadius: 18, background: 'rgba(8,20,40,0.66)', border: `2px solid ${col}`, boxShadow: low ? `0 0 26px ${col}` : '0 6px 18px rgba(0,0,0,0.35)', transform: `scale(${intro})`, transformOrigin: 'top right', color: '#fff', opacity: blink}}>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.85, whiteSpace: 'nowrap'}}>💧 NÍVEL DO RESERVATÓRIO</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
        <svg width={64} height={84} viewBox="0 0 64 84">
          <rect x={2} y={2} width={60} height={80} rx={10} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
          <clipPath id="tankclip"><rect x={4} y={4} width={56} height={76} rx={8} /></clipPath>
          <g clipPath="url(#tankclip)">
            <path d={`M0 ${80 - (v / 100) * 76 + wave * 0.3} Q16 ${80 - (v / 100) * 76 - 3 + wave} 32 ${80 - (v / 100) * 76} T64 ${80 - (v / 100) * 76} V84 H0 Z`} fill={col} opacity={0.85} />
          </g>
        </svg>
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 74, lineHeight: 1, color: col}}>
          {Math.round(v)}<span style={{fontSize: 34, marginLeft: 4}}>%</span>
        </div>
      </div>
    </div>
  );
};
