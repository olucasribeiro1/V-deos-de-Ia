import React from 'react';
import {interpolate, random, spring, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/constants';
import {CAPTION_FONT, HUD_FONT} from '../lib/fonts';
import {wordAt} from './timeline';

const ci = (s: number, a: number[], b: number[]) => interpolate(s, a, b, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/* Key instants (absolute s) */
const T_ROJAO = wordAt('L10', 16); // "rojão"
const T_BOOM = wordAt('L15', 15); // "explode"
const T_GREEN = wordAt('L5', 5); // "lança"
const T_GREEN_END = wordAt('L6', 0);
const T_CAP = wordAt('L6', 14); // "energia" → reveals 440 kJ capacity

/** Energy released (kJ) at absolute second s. */
export const releasedAt = (s: number) => {
  if (s >= T_BOOM) return 4.4;
  if (s >= T_ROJAO && s < T_ROJAO + 1.6) return 4.4;
  if (s >= T_GREEN && s < T_GREEN_END) return 0;
  return 0.01;
};

/** Top-right: 🍌 ENERGIA LIBERADA (kJ). */
export const EnergyMeter: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const v = releasedAt(s);
  const locked = s >= T_GREEN && s < T_GREEN_END;
  const hot = v > 1;
  const boomK = s >= T_BOOM ? 1 - ci(s, [T_BOOM, T_BOOM + 1.2], [0, 1]) : s >= T_ROJAO && s < T_ROJAO + 1.6 ? 1 - ci(s, [T_ROJAO, T_ROJAO + 1.2], [0, 1]) : 0;
  const jit = boomK > 0 ? (random(`em${frame}`) - 0.5) * 14 * boomK : 0;
  const col = locked ? '#ff5a5a' : hot ? '#ffd23a' : '#b8ec6a';
  const intro = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const fill = locked ? 0 : Math.min(1, v / 4.4);
  const cap = s >= T_CAP;
  const txt = v >= 1 ? v.toFixed(1).replace('.', ',') : v.toFixed(2).replace('.', ',');
  return (
    <div style={{position: 'absolute', top: 54, right: 40, width: 310, padding: '14px 18px', borderRadius: 18, background: 'rgba(16,14,6,0.66)', border: `2px solid ${col}`, boxShadow: boomK > 0 ? `0 0 ${30 * boomK + 10}px ${col}` : '0 6px 18px rgba(0,0,0,0.35)', transform: `translate(${jit}px,0) scale(${intro * (1 + 0.15 * boomK)})`, transformOrigin: 'top right', color: '#fff'}}>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.9, whiteSpace: 'nowrap'}}>🍌 ENERGIA LIBERADA</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 70, lineHeight: 1.05, color: col}}>
        {txt}
        <span style={{fontSize: 34, marginLeft: 8}}>kJ</span>
      </div>
      <div style={{height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginTop: 4}}>
        <div style={{width: `${Math.max(2, fill * 100)}%`, height: '100%', background: col}} />
      </div>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: col, marginTop: 6, whiteSpace: 'nowrap'}}>
        {locked ? '🔒 TRAVADA (VERDE)' : hot ? '1% DE 440 kJ' : cap ? 'NA BANANA: 440 kJ' : 'QUASE NADA'}
      </div>
    </div>
  );
};

const L4B = wordAt('L4', 4);
const L5R = wordAt('L5', 15);
const L16 = wordAt('L16', 0);
const L16N = wordAt('L16', 4);

export const laughsAt = (s: number) => {
  if (s < L4B) return 0;
  if (s < L5R) return Math.round(ci(s, [L4B, L4B + 1.6], [1, 47]));
  if (s < L16) return Math.round(ci(s, [L5R, L5R + 1.0], [47, 312]));
  if (s < L16N) return 312;
  return 0;
};

/** Top-left: 😂 RISADAS (visible during the humiliation and the payoff). */
export const LaughCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const on = (s >= wordAt('L4', 0) && s < wordAt('L6', 0) + 0.3) || (s >= L16 && s < wordAt('L17', 0));
  if (!on) return null;
  const n = laughsAt(s);
  const zero = s >= L16N;
  const pop = zero ? spring({frame: frame - Math.round(L16N * FPS), fps: FPS, config: {damping: 9, mass: 0.6}}) : 1;
  const col = zero ? '#3be08a' : '#ff8a3a';
  return (
    <div style={{position: 'absolute', top: 54, left: 40, width: 250, padding: '14px 18px', borderRadius: 18, background: 'rgba(16,14,6,0.66)', border: `2px solid ${col}`, color: '#fff', transform: `scale(${zero ? 1 + 0.25 * (1 - pop) : 1})`, transformOrigin: 'top left'}}>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.9}}>😂 RISADAS</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 70, lineHeight: 1.05, color: col}}>{n}</div>
      {zero && <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: col}}>SILÊNCIO TOTAL</div>}
    </div>
  );
};
