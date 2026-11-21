import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import type {ShotP} from './kit';
import * as C from './shotsChase';
import * as S from './shotsScience';
import * as X from './shotsXavier';
import * as K from './shotsKid';
import * as Hh from './shotsHeat';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), shared with the SFX list. */
const REG: Record<string, React.FC<ShotP>> = {
  run: C.SRun,
  vault: C.SVault,
  agents: C.SAgents,
  freeze: C.SFreeze,
  eye: C.SEye,
  predict: C.SPredict,
  telepathy: S.STelepathy,
  math: S.SMath,
  muscles: S.SMuscles,
  think: S.SThink,
  frames: S.SFrames,
  micro: S.SMicro,
  real: S.SReal,
  seesall: X.SSeesAll,
  prof: X.SProf,
  helmet: X.SHelmet,
  amador: X.SAmador,
  shrug: X.SShrug,
  home5: K.SHome5,
  mom: K.SMom,
  noel: K.SNoel,
  lie: K.SLie,
  kidface: K.SKidFace,
  truco: K.STruco,
  slap: K.SSlap,
  churras: K.SChurras,
  casino: Hh.SCasino,
  carry: Hh.SCarry,
  banned: Hh.SBanned,
  problem: Hh.SProblem,
  brain: Hh.SBrain,
  one: Hh.SOne,
  temp: Hh.STemp,
  crowd: Hh.SCrowd,
  hot: Hh.SHot,
  wink: Hh.SWink,
};

const END = f(PARTS.A.end);

/** Part A (0–41.22 s, L1–L8): 36 cuts on word starts. Local frame 0 = absolute 0. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s, i) => {
      const from = f(s.start);
      const to = i + 1 < shots.length ? f(shots[i + 1].start) : END;
      const Comp = REG[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <Comp from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
