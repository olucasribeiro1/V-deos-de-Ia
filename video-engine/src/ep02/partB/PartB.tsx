import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import {ShotP, T0} from './rig';
import * as S1 from './shots1';
import * as S2 from './shots2';
import * as S3 from './shots3';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), so audio + video share one list. */
const REG: Record<string, React.FC<ShotP>> = {
  habit: S1.SHabit,
  stall: S1.SStall,
  plaza: S1.SPlaza,
  diagram: S1.SDiagram,
  install: S1.SInstall,
  slam: S1.SSlam,
  gallery: S1.SGallery,
  morph: S1.SMorph,
  terrace: S2.STerrace,
  arrive: S2.SArrive,
  stare: S2.SStare,
  liaReveal: S2.SLiaReveal,
  liaLaugh: S2.SLiaLaugh,
  daviLaugh: S2.SDaviLaugh,
  heels: S2.SHeels,
  closing: S2.SClosing,
  liaAsk: S2.SLiaAsk,
  ots: S2.SOts,
  depende: S2.SDepende,
  three: S3.SThree,
  cities: S3.SCities,
  miles: S3.SMiles,
  fourth: S3.SFourth,
  again: S3.SAgain,
  enter: S3.SEnter,
  sink: S3.SSink,
  glove: S3.SGlove,
  mirror: S3.SMirror,
  rocha: S3.SRocha,
};

const END = f(PARTS.B.end) - T0;

/** Part B (41.53–75.94 s, L9–L16): 29 cuts on word starts. Local frame 0 = PARTS.B.start. */
export const PartB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s, i) => {
      const from = f(s.start) - T0;
      const to = i + 1 < shots.length ? f(shots[i + 1].start) - T0 : END;
      const C = REG[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <C from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
