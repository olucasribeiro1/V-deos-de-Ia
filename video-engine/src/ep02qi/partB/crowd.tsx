import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {clamp, lerp} from '../../lib/anim';
import {HUD_FONT} from '../../lib/fonts';
import {METRO_LIGHT, Pup, Svg, commuter} from './kit';

/* ------------------------------------------------------------------ top-down crowd (seen from above) */
export type TopPerson = {x: number; y: number; s: number; top: string; hair: string; ang: number; dir: number};
const TOPS = ['#3d8a6b', '#b8483e', '#5b5f9e', '#d9d4c8', '#2f3440', '#c77fa0', '#7a8c3a', '#4a4e57', '#2f4f8f', '#8a5a36'];
const HAIR = ['#24170f', '#3a2a22', '#6b4a2a', '#111', '#8b8a8c', '#a8562a', '#d79f78'];

/** Deterministic grid of ~n people covering the 1080×1920 frame (with margin). */
export const topPeople = (seed = 'tc', cols = 15, rows = 22): TopPerson[] => {
  const out: TopPerson[] = [];
  const dx = 1240 / cols;
  const dy = 2080 / rows;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const q = (k: string) => random(`${seed}${r}-${c}${k}`);
      out.push({
        x: -80 + c * dx + (r % 2) * dx * 0.5 + (q('x') - 0.5) * dx * 0.5,
        y: -80 + r * dy + (q('y') - 0.5) * dy * 0.5,
        s: 0.85 + q('s') * 0.3,
        top: TOPS[Math.floor(q('t') * TOPS.length)],
        hair: HAIR[Math.floor(q('h') * HAIR.length)],
        ang: (q('a') - 0.5) * 60,
        dir: q('d') < 0.5 ? -1 : 1,
      });
    }
  return out;
};

/**
 * Crowd from above. `t` seconds (people drift up/down), `push(p)` returns an extra [dx,dy] offset
 * (used to open the gap), `tags` 0..1 shows the tiny reading tags (staggered pop), `red` 0..1 turns them red,
 * `arrows` 0..1 shows each person's predicted direction.
 */
export const TopCrowd: React.FC<{
  t: number;
  people: TopPerson[];
  scale?: number;
  push?: (p: TopPerson) => [number, number];
  tags?: number;
  red?: number;
  arrows?: number;
  davi?: {x: number; y: number; ang?: number} | null;
  pathD?: string;
  pathK?: number;
}> = ({t, people, scale = 1, push, tags = 0, red = 0, arrows = 0, davi = null, pathD, pathK = 0}) => {
  return (
    <AbsoluteFill style={{background: '#8d8a82'}}>
      <Svg>
        {/* floor tiles */}
        {Array.from({length: 14}).map((_, i) => (
          <line key={i} x1={i * 90} y1={0} x2={i * 90} y2={1920} stroke="#7a776f" strokeWidth={3} />
        ))}
        {Array.from({length: 22}).map((_, i) => (
          <line key={'h' + i} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke="#7a776f" strokeWidth={3} />
        ))}
        {pathD && pathK > 0 && (
          <g opacity={pathK}>
            <path d={pathD} stroke="#3dff8a" strokeWidth={170 * scale} fill="none" strokeLinecap="round" opacity={0.45} />
            <path d={pathD} stroke="#3dff8a" strokeWidth={10} fill="none" strokeDasharray="30 20" strokeDashoffset={-t * 300} />
          </g>
        )}
        {people.map((p, i) => {
          const drift = Math.sin(t * 0.8 + i) * 6 + p.dir * t * 22;
          const [ox, oy] = push ? push(p) : [0, 0];
          const x = p.x + ox;
          const y = p.y + drift + oy;
          const s = p.s * scale;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${p.ang})`}>
              <ellipse cx={4} cy={8} rx={46 * s} ry={26 * s} fill="#000" opacity={0.18} />
              <ellipse cx={0} cy={0} rx={44 * s} ry={24 * s} fill={p.top} />
              <circle cx={0} cy={0} r={19 * s} fill={p.hair} />
              <circle cx={-5 * s} cy={-6 * s} r={6 * s} fill="#fff" opacity={0.15} />
            </g>
          );
        })}
        {davi && (
          <g transform={`translate(${davi.x},${davi.y}) rotate(${davi.ang ?? 0})`}>
            <circle r={80 * scale} fill="#ffd23a" opacity={0.25} />
            <ellipse cx={0} cy={0} rx={46 * scale} ry={26 * scale} fill="#e0a92a" stroke="#ffd23a" strokeWidth={4} />
            <circle cx={0} cy={0} r={20 * scale} fill="#24170f" />
            <path d={`M ${-8 * scale},${-18 * scale} Q 0,${-30 * scale} ${10 * scale},${-16 * scale}`} fill="#24170f" />
          </g>
        )}
        {(arrows > 0 || tags > 0) &&
          people.map((p, i) => {
            const drift = Math.sin(t * 0.8 + i) * 6 + p.dir * t * 22;
            const [ox, oy] = push ? push(p) : [0, 0];
            const x = p.x + ox;
            const y = p.y + drift + oy;
            const pk = clamp(tags * 1.6 - random(`tg${i}`) * 0.6);
            const col = red > random(`tr${i}`) ? '#ff3b3b' : '#ffd23a';
            const pct = 50 + Math.floor(random(`tp${i}`) * 49);
            return (
              <g key={'a' + i}>
                {arrows > 0 && (
                  <g transform={`translate(${x},${y}) rotate(${p.dir > 0 ? 90 : -90})`} opacity={arrows}>
                    <line x1={0} y1={0} x2={56 * scale} y2={0} stroke="#ffd23a" strokeWidth={5} />
                    <path d={`M ${56 * scale},-12 L ${76 * scale},0 L ${56 * scale},12 Z`} fill="#ffd23a" />
                  </g>
                )}
                {pk > 0 && (
                  <g transform={`translate(${x + 14},${y - 26}) scale(${lerp(0.3, 1, pk)})`} opacity={pk}>
                    <circle cx={-14} cy={26} r={6} fill={col} />
                    <rect x={0} y={-16} width={54} height={26} rx={6} fill="rgba(10,14,30,0.75)" stroke={col} strokeWidth={2} />
                    <text x={27} y={3} textAnchor="middle" fontFamily={HUD_FONT} fontWeight={700} fontSize={18} fill={col}>
                      {pct}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
      </Svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ side-view crowd (platform) */
export type SidePerson = {i: number; x: number; y: number; h: number; ph: number};
export const sideRows = (seed: string, rows: {y: number; h: number; n: number; x0?: number; x1?: number}[]): SidePerson[][] =>
  rows.map((r, ri) =>
    Array.from({length: r.n}).map((_, k) => {
      const q = (s: string) => random(`${seed}${ri}-${k}${s}`);
      const x0 = r.x0 ?? -100;
      const x1 = r.x1 ?? 1180;
      return {i: Math.floor(q('i') * 1000), x: x0 + ((x1 - x0) * (k + 0.5)) / r.n + (q('x') - 0.5) * 60, y: r.y + (q('y') - 0.5) * 20, h: r.h * (0.92 + q('h') * 0.16), ph: q('p') * 6};
    }),
  );

/** Draw one row of commuters (jostling). `part(p)` extra x offset (to part the crowd). */
export const SideRow: React.FC<{t: number; row: SidePerson[]; px?: number; part?: (p: SidePerson) => number; blur?: number; light?: typeof METRO_LIGHT; look?: number}> = ({t, row, px = 0, part, blur, light = METRO_LIGHT, look = 0}) => (
  <>
    {row.map((p, k) => {
      const sway = Math.sin(t * 2.2 + p.ph);
      const ox = part ? part(p) : 0;
      return (
        <Pup
          key={k}
          outfit={commuter(p.i)}
          x={p.x + px + ox + sway * 6}
          y={p.y}
          height={p.h}
          light={light}
          blur={blur}
          pose={{bob: Math.abs(sway) * 6, headTilt: sway * 3, shL: -6 + sway * 4, shR: 6 + sway * 4, facing: look}}
          expr={{smile: -0.1, lookX: look, blink: Math.sin(t * 3 + p.ph) > 0.97 ? 1 : 0}}
        />
      );
    })}
  </>
);
