import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import {ShotP, T0} from './rig';
import * as E from './shotsEnd';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), so audio + video share one list. */
const REG: Record<string, React.FC<ShotP>> = {
  choque: E.SChoque,
  um: E.SUm,
  trofeu: E.STrofeu,
  caderno: E.SCaderno,
  terremoto: E.STerremoto,
  etu: E.SETu,
  roubado: E.SRoubado,
  comenta: E.SComenta,
  black: E.SBlack,
};

/** Part B (42.89–79.85 s, L9–L16): cuts on word starts, hard cut to black at 78.8 s. Local frame 0 = PARTS.B.start. */
export const PartB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s) => {
      const C = REG[s.id];
      if (!C) return null;
      const from = f(s.start) - T0;
      const to = f(s.end) - T0;
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <C from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const PART_B_FRAMES = f(PARTS.B.end) - T0;
