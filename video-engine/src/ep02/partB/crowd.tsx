import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PlacedPuppet} from '../../characters/Puppet';
import type {Lighting} from '../../characters/types';
import {Flute, GALA_LIGHT, GUESTS, GalaTable, Svg} from './sets';

export type Guest = {i: number; x: number; y: number; h: number; flip?: boolean; turn?: number; flute?: boolean};

/** Back-row tables + standing guests for the Monaco terrace. `look` 0..1 turns everybody toward the camera (raised brows). */
export const TerraceCrowd: React.FC<{t: number; px?: number; look?: number; guests?: Guest[]; tables?: [number, number, number][]; light?: Lighting; dim?: number}> = ({
  t,
  px = 0,
  look = 0,
  guests = DEFAULT_GUESTS,
  tables = DEFAULT_TABLES,
  light = GALA_LIGHT,
  dim = 0,
}) => {
  const items: {y: number; node: React.ReactNode}[] = [];
  tables.forEach(([x, y, s], k) =>
    items.push({
      y,
      node: (
        <Svg key={'t' + k}>
          <GalaTable x={x + px * (y / 1300)} y={y} s={s} t={t} seed={k} />
        </Svg>
      ),
    }),
  );
  guests.forEach((g, k) => {
    const sway = Math.sin(t * 1.6 + k * 1.3);
    const turn = (g.turn ?? 0) * (1 - look);
    items.push({
      y: g.y,
      node: (
        <PlacedPuppet
          key={'g' + k}
          outfit={GUESTS[g.i % GUESTS.length]}
          x={g.x + px * (g.y / 1300)}
          y={g.y}
          height={g.h}
          flip={g.flip}
          light={light}
          pose={{bob: sway * 4, headTilt: sway * 2 + look * (g.x < 540 ? 4 : -4), facing: turn + look * (g.x < 540 ? 0.35 : -0.35), shR: g.flute ? -10 : 8, elR: g.flute ? -120 : -8}}
          expr={{smile: 0.3 * (1 - look), browRaise: look * 0.9, eyesWide: look * 0.4, lookX: look * (g.x < 540 ? 0.8 : -0.8), mouthOpen: look * 0.15}}
          handProps={g.flute ? {R: <Flute x={0} y={20} s={1.4} />} : undefined}
        />
      ),
    });
  });
  items.sort((a, b) => a.y - b.y);
  return <AbsoluteFill style={{filter: dim ? `brightness(${1 - dim})` : undefined}}>{items.map((it) => it.node)}</AbsoluteFill>;
};

export const DEFAULT_TABLES: [number, number, number][] = [
  [80, 1250, 0.45],
  [520, 1240, 0.42],
  [960, 1255, 0.46],
  [260, 1500, 0.75],
  [860, 1520, 0.78],
];

export const DEFAULT_GUESTS: Guest[] = [
  {i: 0, x: -40, y: 1230, h: 420, flute: true},
  {i: 1, x: 200, y: 1236, h: 400, turn: 0.4},
  {i: 2, x: 330, y: 1226, h: 430, turn: -0.4, flute: true},
  {i: 3, x: 700, y: 1236, h: 400, turn: 0.4, flute: true},
  {i: 4, x: 820, y: 1230, h: 440, turn: -0.4},
  {i: 5, x: 1120, y: 1240, h: 410, flute: true},
  {i: 6, x: 60, y: 1480, h: 640, turn: 0.4},
  {i: 7, x: 1060, y: 1490, h: 620, turn: -0.4, flute: true},
];
