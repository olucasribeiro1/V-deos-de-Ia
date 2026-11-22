import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PARTS} from '../timeline';
import {ShotP, lf} from './kit';
import {S1, S2, S3, S4, S5, S6, S7, S8} from './shotsL7';
import {S9, S10, S11, S12, S13, S14, S15, S16, S17} from './shotsL8L9';
import {S18, S19, S20, S21, S22} from './shotsL10';

/** Shot list, absolute seconds (cut points). Mirrors shots.json. */
const SHOTS: [number, React.FC<ShotP>][] = [
  [55.51, S1], // presenter, Salvador in the rain
  [57.7, S2], // presenter + tap "de onde vem?"
  [59.95, S3], // Bahia map, Salvador pin, 60% donut
  [62.4, S4], // zoom: Pedra do Cavalo + adutora
  [64.2, S5], // river Paraguaçu
  [66.1, S6], // semi-arid
  [68.95, S7], // dam cross-section, level falls
  [71.7, S8], // ruler close-up ~30%
  [73.93, S9], // x-ray network, leaks
  [76.5, S10], // 100 drops, 54 leak
  [79.3, S11], // PERDAS 54%
  [81.1, S12], // presenter + pie "mais da metade"
  [82.58, S13], // shallow hot reservoir
  [84.7, S14], // evaporation
  [87.1, S15], // urban reservoirs
  [89.2, S16], // Joanes · Ipitanga
  [90.8, S17], // irregular houses + sewage
  [93.72, S18], // presenter on the coast
  [95.3, S19], // coastal city → tilt into ground
  [97.5, S20], // pumping, drawdown
  [99.9, S21], // salt wedge advances
  [101.9, S22], // INTRUSÃO SALINA
];

export const PartB: React.FC = () => {
  const fr = useCurrentFrame();
  const end = lf(PARTS.B.end);
  let i = SHOTS.length - 1;
  while (i > 0 && fr < lf(SHOTS[i][0])) i--;
  const [s, C] = SHOTS[i];
  const a = i === 0 ? 0 : lf(s);
  const b = i === SHOTS.length - 1 ? end : lf(SHOTS[i + 1][0]);
  return (
    <AbsoluteFill style={{background: '#0b1a2e', overflow: 'hidden'}}>
      <C fr={fr} a={a} b={b} />
    </AbsoluteFill>
  );
};
