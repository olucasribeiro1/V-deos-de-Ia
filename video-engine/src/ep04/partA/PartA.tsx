import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import type {ShotP} from './kit';
import * as P from './shotsPower';
import * as S from './shotsScience';
import * as F from './shotsFrog';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), shared with the SFX list. */
const REG: Record<string, React.FC<ShotP>> = {
  open: P.SOpen,
  orbit: P.SOrbit,
  leve: P.SLeve,
  grab: P.SGrab,
  car: P.SCar,
  side: P.SSide,
  swipe: P.SSwipe,
  erro: P.SErro,
  drawer: P.SDrawer,
  rub: S.SRub,
  lobes: S.SLobes,
  lines: S.SLines,
  graph: S.SGraph,
  lanes: S.SLanes,
  eight: S.SEight,
  orbit2: S.SOrbit2,
  close: S.SClose,
  table: S.STable,
  stick: S.SStick,
  grudam: S.SGrudam,
  nope: S.SNope,
  frustr: S.SFrustr,
  idea: F.SIdea,
  universe: F.SUniverse,
  wobble: F.SWobble,
  water: F.SWater,
  tu: F.STu,
  year: F.SYear,
  lab: F.SLab,
  float: F.SFloat,
  sixteen: F.SSixteen,
  ruler: F.SRuler,
  earth: F.SEarth,
  train: F.STrain,
  drop: F.SDrop,
  neighbor: F.SNeighbor,
  annoyed: F.SAnnoyed,
};

const END = f(PARTS.A.end);

/** Part A (0–43.88 s, L1–L7): 37 cuts on word starts. Local frame 0 = absolute 0. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s, i) => {
      const from = f(s.start);
      const to = i + 1 < shots.length ? f(shots[i + 1].start) : END;
      const Comp = REG[s.id];
      if (!Comp) return null;
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <Comp from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
