import React from 'react';
import {interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/constants';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/**
 * The episode's fixed metric: Davi's academy ranking (top-right, whole video).
 * #312/312 (red, "ÚLTIMO") the whole time; spins down to #1 (gold) exactly on "Ranking: número um." (68.42–69.39 s).
 */
const SPIN_START = 68.42;
const SPIN_END = 69.39;

export const rankAt = (s: number) => {
  if (s < SPIN_START) return 312;
  if (s >= SPIN_END) return 1;
  const k = (s - SPIN_START) / (SPIN_END - SPIN_START);
  return Math.max(1, Math.round(312 * Math.pow(1 - k, 2.2)));
};

export const RankMeter: React.FC<{visibleUntil?: number}> = ({visibleUntil = 78.8}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  if (s > visibleUntil) return null;
  const r = rankAt(s);
  const won = s >= SPIN_END;
  const spinning = s >= SPIN_START && !won;
  const col = won ? '#ffd23a' : '#ff5a5a';
  const pop = won ? spring({frame: frame - Math.round(SPIN_END * FPS), fps: FPS, config: {damping: 9, mass: 0.6}}) : 0;
  const scale = (won ? 1 + 0.25 * (1 - pop) + 0.08 * pop : 1) * interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const jit = spinning ? (random(`rk${frame}`) - 0.5) * 6 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        right: 40,
        width: 330,
        padding: '14px 18px 16px',
        borderRadius: 18,
        background: 'rgba(12,16,34,0.62)',
        border: `2px solid ${col}`,
        boxShadow: won ? `0 0 34px ${col}` : '0 6px 18px rgba(0,0,0,0.35)',
        transform: `translate(${jit}px,0) scale(${scale})`,
        transformOrigin: 'top right',
        color: '#fff',
      }}
    >
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.85, whiteSpace: 'nowrap'}}>🏆 RANKING DA ACADEMIA</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 76, lineHeight: 1.05, color: col}}>
        #{r}
        <span style={{fontSize: 30, marginLeft: 8, color: '#fff', opacity: 0.7}}>/ 312</span>
      </div>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: col}}>{won ? '★ NÚMERO 1 ★' : spinning ? 'SUBINDO…' : 'ÚLTIMO LUGAR'}</div>
    </div>
  );
};
