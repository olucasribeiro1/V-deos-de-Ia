import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/constants';
import {HUD_FONT, CAPTION_FONT} from '../lib/fonts';

/**
 * Fixed metric (top-right, whole video): Davi's magnetic field in tesla, on a LOG scale,
 * with reference marks (Terra, ímã de geladeira, ressonância, sapo 16 T). Keyframes: ABSOLUTE seconds.
 */
const KF: [number, number][] = [
  [0, 0.00005], [0.8, 0.02], [3.6, 0.05], [5.4, 0.3], [6.2, 0.4], [6.7, 0.00005], // grabs clips/keys/coins, strains on the car
  [8.2, 0.00005], [8.7, 0.08], [9.6, 0.00005], // wipes the card
  [11.1, 0.00005], [13.0, 0.05], [15.4, 0.05], [17.4, 0.006], [19.9, 0.05], [20.4, 0.00005], // falloff demo
  [22.0, 0.05], [25.3, 0.05], [25.8, 0.00005], // metals test
  [27.6, 0.00005], [30.4, 0.5], [31.5, 0.5], [32.1, 0.00005], // diamagnetism
  [33.1, 0.00005], [35.9, 16], [38.1, 16], [38.6, 0.00005], // lab frog 16 T (lab magnet, shown as reference)
  [39.5, 2], [40.4, 8], [41.6, 14], [43.2, 16], [43.8, 0.00005], // Davi trains: drop, then neighbor's frog
  [49.8, 0.00005], [57.4, 0.00005], // diner: Lenz pulses handled below
  [63.5, 0.00005], [64.2, 0.3], [65.1, 0.3], [65.8, 0.00005], // pulls the chain
  [72.0, 0.00005], [72.6, 0.2], [73.4, 0.00005], // card dies again
  [79.5, 0.00005],
];
const base = (s: number) =>
  Math.pow(10, interpolate(s, KF.map((k) => k[0]), KF.map((k) => Math.log10(k[1])), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
/** Lenz trick 50.5–58.5 s: field switching on/off very fast */
export const fieldAt = (s: number) => {
  if (s >= 50.5 && s < 58.5) return Math.sin(s * 40) > 0 ? 1.2 : 0.00005;
  return base(s);
};

const fmt = (v: number) => {
  if (v >= 1) return v.toLocaleString('pt-BR', {maximumFractionDigits: 1});
  if (v >= 0.01) return v.toLocaleString('pt-BR', {maximumFractionDigits: 2});
  if (v >= 0.001) return v.toLocaleString('pt-BR', {maximumFractionDigits: 3});
  return v.toLocaleString('pt-BR', {maximumFractionDigits: 5});
};
const REFS: [number, string][] = [
  [0.00005, 'TERRA'],
  [0.005, 'GELADEIRA'],
  [1, 'RM'],
  [16, 'SAPO'],
];
const pos = (v: number) => interpolate(Math.log10(v), [Math.log10(0.00003), Math.log10(25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const FieldMeter: React.FC<{visibleUntil?: number}> = ({visibleUntil = 78.6}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  if (s > visibleUntil) return null;
  const v = fieldAt(s);
  const p = pos(v);
  const col = v >= 3 ? '#ff5ad1' : v >= 0.01 ? '#ffd23a' : '#7fb2ff';
  const hot = v >= 3;
  const jit = hot ? (random(`fm${frame}`) - 0.5) * 5 : 0;
  const intro = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 54, right: 40, width: 330, padding: '14px 18px 14px', borderRadius: 18, background: 'rgba(12,16,34,0.66)', border: `2px solid ${col}`, boxShadow: hot ? `0 0 26px ${col}` : '0 6px 18px rgba(0,0,0,0.35)', transform: `translate(${jit}px,0) scale(${intro})`, transformOrigin: 'top right', color: '#fff'}}>
      <div style={{fontFamily: HUD_FONT, fontWeight: 700, fontSize: 20, letterSpacing: 2, opacity: 0.85, whiteSpace: 'nowrap'}}>🧲 CAMPO DO DAVI</div>
      <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 62, lineHeight: 1.05, color: col, whiteSpace: 'nowrap'}}>
        {fmt(v)}<span style={{fontSize: 30, marginLeft: 6}}>T</span>
      </div>
      <div style={{position: 'relative', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.18)', marginTop: 6}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: col, borderRadius: 6}} />
        {REFS.map(([r]) => (
          <div key={r} style={{position: 'absolute', left: `${pos(r) * 100}%`, top: -3, width: 2, height: 18, background: '#fff', opacity: 0.7}} />
        ))}
      </div>
      <div style={{position: 'relative', height: 18, marginTop: 4, fontFamily: HUD_FONT, fontSize: 13, opacity: 0.75}}>
        {REFS.map(([r, l]) => (
          <span key={l} style={{position: 'absolute', left: `${pos(r) * 100}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>{l}</span>
        ))}
      </div>
    </div>
  );
};
