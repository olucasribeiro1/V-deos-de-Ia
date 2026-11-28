import React from 'react';
import {random} from 'remotion';
import {HUD_FONT} from '../../lib/fonts';

/**
 * Flat silhouette of Lia (curly bun, long gown), origin at the feet, ~1000 units tall.
 * Used as the red "danger" diagram figure (L18).
 */
export const LiaSilhouette: React.FC<{color?: string; stroke?: string; lean?: number}> = ({color = '#ff3b3b', stroke = '#ffd0d0', lean = 0}) => (
  <g transform={`rotate(${lean})`}>
    <g fill={color} stroke={stroke} strokeWidth={10} strokeLinejoin="round">
      {/* gown */}
      <path d="M -70,-560 Q -60,-470 -95,-380 Q -150,-200 -190,0 L 190,0 Q 150,-200 95,-380 Q 60,-470 70,-560 Z" />
      {/* torso */}
      <path d="M -95,-760 Q -105,-660 -70,-560 L 70,-560 Q 105,-660 95,-760 Q 0,-790 -95,-760 Z" />
      {/* arms */}
      <path d="M -95,-750 Q -150,-640 -140,-520 L -112,-516 Q -112,-630 -70,-720 Z" />
      <path d="M 95,-750 Q 150,-640 140,-520 L 112,-516 Q 112,-630 70,-720 Z" />
      {/* neck + head */}
      <rect x={-22} y={-810} width={44} height={60} rx={10} />
      <ellipse cx={0} cy={-880} rx={70} ry={84} />
      {/* curly bun */}
      {[-50, -22, 8, 36, 56].map((x, i) => (
        <circle key={i} cx={x} cy={-960 - (i % 2) * 18} r={34} />
      ))}
      <circle cx={0} cy={-1000} r={46} />
    </g>
  </g>
);

/** Thermometer (vertical), centred at 0,0, height h; `temp` in °C mapped 25..40. */
export const Thermometer: React.FC<{h: number; temp: number}> = ({h, temp}) => {
  const w = h * 0.16;
  const bulbR = w * 0.9;
  const top = -h / 2;
  const bot = h / 2 - bulbR;
  const k = Math.min(1, Math.max(0, (temp - 25) / 15));
  const lvl = bot - (bot - top - w * 0.6) * k;
  const cold = temp < 35;
  const col = cold ? '#4fb6ff' : '#ff4b3e';
  const ticks = [26, 28, 30, 32, 34, 36, 38, 40];
  return (
    <g>
      <rect x={-w / 2 - 10} y={top - 10} width={w + 20} height={h - bulbR + 20} rx={w / 2 + 10} fill="#eef3f6" stroke="#9fb2bd" strokeWidth={6} />
      <circle cx={0} cy={bot + bulbR * 0.2} r={bulbR + 10} fill="#eef3f6" stroke="#9fb2bd" strokeWidth={6} />
      <rect x={-w * 0.22} y={lvl} width={w * 0.44} height={bot - lvl + bulbR * 0.3} fill={col} />
      <circle cx={0} cy={bot + bulbR * 0.2} r={bulbR * 0.8} fill={col} />
      <rect x={-w * 0.12} y={top + w * 0.2} width={w * 0.1} height={h * 0.7} rx={4} fill="#fff" opacity={0.7} />
      {ticks.map((tt) => {
        const y = bot - (bot - top - w * 0.6) * ((tt - 25) / 15);
        return (
          <g key={tt}>
            <line x1={w / 2 + 16} y1={y} x2={w / 2 + (tt % 4 === 0 ? 50 : 34)} y2={y} stroke="#e6eef2" strokeWidth={5} />
            {tt % 4 === 0 && (
              <text x={w / 2 + 62} y={y + 12} fontFamily={HUD_FONT} fontWeight={700} fontSize={34} fill="#e6eef2">
                {tt}°
              </text>
            )}
          </g>
        );
      })}
      {/* 35 °C hypothermia mark */}
      {(() => {
        const y = bot - (bot - top - w * 0.6) * ((35 - 25) / 15);
        return <line x1={-w / 2 - 40} y1={y} x2={w / 2 + 14} y2={y} stroke="#4fb6ff" strokeWidth={6} strokeDasharray="12 8" />;
      })()}
    </g>
  );
};

/** Clock face sweeping `k` (0..1) of an hour. Centred, radius r. */
export const Clock: React.FC<{r: number; k: number}> = ({r, k}) => {
  const a = k * Math.PI * 2;
  const d = k > 0.001 ? `M0,0 L0,${-r * 0.86} A${r * 0.86},${r * 0.86} 0 ${k > 0.5 ? 1 : 0} 1 ${Math.sin(a) * r * 0.86},${-Math.cos(a) * r * 0.86} Z` : '';
  return (
    <g>
      <circle r={r} fill="rgba(8,18,30,0.8)" stroke="#e6eef2" strokeWidth={8} />
      {d && <path d={d} fill="#4fb6ff" opacity={0.45} />}
      {Array.from({length: 12}).map((_, i) => {
        const b = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.sin(b) * r * 0.78} y1={-Math.cos(b) * r * 0.78} x2={Math.sin(b) * r * 0.9} y2={-Math.cos(b) * r * 0.9} stroke="#e6eef2" strokeWidth={i % 3 ? 4 : 8} />;
      })}
      <line x1={0} y1={0} x2={Math.sin(a) * r * 0.8} y2={-Math.cos(a) * r * 0.8} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <circle r={10} fill="#fff" />
    </g>
  );
};

/** Black suit "agent" map token (top-down-ish standing figure), origin at feet, height h. */
export const SuitToken: React.FC<{x: number; y: number; h: number; k?: number}> = ({x, y, h, k = 1}) => (
  <g transform={`translate(${x},${y}) scale(${(h / 100) * k})`}>
    <ellipse cx={0} cy={0} rx={22} ry={7} fill="#000" opacity={0.35} />
    <path d="M -16,0 L -14,-48 Q -18,-70 0,-74 Q 18,-70 14,-48 L 16,0 Z" fill="#17181d" stroke="#ff4b3e" strokeWidth={3} />
    <path d="M -4,-72 L 0,-56 L 4,-72 Z" fill="#fff" />
    <circle cx={0} cy={-86} r={14} fill="#c48d66" stroke="#ff4b3e" strokeWidth={3} />
    <rect x={-11} y={-90} width={22} height={6} rx={3} fill="#111" />
  </g>
);

/** Shards of a broken mirror: deterministic polygons around an impact point. */
export const crackLines = (cx: number, cy: number, n: number, len: number, seed: string) =>
  Array.from({length: n}).map((_, i) => {
    const a = (i / n) * Math.PI * 2 + (random(`${seed}-a${i}`) - 0.5) * 0.4;
    const pts: [number, number][] = [[cx, cy]];
    let x = cx;
    let y = cy;
    const segs = 5;
    for (let s = 1; s <= segs; s++) {
      const l = (len / segs) * (0.6 + random(`${seed}-l${i}-${s}`) * 0.8);
      const aa = a + (random(`${seed}-j${i}-${s}`) - 0.5) * 0.5;
      x += Math.cos(aa) * l;
      y += Math.sin(aa) * l;
      pts.push([x, y]);
    }
    return pts;
  });
