import React from 'react';
import {SleeveArm} from '../../characters/Closeups';
import {DAVI_OUTFIT} from '../../characters/Davi';
import type {Lighting} from '../../characters/types';

/**
 * Davi's big close-up arm (hoodie sleeve + open palm) entering from off-screen.
 * (x0,y0) = where the sleeve starts (off-screen), `ang` = pointing direction (0 = down, 90 = screen-right,
 * -90 = screen-left, 180 = up), `len` = distance to the wrist. Palm centre ≈ len + 300 along the direction.
 */
export const BigArm: React.FC<{x0: number; y0: number; ang: number; len: number; tense?: number; light?: Lighting; s?: number}> = ({x0, y0, ang, len, tense = 0, light, s = 1}) => (
  <g transform={`translate(${x0},${y0}) rotate(${-ang}) scale(${s})`}>
    <SleeveArm x={0} wristY={len} sleeve={DAVI_OUTFIT.top} skin={DAVI_OUTFIT.skin} light={light} tense={tense} />
  </g>
);

/** Palm centre of a BigArm. */
export const palmOf = (x0: number, y0: number, ang: number, len: number, s = 1): [number, number] => {
  const d = (len + 300) * s;
  const a = (ang * Math.PI) / 180;
  return [x0 + Math.sin(a) * d, y0 + Math.cos(a) * d];
};
